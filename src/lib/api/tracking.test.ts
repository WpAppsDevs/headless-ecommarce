import { describe, expect, it } from 'vitest';
import {
  normalizeTimeline,
  normalizeTrackingResult,
  type TrackingOrder,
} from './tracking';

const order: TrackingOrder = {
  id: 151,
  status: 'processing',
  created_at: '2026-04-28T10:30:00',
  total: '500.00',
  currency: 'BDT',
};

const tracking = {
  provider: 'steadfast',
  tracking_number: 'SF123',
  tracking_url: null,
  status: 'processing',
  estimated_delivery: null,
  shipped_at: null,
  delivered_at: null,
  shipping_events: [],
};

describe('normalizeTimeline', () => {
  it('creates an order placed event when the timeline is empty', () => {
    expect(normalizeTimeline([], order)).toEqual([
      { status: 'Order Placed', date: order.created_at },
    ]);
  });

  it('corrects the order placed date from the order', () => {
    const result = normalizeTimeline(
      [{ status: 'order placed', date: '2020-01-01T00:00:00' }],
      order,
    );
    expect(result[0].date).toBe(order.created_at);
  });

  it('returns no event when the order has no created_at', () => {
    expect(normalizeTimeline([], { ...order, created_at: '' })).toEqual([]);
  });
});

describe('normalizeTrackingResult', () => {
  it('accepts the per-order array shape and drops checkout drafts', () => {
    const result = normalizeTrackingResult([
      { order, tracking, timeline: [] },
      {
        order: { ...order, id: 99, status: 'checkout-draft' },
        tracking,
        timeline: [],
      },
    ]);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].order.id).toBe(151);
  });

  it('accepts a single order object and returns no entries for a draft', () => {
    expect(normalizeTrackingResult({ order, tracking, timeline: [] }).entries).toHaveLength(1);
    expect(
      normalizeTrackingResult({
        order: { ...order, status: 'checkout-draft' },
        tracking,
        timeline: [],
      }).entries,
    ).toEqual([]);
  });

  it('shares tracking with the newest order and falls back for the rest', () => {
    const result = normalizeTrackingResult({
      orders: [order, { ...order, id: 45 }],
      tracking,
      timeline: [{ status: 'Order Placed', date: '2020-01-01T00:00:00' }],
    });

    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].timeline[0].date).toBe(order.created_at);
    expect(result.entries[1].timeline[0].status).toBe('Order Placed');
    expect(result.entries[1].tracking.provider).toBe('');
  });

  it('returns an empty result for an unknown shape', () => {
    expect(normalizeTrackingResult(null)).toEqual({ entries: [] });
  });
});
