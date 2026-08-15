/**
 * UNIQMAG 键盘 WebHID 接入(与 uqdriver 驱动项目同一套过滤器/协议)。
 * 仅用于绑定页:授权连接 → 识别型号/固件 → 自动读取 SN。
 *
 * 获取 SN 码数据 CMD:0x71,响应为
 * Cmd + 8 字节 SN 码(大端在前) + 12 字节 UID 码(大端在前) + 16 字节 UCID 码(大端在前)。
 * 旧固件不响应时按超时处理,页面回退到手动输入。
 */

const HID_FILTERS: HIDDeviceFilter[] = [
  { vendorId: 0x2f81, productId: 0x3003, usagePage: 0xff01, usage: 0x01 },
  { vendorId: 0x2f81, productId: 0x3003, usagePage: 0x00ff, usage: 0x01 },
  { vendorId: 0x2f81, productId: 0x3002, usagePage: 0xff01, usage: 0x01 },
  { vendorId: 0x2f81, productId: 0x3002, usagePage: 0x00ff, usage: 0x01 },
];

const REPORT_SIZE = 64;
const CMD_FIRMWARE_VERSION = 0xe5;
const CMD_GET_SN = 0x71;

const SN_BYTES = 8;
const UID_BYTES = 12;
const UCID_BYTES = 16;

const VENDOR_UNIQMAG = 0x2f81;
const PID_UQ71 = 0x3002;

export type KeyboardModel = 'UQ68' | 'UQ71';

export interface KeyboardInfo {
  model: KeyboardModel;
  deviceName: string;
  firmwareVersion: string;
  /** 0x71 读到的 SN(8 字节大端,大写 HEX);固件不支持或未写号时为 null */
  sn: string | null;
  /** 0x71 读到的 UID(12 字节大端,大写 HEX) */
  uid: string | null;
  /** 0x71 读到的 UCID(16 字节大端,大写 HEX) */
  ucid: string | null;
}

export class KeyboardHidError extends Error {
  constructor(
    public readonly code: 'unsupported' | 'cancelled' | 'io',
    message: string,
  ) {
    super(message);
  }
}

export function isWebHidSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.hid);
}

function detectModel(vendorId: number, productId: number, productName: string): KeyboardModel {
  const name = productName.toUpperCase();
  if (name.includes('UQ71') || name.includes('K70') || name.includes('71')) return 'UQ71';
  if (name.includes('UQ68') || name.includes('K68') || name.includes('68')) return 'UQ68';
  if (vendorId === VENDOR_UNIQMAG && productId === PID_UQ71) return 'UQ71';
  return 'UQ68';
}

function buildPacket(cmd: number, payload: number[] = []): Uint8Array {
  const buf = new Uint8Array(REPORT_SIZE);
  buf[0] = cmd & 0xff;
  for (let i = 0; i < payload.length && i < REPORT_SIZE - 1; i++) {
    buf[1 + i] = payload[i]! & 0xff;
  }
  return buf;
}

/** 发送命令并等待首字节(或次字节)回显同一 CMD 的 input report;超时返回 null */
function sendAndWait(
  device: HIDDevice,
  cmd: number,
  timeoutMs: number,
): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (value: Uint8Array | null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      device.removeEventListener('inputreport', handler as EventListener);
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    const handler = (ev: HIDInputReportEvent) => {
      const data = new Uint8Array(ev.data.buffer, ev.data.byteOffset, ev.data.byteLength);
      if (data[0] === cmd || data[1] === cmd) finish(data);
    };
    device.addEventListener('inputreport', handler);
    device.sendReport(0, buildPacket(cmd) as BufferSource).catch(() => finish(null));
  });
}

/** 固件版本 BCD 编码:0x14 → 14 */
function bcd(byte: number): number {
  return ((byte >> 4) & 0x0f) * 10 + (byte & 0x0f);
}

function parseFirmwareVersion(data: Uint8Array): string {
  let major = 0;
  let minor = 0;
  if (data[0] === CMD_FIRMWARE_VERSION && data.length >= 3) {
    major = data[1]!;
    minor = data[2]!;
  } else if (data.length > 3 && data[1] === CMD_FIRMWARE_VERSION) {
    major = data[2]!;
    minor = data[3]!;
  }
  return `${bcd(major)}.${String(bcd(minor)).padStart(2, '0')}`;
}

interface DeviceIdentity {
  sn: string;
  uid: string;
  ucid: string;
}

/** 0x71 响应:CMD + SN(8B 大端) + UID(12B 大端) + UCID(16B 大端),按大写 HEX 输出 */
function parseIdentity(data: Uint8Array): DeviceIdentity | null {
  // 真机 input report 的 CMD 可能出现在 [0] 或 [1](与驱动项目观察一致)
  const start = data[0] === CMD_GET_SN ? 1 : data[1] === CMD_GET_SN ? 2 : -1;
  if (start < 0 || data.length < start + SN_BYTES + UID_BYTES + UCID_BYTES) return null;
  const hex = (from: number, len: number) =>
    Array.from(data.subarray(from, from + len))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  const sn = hex(start, SN_BYTES);
  // 全零视为未写号
  if (!/[^0]/.test(sn)) return null;
  return {
    sn,
    uid: hex(start + SN_BYTES, UID_BYTES),
    ucid: hex(start + SN_BYTES + UID_BYTES, UCID_BYTES),
  };
}

/**
 * 弹出浏览器授权窗口,连接键盘并读取设备信息。
 * 读取完成后立即关闭设备,不占用 HID 通道。
 */
export async function readKeyboardInfo(): Promise<KeyboardInfo> {
  if (!navigator.hid) {
    throw new KeyboardHidError('unsupported', '当前浏览器不支持设备连接,请使用 Chrome 或 Edge');
  }

  let devices: HIDDevice[];
  try {
    devices = await navigator.hid.requestDevice({ filters: HID_FILTERS });
  } catch {
    throw new KeyboardHidError('io', '设备授权失败,请重试');
  }
  const device = devices[0];
  if (!device) {
    throw new KeyboardHidError('cancelled', '未选择设备');
  }

  try {
    if (!device.opened) await device.open();
  } catch {
    throw new KeyboardHidError(
      'io',
      '无法打开设备,请确认键盘未被驱动页面占用后重试',
    );
  }

  try {
    const fwResp =
      (await sendAndWait(device, CMD_FIRMWARE_VERSION, 1200)) ??
      (await sendAndWait(device, CMD_FIRMWARE_VERSION, 1200));
    if (!fwResp) {
      throw new KeyboardHidError('io', '设备无响应,请重新插拔键盘后重试');
    }

    const snResp = await sendAndWait(device, CMD_GET_SN, 1000);
    const identity = snResp ? parseIdentity(snResp) : null;

    return {
      model: detectModel(device.vendorId ?? 0, device.productId ?? 0, device.productName ?? ''),
      deviceName: device.productName ?? 'UNIQMAG Keyboard',
      firmwareVersion: parseFirmwareVersion(fwResp),
      sn: identity?.sn ?? null,
      uid: identity?.uid ?? null,
      ucid: identity?.ucid ?? null,
    };
  } finally {
    await device.close().catch(() => undefined);
  }
}

/** 展示用 SN 脱敏:UQ68-26A-TW-000001-X7 → UQ68…1-X7 */
export function maskSn(sn: string): string {
  const s = sn.trim();
  if (s.length <= 6) return `${s.slice(0, 2)}•••`;
  return `${s.slice(0, 4)}••••${s.slice(-4)}`;
}
