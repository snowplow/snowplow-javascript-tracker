import { Product, SPPromotion } from '../types';
import { EEProduct, EEPromo } from './types';

export function transformUAProductsToSPProducts(products: EEProduct[], currency: string): Product[] {
  return products.map((product) => {
    return {
      currency,
      /* Id or name is required, but we in SP-plugin we require id to be present */
      id: product.id! || product.name!,
      price: Number(product.price),
      name: product.name,
      position: product.position,
      brand: product.brand,
      category: product.category,
      variant: product.variant,
      quantity: product.quantity,
    };
  });
}

export function transformUAPromotionsToSPPromotions(promotions: EEPromo[]): SPPromotion[] {
  return promotions.map((promotion) => ({
    name: promotion.name,
    slot: promotion.position,
    /* Id or name is required, but we in SP-plugin we require id to be present */
    id: promotion.id || promotion.name,
    creative_id: promotion.creative,
  }));
}
