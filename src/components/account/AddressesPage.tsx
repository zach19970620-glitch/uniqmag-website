import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
  type AddressInput,
} from '../../api/addresses';
import type { Address } from '../../api/types';
import PageFrame from '../app/PageFrame';
import AccountNav from '../app/AccountNav';
import EmptyState from '../app/EmptyState';

const EMPTY: AddressInput = {
  name: '',
  mobile: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  is_default: false,
};

export default function AddressesPage() {
  const [list, setList] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setList(await fetchAddresses());
    } catch (err) {
      setError(err instanceof Error ? err.message : '地址加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const startCreate = () => {
    setEditingId('new');
    setForm({ ...EMPTY, is_default: list.length === 0 });
    setError('');
  };

  const startEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      name: addr.name,
      mobile: addr.mobile,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      is_default: addr.is_default,
    });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim() || !form.detail.trim()) {
      setError('请填写收货人、手机号与详细地址');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId === 'new') {
        await createAddress(form);
      } else if (typeof editingId === 'number') {
        await updateAddress(editingId, form);
      }
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确认删除该地址？')) return;
    try {
      await deleteAddress(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const field = (key: keyof AddressInput, label: string, props?: { className?: string }) => (
    <label className={`block space-y-1.5 text-sm ${props?.className ?? ''}`}>
      <span className="text-zinc-400">{label}</span>
      {key === 'is_default' ? (
        <span className="flex items-center gap-2 text-zinc-300">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
          />
          设为默认地址
        </span>
      ) : (
        <input
          value={String(form[key] ?? '')}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/40"
        />
      )}
    </label>
  );

  return (
    <PageFrame>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">收货地址</h1>
          <p className="mt-2 text-sm text-zinc-400">用于结算与发货</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black"
        >
          <Plus size={16} strokeWidth={1.5} />
          新增地址
        </button>
      </div>
      <div className="mt-6">
        <AccountNav />
      </div>

      {editingId != null ? (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {field('name', '收货人')}
            {field('mobile', '手机号')}
            {field('province', '省')}
            {field('city', '市')}
            {field('district', '区/县')}
            {field('detail', '详细地址', { className: 'sm:col-span-2' })}
            {field('is_default', '默认', { className: 'sm:col-span-2' })}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              保存
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400"
            >
              取消
            </button>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </form>
      ) : null}

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-zinc-500" size={28} />
          </div>
        ) : list.length === 0 && editingId == null ? (
          <EmptyState title="还没有收货地址" description="点击右上角「新增地址」开始填写" />
        ) : (
          list.map((addr) => (
            <div
              key={addr.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
            >
              <div className="text-sm">
                <p className="font-medium">
                  {addr.name} {addr.mobile}
                  {addr.is_default ? (
                    <span className="ml-2 text-xs text-zinc-500">默认</span>
                  ) : null}
                </p>
                <p className="mt-1 text-zinc-400">
                  {addr.province}
                  {addr.city}
                  {addr.district}
                  {addr.detail}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="编辑"
                  onClick={() => startEdit(addr)}
                  className="rounded-full border border-white/10 p-2 text-zinc-400 hover:text-white"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  aria-label="删除"
                  onClick={() => void handleDelete(addr.id)}
                  className="rounded-full border border-white/10 p-2 text-zinc-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
        {error && editingId == null ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    </PageFrame>
  );
}
