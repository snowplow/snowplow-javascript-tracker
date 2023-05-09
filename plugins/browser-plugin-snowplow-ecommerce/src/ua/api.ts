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

type Options = {
  currency?: string;
};

const DEFAULT_PAYMENT_METHOD = 'unknown';

export function trackEnhancedEcommercePromoView(ecommerce: PromoViewEvent) {
  const promotions = transformUAPromotionsToSPPromotions(ecommerce.promoView.promotions);
  /* Enhanced Ecommerce allows multiple promotions to be sent on a single event. */
  for (let i = 0; i < promotions.length; i++) {
    trackPromotionView(promotions[i]);
  }
}

export function trackEnhancedEcommercePromoClick(ecommerce: PromoClickEvent) {
  const [promotion] = transformUAPromotionsToSPPromotions(ecommerce.promoClick.promotions);
  trackPromotionClick(promotion);
}

export function trackEnhancedEcommerceAddToCart(
  ecommerce: UAEnhancedEcommerceObject & AddToCartEvent,
  opts: Options & { finalCartValue: number }
) {
  const currency = (ecommerce.currencyCode || opts.currency)!;
  const products = transformUAProductsToSPProducts(ecommerce.add.products, currency);
  trackAddToCart({ products, total_value: opts.finalCartValue, currency });
}

export function trackEnhancedEcommerceRemoveFromCart(
  ecommerce: UAEnhancedEcommerceObject & RemoveFromCartEvent,
  opts: Options & { finalCartValue: number }
) {
  const currency = (ecommerce.currencyCode || opts.currency)!;
  const products = transformUAProductsToSPProducts(ecommerce.remove.products, currency);
  trackRemoveFromCart({ products, total_value: opts.finalCartValue, currency });
}

export function trackEnhancedEcommerceProductDetail(
  ecommerce: UAEnhancedEcommerceObject & ProductDetailEvent,
  opts: Options = {}
) {
  const currency = (ecommerce.currencyCode || opts.currency)!;
  const products = transformUAProductsToSPProducts(ecommerce.detail.products, currency);
  trackProductView({ ...products[0] });
}

export function trackEnhancedEcommerceProductListView(
  ecommerce: UAEnhancedEcommerceObject & ProductListViewEvent,
  opts: Options = {}
) {
  const currency = (ecommerce.currencyCode || opts.currency)!;
  const products = transformUAProductsToSPProducts(ecommerce.impressions, currency);
  trackProductListView({ name: ecommerce.impressions[0].list!, products });
}

export function trackEnhancedEcommerceProductListClick(
  ecommerce: UAEnhancedEcommerceObject & ProductListClickEvent,
  opts: Options = {}
) {
  const currency = (ecommerce.currencyCode || opts.currency)!;
  const [product] = transformUAProductsToSPProducts(ecommerce.click.products, currency);
  trackProductListClick({ name: ecommerce.click.actionField.list, product });
}

export function trackEnhancedEcommerceCheckoutStep(
  ecommerce: CheckoutStepEvent,
  checkoutOption?: Omit<CheckoutStep, 'step'>
) {
  trackCheckoutStep({ step: ecommerce.checkout.actionField.step, ...checkoutOption });
}

export function trackEnhancedEcommercePurchase(
  ecommerce: UAEnhancedEcommerceObject & PurchaseEvent,
  opts: Options & { paymentMethod: string }
) {
  const currency = (ecommerce.currencyCode || opts.currency)!;
  const products = transformUAProductsToSPProducts(ecommerce.purchase.products, currency);
  trackTransaction({
    products,
    transaction_id: ecommerce.purchase.actionField.id,
    currency,
    revenue: Number(ecommerce.purchase.actionField.revenue),
    payment_method: opts.paymentMethod || DEFAULT_PAYMENT_METHOD,
    tax: Number(ecommerce.purchase.actionField.tax) || undefined,
    shipping: Number(ecommerce.purchase.actionField.shipping) || undefined,
  });
}
