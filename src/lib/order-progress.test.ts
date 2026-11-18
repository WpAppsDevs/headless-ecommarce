import { describe, expect, it } from 'vitest';
import {
  ORDER_TIMELINE_STEPS,
  isActiveOrder,
  orderCompactStep,
  orderTimelineStep,
  showsPreOrderWindow,
} from './order-progress';

describe('order progress', () => {
  it('marks the stage an order is in as current, not done', () => {
    expect(orderTimelineStep('pending')).toBe(0);
    expect(orderTimelineStep('processing')).toBe(1);
    expect(orderTimelineStep('delivery')).toBe(4);
    expect(orderTimelineStep('completed')).toBe(ORDER_TIMELINE_STEPS.length);
  });

  it('keeps a status the API can return on the compact bar', () => {
    expect(orderCompactStep('pending')).toBe(0);
    expect(orderCompactStep('on-hold')).toBe(0);
    expect(orderCompactStep('processing')).toBe(1);
    expect(orderCompactStep('delivery')).toBe(2);
    expect(orderCompactStep('completed')).toBe(4);
  });

  it('has no stage for a cancelled or refunded order', () => {
    expect(orderTimelineStep('cancelled')).toBeNull();
    expect(orderTimelineStep('refunded')).toBeNull();
    expect(orderCompactStep('failed')).toBeNull();
  });

  it('stops quoting the pre-order window once the order is out for delivery', () => {
    expect(showsPreOrderWindow('pending')).toBe(true);
    expect(showsPreOrderWindow('processing')).toBe(true);
    expect(showsPreOrderWindow('delivery')).toBe(false);
    expect(showsPreOrderWindow('completed')).toBe(false);
  });

  it('counts every order that still has a fulfilment step ahead', () => {
    expect(isActiveOrder('pending')).toBe(true);
    expect(isActiveOrder('processing')).toBe(true);
    expect(isActiveOrder('delivery')).toBe(true);
    expect(isActiveOrder('completed')).toBe(false);
    expect(isActiveOrder('cancelled')).toBe(false);
  });
});
