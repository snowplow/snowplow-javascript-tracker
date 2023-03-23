import { Product, Promotion } from '../types';
import { EEProduct, EEPromo } from './types';

interface UAProductsTransformation {
  products: EEProduct[];
  currencyCode?: string;
}

export function transformUAProductsToSPProducts({
  products,
  currencyCode = 'USD',
}: UAProductsTransformation): Product[] {
  return products.map((product) => {
    return {
      currency: currencyCode,
      /* Id or name is required, but we in SP-plugin we require id to be present */
      id: product.id! || product.name!,
      price: product.price!,
      name: product.name,
      position: product.position,
      brand: product.brand,
      category: product.category,
      variant: product.variant,
      quantity: product.quantity,
    };
  });
}

export function transformUAPromotionsToSPPromotions(promotions: EEPromo[]): Promotion[] {
  return promotions.map((promotion) => ({
    name: promotion.name,
    slot: promotion.position,
    /* Id or name is required, but we in SP-plugin we require id to be present */
    id: promotion.id || promotion.name,
    creative_id: promotion.creative,
  }));
}
