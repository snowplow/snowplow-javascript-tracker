import { Product, Promotion } from '../types';
import { Item, Promotion as GA4Promotion, GA4EcommerceObject } from './types';

interface GA4ItemTransformation {
  items: Item[];
  currency?: string;
  categorySeparator?: string;
}

export function transformG4ItemsToSPProducts({
  items,
  currency = 'USD',
  categorySeparator = '/',
}: GA4ItemTransformation): Product[] {
  return items.map((ga4Item) => {
    const { item_category, item_category2, item_category3, item_category4, item_category5 } = ga4Item;
    const category = [item_category, item_category2, item_category3, item_category4, item_category5]
      .filter(Boolean)
      .join(categorySeparator);

    return {
      currency,
      id: ga4Item.item_id,
      name: ga4Item.item_name,
      list_price: ga4Item.price,
      price: ga4Item.price - (ga4Item.discount || 0),
      position: ga4Item.index,
      brand: ga4Item.item_brand,
      category,
      variant: ga4Item.item_variant,
      quantity: ga4Item.quantity,
    };
  });
}

export function transformGA4PromotionToSPPromotion(promotion: GA4EcommerceObject & GA4Promotion): Promotion {
  const productIds = promotion.items.map((item) => item.item_id);

  return {
    id: promotion.promotion_id,
    name: promotion.promotion_name,
    creative_id: promotion.creative_name,
    slot: promotion.creative_slot,
    product_ids: productIds,
  };
}
