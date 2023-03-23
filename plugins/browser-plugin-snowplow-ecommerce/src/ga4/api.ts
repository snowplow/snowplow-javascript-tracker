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

export function trackGA4AddToCart(ecommerce: GA4EcommerceObject & Currency, finalCartValue: number) {
  const products = transformG4ItemsToSPProducts(ecommerce);
  trackAddToCart({ products, total_value: finalCartValue, currency: ecommerce.currency });
}

export function trackGA4RemoveFromCart(ecommerce: GA4EcommerceObject & Currency, finalCartValue: number) {
  const products = transformG4ItemsToSPProducts(ecommerce);
  trackRemoveFromCart({ products, total_value: finalCartValue, currency: ecommerce.currency });
}

export function trackGA4ViewItem(ecommerce: GA4EcommerceObject) {
  const products = transformG4ItemsToSPProducts(ecommerce);
  trackProductView({ ...products[0] });
}

export function trackGA4ViewItemList(ecommerce: GA4EcommerceObject & ItemList) {
  const products = transformG4ItemsToSPProducts(ecommerce);
  trackProductListView({ name: ecommerce.item_list_id || ecommerce.item_list_name, products });
}

export function trackGA4SelectItem(ecommerce: GA4EcommerceObject & ItemList) {
  const [product] = transformG4ItemsToSPProducts(ecommerce);
  trackProductListClick({ name: ecommerce.item_list_id || ecommerce.item_list_name, product });
}

export function trackGA4BeginCheckout(step: number = 1) {
  trackCheckoutStep({ step });
}

export function trackGA4AddShippingInfo(ecommerce: GA4EcommerceObject, step: number) {
  trackCheckoutStep({ step, delivery_method: ecommerce.shipping_tier });
}

export function trackGA4AddPaymentOptions(ecommerce: GA4EcommerceObject, step: number) {
  trackCheckoutStep({ step, payment_method: ecommerce.payment_type });
}

export function trackGA4Transaction(
  ecommerce: GA4EcommerceObject & Transaction,
  paymentMethod = DEFAULT_PAYMENT_METHOD
) {
  const products = transformG4ItemsToSPProducts(ecommerce);

  trackTransaction({
    products,
    transaction_id: ecommerce.transaction_id,
    currency: ecommerce.currency,
    revenue: ecommerce.value,
    payment_method: paymentMethod,
    tax: ecommerce.tax,
    shipping: ecommerce.shipping,
  });
}
