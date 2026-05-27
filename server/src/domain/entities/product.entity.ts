export interface Product {
  _id?: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  tags: string[];
  price: number;
  offerPrice?: number;
  stock: number;
  images: string[];
  merchantId: string;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
