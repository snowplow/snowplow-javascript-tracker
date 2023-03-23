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
import { CheckoutStep } from '../types';
import {
  AddToCartEvent,
  CheckoutStepEvent,
  ProductDetailEvent,
  ProductListClickEvent,
  ProductListViewEvent,
  PromoClickEvent,
  PromoViewEvent,
  PurchaseEvent,
  RemoveFromCartEvent,
  UAEnhancedEcommerceObject,
} from './types';

import { transformUAProductsToSPProducts, transformUAPromotionsToSPPromotions } from './utils';

const DEFAULT_PAYMENT_METHOD = 'unknown';

export function trackEnhancedEcommercePromoView(ecommerce: UAEnhancedEcommerceObject & PromoViewEvent) {
  const promotions = transformUAPromotionsToSPPromotions(ecommerce.promoView.promotions);
  /* Enhanced Ecommerce allows multiple promotions to be sent on a single event. */
  for (let i = 0; i < promotions.length; i++) {
    trackPromotionView(promotions[i]);
  }
}

export function trackEnhancedEcommercePromoClick(ecommerce: UAEnhancedEcommerceObject & PromoClickEvent) {
  const [promotion] = transformUAPromotionsToSPPromotions(ecommerce.promoClick.promotions);
  trackPromotionClick(promotion);
}

export function trackEnhancedEcommerceAddToCart(
  ecommerce: UAEnhancedEcommerceObject & AddToCartEvent,
  finalCartValue: number
) {
  const products = transformUAProductsToSPProducts({
    currencyCode: ecommerce.currencyCode,
    products: ecommerce.add.products,
  });
  trackAddToCart({ products, total_value: finalCartValue, currency: ecommerce.currencyCode });
}

export function trackEnhancedEcommerceRemoveFromCart(
  ecommerce: UAEnhancedEcommerceObject & RemoveFromCartEvent,
  finalCartValue: number
) {
  const products = transformUAProductsToSPProducts({
    currencyCode: ecommerce.currencyCode,
    products: ecommerce.remove.products,
  });
  trackRemoveFromCart({ products, total_value: finalCartValue, currency: ecommerce.currencyCode });
}

export function trackEnhancedEcommerceProductDetail(ecommerce: UAEnhancedEcommerceObject & ProductDetailEvent) {
  const products = transformUAProductsToSPProducts({
    currencyCode: ecommerce.currencyCode,
    products: ecommerce.detail.products,
  });
  trackProductView({ ...products[0] });
}

export function trackEnhancedEcommerceProductListView(ecommerce: UAEnhancedEcommerceObject & ProductListViewEvent) {
  const products = transformUAProductsToSPProducts({
    currencyCode: ecommerce.currencyCode,
    products: ecommerce.impressions,
  });
  trackProductListView({ name: ecommerce.impressions[0].list!, products });
}

export function trackEnhancedEcommerceProductListClick(ecommerce: UAEnhancedEcommerceObject & ProductListClickEvent) {
  const [product] = transformUAProductsToSPProducts({
    currencyCode: ecommerce.currencyCode,
    products: ecommerce.click.products,
  });
  trackProductListClick({ name: ecommerce.click.actionField.list, product });
}

export function trackEnhancedEcommerceCheckoutStep(
  ecommerce: UAEnhancedEcommerceObject & CheckoutStepEvent,
  checkoutOption: Omit<CheckoutStep, 'step'>
) {
  trackCheckoutStep({ step: ecommerce.actionField.step, ...checkoutOption });
}

export function trackEnhancedEcommercePurchase(
  ecommerce: UAEnhancedEcommerceObject & PurchaseEvent,
  paymentMethod = DEFAULT_PAYMENT_METHOD
) {
  const products = transformUAProductsToSPProducts({
    products: ecommerce.purchase.products,
    currencyCode: ecommerce.currencyCode,
  });
  trackTransaction({
    products,
    transaction_id: ecommerce.purchase.actionField.id,
    currency: ecommerce.currencyCode,
    revenue: ecommerce.purchase.actionField.revenue,
    payment_method: paymentMethod,
    tax: ecommerce.purchase.actionField.tax,
    shipping: ecommerce.purchase.actionField.shipping,
  });
}
