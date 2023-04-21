export interface UAEnhancedEcommerceObject {
  currencyCode?: string;
}

export interface ProductListViewEvent {
  impressions: EEProduct[];
}

export interface ProductListClickEvent {
  click: {
    actionField: { list: string };
    products: EEProduct[];
  };
}

export interface ProductDetailEvent {
  detail: {
    actionField: { list: string };
    products: EEProduct[];
  };
}

export interface AddToCartEvent {
  add: {
    products: EEProduct[];
  };
}

export interface RemoveFromCartEvent {
  remove: {
    products: EEProduct[];
  };
}

export interface PromoViewEvent {
  promoView: {
    promotions: EEPromo[];
  };
}

export interface PromoClickEvent {
  promoClick: {
    promotions: EEPromo[];
  };
}

export interface CheckoutStepEvent {
  checkout: {
    actionField: {
      step: number;
      option?: string;
    };
    products: EEProduct[];
  };
}

export interface PurchaseEvent {
  purchase: {
    actionField: {
      id: string;
      revenue: number | string;
      tax?: number | string;
      shipping?: number | string;
      coupon?: string;
      affiliation?: string;
    };
    products: EEProduct[];
  };
}

export interface EEProduct {
  price?: number | string;
  id?: string;
  name?: string;
  brand?: string;
  category?: string;
  variant?: string;
  quantity?: number;
  position?: number;
  list?: string;
}

export interface EEPromo {
  id: string;
  name: string;
  creative?: string;
  position?: string;
}

export interface EEAction {
  action?: string;
}
