export interface GA4EcommerceObject {
  item_list_id?: string;
  item_list_name?: string;
  currency?: string;
  value?: number;
  coupon?: string;
  shipping_tier?: string;
  payment_type?: string;
  transaction_id?: string;
  tax?: number;
  shipping?: number;
  creative_name?: string;
  creative_slot?: string;
  promotion_id?: string;
  promotion_name?: string;
  items: Item[];
}

export interface Item {
  item_id: string;
  item_name?: string;
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price: number;
  quantity?: number;
}

export interface Currency {
  currency: string;
}

export interface ItemList {
  item_list_id: string;
  item_list_name: string;
}

export interface Transaction {
  currency: string;
  transaction_id: string;
  value: number;
  tax: number;
  shipping: number;
  coupon: string;
}

export interface Promotion {
  creative_name: string;
  creative_slot: string;
  promotion_id: string;
  promotion_name: string;
}
