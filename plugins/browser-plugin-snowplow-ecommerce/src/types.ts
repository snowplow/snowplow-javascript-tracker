import { CommonEventProperties } from '@snowplow/tracker-core';

/**
 * Type/Schema for an ecommerce Action
 */
export interface Action {
  /**
   * Standard ecommerce actions
   */
  type:
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'product_view'
    | 'list_click'
    | 'list_view'
    | 'promo_click'
    | 'promo_view'
    | 'checkout_step'
    | 'transaction'
    | 'refund'
    | 'trns_error';

  /**
   * You can add a name for the list presented to the user.
   * E.g. product list, search results, shop the look, frequently bought with
   */
  name?: string;
}

/**
 * Type/Schema for a checkout_step event in Ecommerce
 */
export interface CheckoutStep {
  /* Checkout step index */
  step: number;
  /* Shipping address postcode */
  shipping_postcode?: string;
  /* Billing address postcode */
  billing_postcode?: string;
  /* Full shipping address */
  shipping_full_address?: string;
  /* Full billing address */
  billing_full_address?: string;
  /* Can be used to discern delivery providers DHL, PostNL etc. */
  delivery_provider?: string;
  /* Store pickup, standard delivery, express delivery, international */
  delivery_method?: string;
  /* Coupon applied at checkout */
  coupon_code?: string;
  /* Selection of 'existing user' or 'guest checkout' */
  account_type?: string;
  /* Any kind of payment method the user selected to proceed. Card, PayPal, Alipay etc. */
  payment_method?: string;
  /* Invoice or receipt */
  proof_of_payment?: string;
  /* If opted in to marketing campaigns to the email address */
  marketing_opt_in?: boolean;
}

/**
 * Type for a cart entity in Ecommerce
 */
export interface Cart {
  /**
   * The unique ID representing this cart
   */
  cart_id?: string;
  /**
   * The total value of the cart after this interaction
   */
  total_value: number;
  /**
   * The currency used for this cart (ISO 4217)
   */
  currency: string;
  /**
   * Array of products added/removed from cart
   */
  products?: Product[];
}

/**
 * Type/Schema for a page entity in Ecommerce
 */
export interface Page {
  /**
   * The type of the page that was visited (e.g. homepage, product page, cart,checkout page, etc)
   */
  type: string;
  /**
   * The language that the web page is based in
   */
  language?: string;
  /**
   * The locale version of the site that is running
   */
  locale?: string;
}

/**
 * Type/Schema for a product entity in Ecommerce
 */
export type Product = {
  /**
   * The SKU or product ID
   */
  id: string;
  /**
   * The name or title of the product
   */
  name?: string;
  /**
   * The category the product belongs to.
   * Use a consistent separator to express multiple levels. E.g. Woman/Shoes/Sneakers
   */
  category?: string;
  /**
   * The price of the product at the current time.
   */
  price: number;
  /**
   * The recommended or list price of a product
   */
  list_price?: number;
  /**
   * The quantity of the product taking part in the action. Used for Cart events.
   */
  quantity?: number;
  /**
   * The size of the product
   */
  size?: string;
  /**
   * The variant of the product
   */
  variant?: string;
  /**
   * The brand of the product
   */
  brand?: string;
  /**
   * The inventory status of the product (e.g. in stock, out of stock, preorder, backorder, etc)
   */
  inventory_status?: string;
  /**
   * The position the product was presented in a list of products (search results, product list page, etc)
   */
  position?: number;
  /**
   * The currency in which the product is being priced (ISO 4217)
   */
  currency: string;
  /**
   * Identifier/Name/Url for the creative presented on a list or product view.
   */
  creative_id?: string;
};

/**
 * Type/Schema for a promotion entity in Ecommerce
 */
export interface SPPromotion {
  /**
   * The ID of the promotion.
   */
  id: string;
  /**
   * The name of the promotion.
   */
  name?: string | null;
  /**
   * Array of SKUs or product IDs showcased in the promotion.
   */
  product_ids?: string[] | null;
  /**
   * The position the promotion was presented in a list of promotions E.g. banner, slider.
   */
  position?: number | null;
  /**
   * Identifier/Name/Url for the creative presented on the promotion.
   */
  creative_id?: string | null;
  /**
   * Type of the promotion delivery mechanism. E.g. popup, banner, intra-content
   */
  type?: string | null;
  /**
   * The website slot in which the promotional content was added to.
   */
  slot?: string | null;
}

/**
 * Type/Schema for a transaction entity in Ecommerce
 */
export interface SPTransaction {
  /**
   * The ID of the transaction
   */
  transaction_id: string;
  /**
   * The total value of the transaction
   */
  revenue: number;
  /**
   * The currency used for the transaction
   */
  currency: string;
  /**
   * The payment method used for the transaction
   */
  payment_method: string;
  /**
   * Total quantity of items in the transaction
   */
  total_quantity?: number;
  /**
   * Total amount of tax on the transaction
   */
  tax?: number;
  /**
   * Total cost of shipping on the transaction
   */
  shipping?: number;
  /**
   * Discount code used
   */
  discount_code?: string;
  /**
   * Discount amount taken off
   */
  discount_amount?: number;
  /**
   * Whether the transaction is a credit order or not
   */
  credit_order?: boolean;
  /**
   * Array of products on the transaction from cart
   */
  products?: Product[];
}

/**
 * Type/Schema for a refund entity in Ecommerce
 */
export interface Refund {
  /**
   * The ID of the transaction.
   */
  transaction_id: string;
  /**
   * The currency in which the product is being priced (ISO 4217).
   */
  currency: string;
  /**
   * The monetary amount refunded.
   */
  refund_amount: number;
  /**
   * Reason for refunding the whole or part of the transaction.
   */
  refund_reason?: string | null;
  /**
   * Array of products on the refund. This is used when specific products are refunded.
   * If not present, the whole transaction and products will be marked as refunded.
   */
  products?: Product[];
}

/**
 * Type/Schema for a transaction error entity in Ecommerce
 */
export interface TransactionError {
  /**
   * Error-identifying code for the transaction issue. E.g. E522
   */
  error_code?: string;
  /**
   * Shortcode for the error occurred in the transaction. E.g. declined_by_stock_api, declined_by_payment_method, card_declined, pm_card_radarBlock
   */
  error_shortcode?: string;
  /**
   * Longer description for the error occurred in the transaction.
   */
  error_description?: string;
  /**
   * Type of error.
   * Hard error types mean the customer must provide another form of payment e.g. an expired card.
   * Soft errors can be the result of temporary issues where retrying might be successful e.g. processor declined the transaction.
   */
  error_type?: 'hard' | 'soft' | null;
  /**
   * The resolution selected for the error scenario. E.g. retry_allowed, user_blacklisted, block_gateway, contact_user, default
   */
  resolution?: string;
  /**
   * The transaction object representing the transaction that ended up in an error.
   */
  transaction: SPTransaction;
}

/**
 * Type/Schema for an user entity in Ecommerce
 */
export interface User {
  /**
   * The user ID
   */
  id: string;
  /**
   * Whether or not the user is a guest
   */
  is_guest?: boolean;
  /**
   * The user's email address
   */
  email?: string;
}

export interface CommonEcommerceEventProperties<T = Record<string, unknown>> extends CommonEventProperties<T> {
  /** Add context to an event by setting an Array of Self Describing JSON */
  context?: Exclude<CommonEventProperties<T>['context'], null>;
}

export type ListViewEvent = { name: string; products: Product[] };

export type ListClickEvent = { name: string; product: Product };
