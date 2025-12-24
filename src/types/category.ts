/**
 * Category Types
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
  products?: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
}


