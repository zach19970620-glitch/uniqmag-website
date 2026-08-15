interface HIDInputReportEvent extends Event {
  readonly data: DataView;
  readonly device: HIDDevice;
  readonly reportId: number;
}

interface HIDConnectionEvent extends Event {
  readonly device: HIDDevice;
}

interface HIDDevice extends EventTarget {
  opened: boolean;
  productName?: string;
  vendorId?: number;
  productId?: number;
  open(): Promise<void>;
  close(): Promise<void>;
  sendReport(reportId: number, data: BufferSource): Promise<void>;
  addEventListener(
    type: 'inputreport',
    listener: (ev: HIDInputReportEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface HIDDeviceFilter {
  vendorId?: number;
  productId?: number;
  usagePage?: number;
  usage?: number;
}

interface HIDDeviceRequestOptions {
  filters: HIDDeviceFilter[];
}

interface HID extends EventTarget {
  requestDevice(options: HIDDeviceRequestOptions): Promise<HIDDevice[]>;
  getDevices(): Promise<HIDDevice[]>;
  addEventListener(
    type: 'connect' | 'disconnect',
    listener: (ev: HIDConnectionEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: 'connect' | 'disconnect',
    listener: (ev: HIDConnectionEvent) => void,
    options?: boolean | EventListenerOptions,
  ): void;
}

interface Navigator {
  readonly hid?: HID;
}
