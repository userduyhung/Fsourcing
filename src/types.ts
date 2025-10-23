export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string; // Luôn là string, không undefined
  quantity: number;
}
