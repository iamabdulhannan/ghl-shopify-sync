export interface ShopifyCustomer {
  id: number;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  total_spent?: string;
  orders_count?: number;
  accepts_marketing?: boolean;
  tags?: string;
}

export interface ShopifyLineItem {
  product_id: number;
  variant_id?: number;
  title: string;
  product_type?: string;
  quantity: number;
  price: string;
  vendor?: string;
  sku?: string;
}

export interface ShopifyOrder {
  id: number;
  email?: string;
  phone?: string;
  total_price?: string;
  currency?: string;
  customer?: ShopifyCustomer;
  line_items?: ShopifyLineItem[];
  financial_status?: string;
  fulfillment_status?: string | null;
  created_at?: string;
}

export interface ShopConfigRecord {
  shop: string;
  ghlApiKey: string;
  ghlLocationId: string;
  vipThreshold: number;
  highValueThreshold: number;
  enableCategoryTags: boolean;
  enableVendorTags: boolean;
  enableOpportunities: boolean;
}
