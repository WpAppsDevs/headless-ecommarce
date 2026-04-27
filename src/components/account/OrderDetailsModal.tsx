'use client';

import { type ReactNode } from 'react';
import { X, Home, Printer, Download, RotateCcw, Check } from 'lucide-react';
import type { Order } from '@/lib/api/orders';

// ── Status config ────────────────────────────────────────────────────────────

interface StatusCfg { label: string; bg: string; text: string; border: string }

const STATUS_CONFIG: Record<string, StatusCfg> = {
  pending:    { label: 'Pending',    bg: 'bg-[#D89A6A]/15', text: 'text-[#D89A6A]', border: 'border-[#D89A6A]/40' },
  processing: { label: 'Processing', bg: 'bg-[#D89A6A]/15', text: 'text-[#D89A6A]', border: 'border-[#D89A6A]/40' },
  'on-hold':  { label: 'On Hold',    bg: 'bg-[#B39DDB]/15', text: 'text-[#B39DDB]', border: 'border-[#B39DDB]/40' },
  delivery:   { label: 'Delivery',   bg: 'bg-[#D89A6A]/15', text: 'text-[#D89A6A]', border: 'border-[#D89A6A]/40' },
  completed:  { label: 'Delivered',  bg: 'bg-[#7BAE7F]/15', text: 'text-[#7BAE7F]', border: 'border-[#7BAE7F]/40' },
  cancelled:  { label: 'Cancelled',  bg: 'bg-[#E57373]/15', text: 'text-[#E57373]', border: 'border-[#E57373]/40' },
  refunded:   { label: 'Refunded',   bg: 'bg-zinc-100',     text: 'text-zinc-500',  border: 'border-zinc-200'     },
  failed:     { label: 'Failed',     bg: 'bg-[#E57373]/15', text: 'text-[#E57373]', border: 'border-[#E57373]/40' },
};

// ── Timeline steps ───────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { label: 'Order Placed',  desc: 'Your order has been successfully placed.' },
  { label: 'Processing',    desc: 'We have received your order and are processing it.' },
  { label: 'Packing',       desc: 'Your order is currently being packed.' },
  { label: 'Packed',        desc: 'Your order is packed and ready for dispatch.' },
  { label: 'Delivering',    desc: 'Rider has picked up your order for delivery.' },
  { label: 'Payment',       desc: 'Your payment has been confirmed.' },
  { label: 'Delivered',     desc: 'You have received your order.' },
];

const STATUS_STEP_COUNT: Record<string, number> = {
  pending: 1, processing: 2, 'on-hold': 1, delivery: 5,
  completed: 7, cancelled: 0, refunded: 0, failed: 0,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDateTime(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function fmtShort(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-6 py-4">
        <h3 className="text-[15px] font-bold text-zinc-900">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

interface AddressProps {
  name: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;
}

function AddressBlock({ name, phone, address1, address2, city, state, postcode }: AddressProps) {
  const cityLine = [city, state, postcode].filter(Boolean).join(', ');
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 ring-1 ring-zinc-200">
        <Home className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
      </div>
      <div className="text-[13px] leading-relaxed text-zinc-600">
        <p className="font-semibold text-zinc-900">{name}</p>
        {phone && <p>{phone}</p>}
        {address1 && <p>{address1}</p>}
        {address2 && <p>{address2}</p>}
        {cityLine && <p>{cityLine}</p>}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const sc           = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const doneSteps    = STATUS_STEP_COUNT[order.status] ?? 1;
  const total        = Number(order.total);
  const discount     = Number(order.discount_total ?? 0);
  const shippingCost = Number(order.shipping_total ?? 0);
  const subtotalMrp  = total + discount - shippingCost;

  const b = order.billing;
  const s = order.shipping;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mx-auto max-w-2xl">
        {/* Modal title bar */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Order Details</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full bg-white/15 p-1.5 text-white transition hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 pb-6">

          {/* 1 – Order header card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[15px] font-bold text-zinc-900">Order ID: #{order.id}</h3>
                <p className="mt-1 text-[13px] text-zinc-500">
                  {fmtDateTime(order.date_created)}
                  {order.payment_method_title && (
                    <> &bull; <span className="font-medium text-zinc-700">{order.payment_method_title}</span></>
                  )}
                </p>
              </div>
              <span className={`shrink-0 rounded-lg border px-3 py-1 text-[12px] font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
                {sc.label}
              </span>
            </div>
          </div>

          {/* 2 – Products */}
          <SectionCard title="Products">
            <div className="divide-y divide-zinc-100">
              {order.line_items.map((item, i) => {
                const unitPrice = item.quantity > 0 ? Number(item.line_total) / item.quantity : 0;
                return (
                  <div key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-100" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-zinc-400">Vendor: —</p>
                      <p className="mt-0.5 text-[13px] font-semibold leading-snug text-zinc-900">{item.name}</p>
                    </div>
                    <div className="shrink-0 space-y-0.5 text-right text-[12px]">
                      <div className="flex justify-between gap-6 text-zinc-500">
                        <span>Price:</span>
                        <span className="font-medium text-zinc-700">${unitPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-6 text-zinc-500">
                        <span>Qty:</span>
                        <span className="font-medium text-zinc-700">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between gap-6 text-zinc-500">
                        <span>Total:</span>
                        <span className="font-semibold text-zinc-900">${Number(item.line_total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
              <span className="text-[13px] font-semibold text-zinc-700">Total Amount:</span>
              <span className="text-[15px] font-bold text-brand-wine">${total.toFixed(2)}</span>
            </div>
          </SectionCard>

          {/* 3 – Shipping Address */}
          <SectionCard title="Shipping Address">
            {s ? (
              <AddressBlock
                name={`${s.first_name} ${s.last_name}`.trim()}
                address1={s.address_1}
                address2={s.address_2}
                city={s.city}
                state={s.state}
                postcode={s.postcode}
              />
            ) : b ? (
              <AddressBlock
                name={`${b.first_name} ${b.last_name}`.trim()}
                phone={b.phone}
                address1={b.address_1}
                address2={b.address_2}
                city={b.city}
                state={b.state}
                postcode={b.postcode}
              />
            ) : (
              <p className="text-[13px] text-zinc-400">No shipping address</p>
            )}
          </SectionCard>

          {/* 4 – Billing Address */}
          {b && (
            <SectionCard title="Billing Address">
              <AddressBlock
                name={`${b.first_name} ${b.last_name}`.trim()}
                phone={b.phone}
                address1={b.address_1}
                address2={b.address_2}
                city={b.city}
                state={b.state}
                postcode={b.postcode}
              />
            </SectionCard>
          )}

          {/* 5 – Timeline */}
          <SectionCard title="Timeline">
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, i) => {
                const done   = i < doneSteps;
                const isLast = i === TIMELINE_STEPS.length - 1;
                return (
                  <div key={i} className="flex gap-3">
                    {/* Date column */}
                    <div className="w-[68px] shrink-0 pt-1 text-right">
                      <span className="text-[10px] leading-tight text-zinc-400">
                        {done ? fmtShort(order.date_created) : ''}
                      </span>
                    </div>

                    {/* Circle + connector */}
                    <div className="flex flex-col items-center">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        done ? 'border-[#7BAE7F] bg-[#7BAE7F]' : 'border-zinc-300 bg-white'
                      }`}>
                        {done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                      {!isLast && (
                        <div className={`mt-1 w-0.5 min-h-[44px] flex-1 ${done ? 'bg-[#7BAE7F]/30' : 'bg-zinc-200'}`} />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="min-w-0 flex-1 pb-4">
                      <p className={`text-[13px] font-semibold ${done ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        {step.label}
                      </p>
                      <p className={`mt-0.5 text-[12px] leading-relaxed ${done ? 'text-zinc-500' : 'text-zinc-300'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* 6 – Order Summary */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h3 className="text-[15px] font-bold text-zinc-900">Order Summary</h3>
              <span className={`rounded-lg border px-3 py-1 text-[12px] font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
                {sc.label}
              </span>
            </div>
            <div className="space-y-3 px-6 py-5">
              <div className="flex justify-between text-[13px] text-zinc-600">
                <span>Order ID:</span>
                <span className="font-medium text-zinc-800">#{order.id}</span>
              </div>
              <div className="flex justify-between text-[13px] text-zinc-600">
                <span>Order At:</span>
                <span className="font-medium text-zinc-800">{fmtDate(order.date_created)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-zinc-600">
                <span>Subtotal (MRP):</span>
                <span className="font-medium text-zinc-800">${subtotalMrp.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[13px] text-zinc-600">
                  <span>Discount applied:</span>
                  <span className="font-medium text-[#E57373]">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] text-zinc-600">
                <span>Delivery Charge:</span>
                <span className={`font-medium ${shippingCost === 0 ? 'text-[#7BAE7F]' : 'text-zinc-800'}`}>
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                <span className="text-[14px] font-bold text-zinc-900">Amount Paid</span>
                <span className="text-[16px] font-bold text-brand-wine">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 7 – Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#7BAE7F] px-5 py-3 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90 sm:flex-none"
            >
              <Printer className="h-4 w-4" strokeWidth={2} />
              Print Invoice
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-wine px-5 py-3 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90 sm:flex-none">
              <Download className="h-4 w-4" strokeWidth={2} />
              Download Invoice
            </button>
            {order.status === 'completed' && (
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E57373] px-5 py-3 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90 sm:flex-none">
                <RotateCcw className="h-4 w-4" strokeWidth={2} />
                Return Product
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

