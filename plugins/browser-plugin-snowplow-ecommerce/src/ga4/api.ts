import {
  trackProductView,
  trackProductListView,
  trackProductListClick,
  trackCheckoutStep,
  trackTransaction,
  trackAddToCart,
  trackRemoveFromCart,
  trackPromotionClick,
  trackPromotionView,
} from '../api';
import { Currency, GA4EcommerceObject, ItemList, Transaction, Promotion } from './types';
import { transformG4ItemsToSPProducts, transformGA4PromotionToSPPromotion } from './utils';

type Options = {
  currency?: string;
};

const DEFAULT_PAYMENT_METHOD = 'unknown';

export function trackGA4ViewCart() {
  console.log('This function could be similarly tracked with the `setPageType` or `trackCheckoutStep` API.');
}

export function trackGA4ViewPromotion(ecommerce: GA4EcommerceObject & Promotion) {
  const promotion = transformGA4PromotionToSPPromotion(ecommerce);
  trackPromotionView(promotion);
}

export function trackGA4SelectPromotion(ecommerce: GA4EcommerceObject & Promotion) {
  const promotion = transformGA4PromotionToSPPromotion(ecommerce);
  trackPromotionClick(promotion);
}

export function trackGA4AddToCart(
  ecommerce: GA4EcommerceObject & Currency & { finalCartValue?: number },
  opts: Options & { finalCartValue: number }
) {
  const currency = (ecommerce.currency || opts.currency)!;
  const finalCartValue = ecommerce.finalCartValue ?? opts.finalCartValue;
  const products = transformG4ItemsToSPProducts(ecommerce, currency);
  trackAddToCart({ products, total_value: finalCartValue, currency });
}

export function trackGA4RemoveFromCart(
  ecommerce: GA4EcommerceObject & Currency & { finalCartValue?: number },
  opts: Options & { finalCartValue: number }
) {
  const currency = (ecommerce.currency || opts.currency)!;
  const finalCartValue = ecommerce.finalCartValue ?? opts.finalCartValue;
  const products = transformG4ItemsToSPProducts(ecommerce, currency);
  trackRemoveFromCart({ products, total_value: finalCartValue, currency });
}

export function trackGA4ViewItem(ecommerce: GA4EcommerceObject, opts: Options = {}) {
  const currency = (ecommerce.currency || opts.currency)!;
  const products = transformG4ItemsToSPProducts(ecommerce, currency);
  trackProductView({ ...products[0] });
}

export function trackGA4ViewItemList(ecommerce: GA4EcommerceObject & ItemList, opts: Options = {}) {
  const currency = (ecommerce.currency || opts.currency)!;
  const products = transformG4ItemsToSPProducts(ecommerce, currency);
  trackProductListView({ name: ecommerce.item_list_id || ecommerce.item_list_name, products });
}

export function trackGA4SelectItem(ecommerce: GA4EcommerceObject & ItemList, opts: Options = {}) {
  const currency = (ecommerce.currency || opts.currency)!;
  const [product] = transformG4ItemsToSPProducts(ecommerce, currency);
  trackProductListClick({ name: ecommerce.item_list_id || ecommerce.item_list_name, product });
}

export function trackGA4BeginCheckout(opts: { step?: number } = {}) {
  trackCheckoutStep({ step: opts.step || 1 });
}

export function trackGA4AddShippingInfo(ecommerce: GA4EcommerceObject, opts: { step: number }) {
  trackCheckoutStep({ step: opts.step, delivery_method: ecommerce.shipping_tier });
}

export function trackGA4AddPaymentOptions(ecommerce: GA4EcommerceObject, opts: { step: number }) {
  trackCheckoutStep({ step: opts.step, payment_method: ecommerce.payment_type });
}

export function trackGA4Transaction(
  ecommerce: GA4EcommerceObject & Transaction,
  opts: Options & { paymentMethod: string }
) {
  const currency = (ecommerce.currency || opts.currency)!;
  const products = transformG4ItemsToSPProducts(ecommerce, currency);

  trackTransaction({
    products,
    transaction_id: ecommerce.transaction_id,
    currency,
    revenue: ecommerce.value,
    payment_method: opts.paymentMethod || DEFAULT_PAYMENT_METHOD,
    tax: ecommerce.tax,
    shipping: ecommerce.shipping,
  });
}
