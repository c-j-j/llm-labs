export type Product = {
  id: string;
  name: string;
  price: number;
};

const PRODUCTS: Product[] = [
  { id: "p-001", name: "Wireless Headphones", price: 129.99 },
  { id: "p-002", name: "Mechanical Keyboard", price: 89.5 },
  { id: "p-003", name: "4K Monitor", price: 349.0 },
  { id: "p-004", name: "USB-C Hub", price: 42.0 },
  { id: "p-005", name: "Ergonomic Mouse", price: 59.99 },
  { id: "p-006", name: "Webcam 1080p", price: 69.0 },
  { id: "p-007", name: "Portable SSD 1TB", price: 119.99 },
  { id: "p-008", name: "Laptop Stand", price: 35.0 },
  { id: "p-009", name: "Smart LED Strip", price: 24.99 },
  { id: "p-010", name: "Bluetooth Speaker", price: 79.99 },
];

const STOCK: Record<string, boolean> = {
  "p-001": true,
  "p-002": true,
  "p-003": false,
  "p-004": true,
  "p-005": true,
  "p-006": false,
  "p-007": true,
  "p-008": true,
  "p-009": true,
  "p-010": false,
};

const SALES: Record<string, boolean> = {
  "p-001": false,
  "p-002": true,
  "p-003": false,
  "p-004": true,
  "p-005": false,
  "p-006": true,
  "p-007": false,
  "p-008": true,
  "p-009": false,
  "p-010": true,
};

export function listProducts(): Product[] {
  return PRODUCTS;
}

export function isInStock(productId: string): boolean {
  return Boolean(STOCK[productId]);
}

export function isOnSale(productId: string): boolean {
  return Boolean(SALES[productId]);
}
