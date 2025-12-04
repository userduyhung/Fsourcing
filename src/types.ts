export interface CartItem {
  id?: string;
  productId: string;
  productName?: string;
  name?: string; // Alias for productName for backward compatibility
  price: number;
  image: string; // Luôn là string, không undefined
  quantity: number;
}
