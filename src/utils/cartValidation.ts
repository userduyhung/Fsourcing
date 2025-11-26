import { CartItem } from '../types';

const PLACEHOLDER = 'https://via.placeholder.com/150?text=No+Image';

export function sanitizeCartItems(items: any[]): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((it, idx) => {
    const id = String(it.id ?? `local-${Date.now()}-${idx}`);
    const name = String(it.name ?? it.productName ?? 'Sản phẩm');
    const price = Number(it.price) || 0;
    const image = it.image ? String(it.image) : PLACEHOLDER;
    const quantity = Number(it.quantity) && Number(it.quantity) > 0 ? Math.floor(Number(it.quantity)) : 1;
    return { id, name, price, image, quantity };
  });
}

export function validateCartItems(items: CartItem[]): string[] {
  const errors: string[] = [];
  items.forEach((it, i) => {
    if (!it.id) errors.push(`Item[${i}] missing id`);
    if (!it.name) errors.push(`Item[${i}] missing name`);
    if (typeof it.price !== 'number' || Number.isNaN(it.price)) errors.push(`Item[${i}] invalid price`);
    if (!it.image) errors.push(`Item[${i}] missing image`);
    if (typeof it.quantity !== 'number' || it.quantity < 1) errors.push(`Item[${i}] invalid quantity`);
  });
  return errors;
}

export default { sanitizeCartItems, validateCartItems };
