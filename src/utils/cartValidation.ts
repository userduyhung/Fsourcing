import { CartItem } from '../types';

const PLACEHOLDER = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

export function sanitizeCartItems(items: any[]): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((it, idx) => {
    const id = String(it.id ?? `local-${Date.now()}-${idx}`);
    const productId = String(it.productId ?? it.id ?? `unknown-${Date.now()}-${idx}`);
    const productName = String(it.productName ?? it.name ?? 'Sản phẩm');
    const name = productName; // Alias for backward compatibility
    const price = Number(it.price) || 0;
    const image = it.image ? String(it.image) : PLACEHOLDER;
    const quantity = Number(it.quantity) && Number(it.quantity) > 0 ? Math.floor(Number(it.quantity)) : 1;
    return { id, productId, productName, name, price, image, quantity };
  });
}

export function validateCartItems(items: CartItem[]): string[] {
  const errors: string[] = [];
  items.forEach((it, i) => {
    if (!it.id) errors.push(`Item[${i}] missing id`);
    if (!it.productId) errors.push(`Item[${i}] missing productId`);
    if (!it.productName && !it.name) errors.push(`Item[${i}] missing name`);
    if (typeof it.price !== 'number' || Number.isNaN(it.price)) errors.push(`Item[${i}] invalid price`);
    if (!it.image) errors.push(`Item[${i}] missing image`);
    if (typeof it.quantity !== 'number' || it.quantity < 1) errors.push(`Item[${i}] invalid quantity`);
  });
  return errors;
}

export default { sanitizeCartItems, validateCartItems };
