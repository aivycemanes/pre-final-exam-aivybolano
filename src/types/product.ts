export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  specifications: string;
  rating: number;
  price: number;
  quantity: number;
  image: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
}
