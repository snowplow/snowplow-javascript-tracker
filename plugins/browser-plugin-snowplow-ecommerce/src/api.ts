import { BrowserPlugin, BrowserTracker, dispatchToTrackersInCollection } from '@snowplow/browser-tracker-core';
import { SelfDescribingJson } from '@snowplow/tracker-core';
import { buildEcommerceActionEvent } from './core';
import {
  CART_SCHEMA,
  CHECKOUT_STEP_SCHEMA,
  PAGE_SCHEMA,
  PRODUCT_SCHEMA,
  PROMO_SCHEMA,
  REFUND_SCHEMA,
  TRANSACTION_ERROR_SCHEMA,
  TRANSACTION_SCHEMA,
  USER_SCHEMA,
} from './schemata';
import {
  Cart,
  CheckoutStep,
  CommonEcommerceEventProperties,
  ListClickEvent,
  ListViewEvent,
  Page as PageContext,
  Product,
  SPPromotion,
  Refund,
  SPTransaction,
  TransactionError,
  User as UserContext,
} from './types';

const _trackers: Record<string, BrowserTracker> = {};
/* Scheduled to include Page and User */
const _context: Record<string, SelfDescribingJson[]> = {};

/**
 * Adds ecommerce tracking
 */
export function SnowplowEcommercePlugin(): BrowserPlugin {
  let trackerId: string;
  return {
    activateBrowserPlugin: (tracker) => {
      trackerId = tracker.id;
      _trackers[trackerId] = tracker;
      _context[trackerId] = [];
    },
    contexts: () => {
      return _context[trackerId] || [];
    },
  };
}

/**
 * Track a checkout step
 *
 * @param checkoutStep - The checkout step index and the attributes the user filled in.
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackCheckoutStep(
  checkoutStep: CheckoutStep & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, ...checkoutStepAttributes } = checkoutStep;
  context.push({ schema: CHECKOUT_STEP_SCHEMA, data: { ...checkoutStepAttributes } });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'checkout_step' }), context, timestamp);
  });
}

/**
 * Track a product list view
 *
 * @param listView - The list name along with the products which were viewed by the visitor.
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackProductListView(
  listView: ListViewEvent & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, products = [], name } = listView;
  products.forEach((product) => context.push({ schema: PRODUCT_SCHEMA, data: { ...product } }));

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'list_view', name }), context, timestamp);
  });
}

/**
 * Track a product list click event
 *
 * @param listClick - The list name together with the information of the product which was clicked.
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackProductListClick(
  listClick: ListClickEvent & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, name, product } = listClick;
  context.push({ schema: PRODUCT_SCHEMA, data: product });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'list_click', name }), context, timestamp);
  });
}

/**
 * Track a promotion view
 *
 * @param promotionView - The promotion viewed by the visitor.
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackPromotionView(
  promotionView: SPPromotion & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, ...promotion } = promotionView;
  context.push({ schema: PROMO_SCHEMA, data: { ...promotion } });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'promo_view' }), context, timestamp);
  });
}

/**
 * Track a promotion click
 *
 * @param promotionClick - The promotion selected by the visitor.
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackPromotionClick(
  promotionClick: SPPromotion & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, ...promotion } = promotionClick;
  context.push({ schema: PROMO_SCHEMA, data: { ...promotion } });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'promo_click' }), context, timestamp);
  });
}

/**
 * Track a product view/detail
 *
 * @param productView - The product which was viewed in a product detail page.
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackProductView(
  productView: Product & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, ...product } = productView;
  context.push({ schema: PRODUCT_SCHEMA, data: { ...product } });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'product_view' }), context, timestamp);
  });
}

/**
 * Track a product addition to cart
 *
 * @param cart - The product/s which was/were added to the cart and the total value of the cart after the product was added.
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackAddToCart(
  cart: Cart & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, products = [], ...cartAttributes } = cart;
  products.forEach((product) => context.push({ schema: PRODUCT_SCHEMA, data: { ...product } }));
  context.push({ schema: CART_SCHEMA, data: { ...cartAttributes } });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'add_to_cart' }), context, timestamp);
  });
}

/**
 * Track removal of products from cart
 *
 * @param cart - The product/s which were removed from the cart and the total value of the cart after the product was removed.
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackRemoveFromCart(
  cart: Cart & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, products = [], ...cartAttributes } = cart;
  products.forEach((product) => context.push({ schema: PRODUCT_SCHEMA, data: { ...product } }));
  context.push({ schema: CART_SCHEMA, data: { ...cartAttributes } });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'remove_from_cart' }), context, timestamp);
  });
}

/**
 * Track a transaction event
 *
 * @param transaction - The transaction information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackTransaction(
  transaction: SPTransaction & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  let totalQuantity = 0;
  const { context = [], timestamp, products = [], ...transactionAttributes } = transaction;
  products.forEach((product) => {
    /* If `total_quantity` is not provided, we calculate it from individual product quantities. */
    if (product.quantity) {
      totalQuantity += product.quantity;
    }
    context.push({ schema: PRODUCT_SCHEMA, data: product });
  });
  context.push({
    schema: TRANSACTION_SCHEMA,
    data: { total_quantity: totalQuantity || undefined, ...transactionAttributes },
  });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'transaction' }), context, timestamp);
  });
}

/**
 * Track a refund event
 *
 * @param refund - The refund information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackRefund(
  refund: Refund & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, products = [], ...refundAttributes } = refund;
  products.forEach((product) => context.push({ schema: PRODUCT_SCHEMA, data: product }));
  context.push({ schema: REFUND_SCHEMA, data: { ...refundAttributes } });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'refund' }), context, timestamp);
  });
}

/**
 * Track a transaction error event
 *
 * @param transactionError - The transaction error information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackTransactionError(
  transactionError: TransactionError & CommonEcommerceEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  const { context = [], timestamp, transaction, ...transactionErrorAttributes } = transactionError;
  context.push({
    schema: TRANSACTION_SCHEMA,
    data: { ...transaction },
  });
  context.push({ schema: TRANSACTION_ERROR_SCHEMA, data: { ...transactionErrorAttributes } });

  dispatchToTrackersInCollection(trackers, _trackers, (t) => {
    t.core.track(buildEcommerceActionEvent({ type: 'trns_error' }), context, timestamp);
  });
}

/**
 * Set Ecommerce Page context
 *
 * @param context - The ecommerce page context to be stored
 * @param trackers - The tracker identifiers which the context will be stored
 */
export function setPageType(context: PageContext, trackers: Array<string> = Object.keys(_trackers)) {
  const { type, language, locale } = context;
  trackers.forEach((trackerId) => {
    if (_context[trackerId]) {
      _context[trackerId] = removeContext(_context[trackerId], PAGE_SCHEMA);

      _context[trackerId].push({
        schema: PAGE_SCHEMA,
        data: {
          type,
          language,
          locale,
        },
      });
    }
  });
}

/**
 * Set Ecommerce User context
 *
 * @param context - The ecommerce user context to be stored
 * @param trackers - The tracker identifiers which the context will be stored
 */
export function setEcommerceUser(context: UserContext, trackers: Array<string> = Object.keys(_trackers)) {
  const { id, is_guest, email } = context;
  trackers.forEach((trackerId) => {
    if (_context[trackerId]) {
      _context[trackerId] = removeContext(_context[trackerId], USER_SCHEMA);

      _context[trackerId].push({
        schema: USER_SCHEMA,
        data: {
          id,
          is_guest,
          email,
        },
      });
    }
  });
}

/**
 * Return a new array with the context matching the `schemaToRemove` removed from the array.
 * Used in cases where we want only one type of the said context on the context array for a tracker.
 */
function removeContext(trackerContext: SelfDescribingJson[], schemaToRemove: string) {
  return trackerContext.filter((context) => context.schema !== schemaToRemove);
}
