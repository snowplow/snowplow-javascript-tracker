import { CommonEventProperties, SelfDescribingJson } from '@snowplow/tracker-core';

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
    | 'checkout_step'
    | 'transaction';

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
 * Type/Schema for a transaction entity in Ecommerce
 */
export interface Transaction {
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

export interface CommonEcommerceEventProperties extends CommonEventProperties {
  /** Add context to an event by setting an Array of Self Describing JSON */
  context?: Array<SelfDescribingJson>;
}

export type ListViewEvent = { name: string; products: Product[] };

export type ListClickEvent = { name: string; product: Product };
