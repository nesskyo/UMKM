export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  created_by: string;
  name: string;
  type: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  price: number;
  stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
  product_categories?: ProductCategory;
}

export interface Transaction {
  id: string;
  business_id: string;
  user_id: string;
  total_amount: number;
  payment_method: "QRIS" | "Cash" | "Transfer Bank" | "Kartu Debit";
  status: "Selesai" | "Batal" | "Pending";
  created_at: string;
  transaction_items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products?: Product;
}

export interface InventoryHistory {
  id: string;
  business_id: string;
  product_id: string;
  change_type: "sale" | "restock" | "adjustment";
  quantity_changed: number;
  notes: string | null;
  recorded_at: string;
  products?: Product;
}

export interface Notification {
  id: string;
  business_id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: "inventory" | "sales" | "transaction" | "system" | "payment" | "recommendation";
  priority: "high" | "medium" | "low";
  is_read: boolean;
  created_at: string;
}

export interface ProductWithCategory extends Product {
  product_categories: ProductCategory;
  status: "Available" | "Low Stock" | "Out of Stock";
}

export interface TransactionWithItems extends Transaction {
  transaction_items: (TransactionItem & { products: Product })[];
}
