export const CHECKOUT_DRAFT_STATUS = 'checkout-draft';

export function isCheckoutDraftStatus(status: string | null | undefined): boolean {
  return status === CHECKOUT_DRAFT_STATUS;
}

export function filterCheckoutDrafts<T extends { status?: string | null }>(items: T[]): T[] {
  return items.filter((item) => !isCheckoutDraftStatus(item.status));
}
