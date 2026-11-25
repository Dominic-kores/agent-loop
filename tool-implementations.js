import { products } from "./products.js";

const VAT_RATE = 0.16;

// Helper function for finding a product by ID.
function findProduct(productId) {
  if (!Number.isInteger(productId)) {
    throw new Error("Product ID must be an integer.");
  }

  const product = products.find(
    (item) => item.id === productId
  );

  if (!product) {
    throw new Error(`Product ${productId} was not found.`);
  }

  return product;
}

// Convert internal product data into a public result.
function formatProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    inStock: product.quantity > 0,
    currency: "KES",
  };
}

// Normalise search terms to improve matching.
function normalise(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) =>
      word.length > 3 ? word.replace(/s$/, "") : word
    )
    .join(" ");
}

// TOOL 1: Search for products.
export function searchProducts({ query }) {
  if (typeof query !== "string" || !query.trim()) {
    throw new Error("A valid search query is required.");
  }

  const words = normalise(query).split(" ");

  // Every search word must match the name or category.
  const results = products.filter((product) => {
    const searchableText = normalise(
      `${product.name} ${product.category}`
    );

    return words.every((word) =>
      searchableText.includes(word)
    );
  });

  // An empty array is a valid result, not a system error.
  return results.map(formatProduct);
}

// TOOL 2: Check detailed stock information.
export function checkStock({ productId }) {
  const product = findProduct(productId);

  return {
    productId: product.id,
    name: product.name,
    inStock: product.quantity > 0,
    quantityAvailable: product.quantity,
    warehouse: product.warehouse,

    restockDate:
      product.quantity === 0
        ? product.restockDate
        : null,
  };
}

// TOOL 3: Calculate purchase totals.
export function calculateTotal({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one product is required.");
  }

  // Combine duplicate product IDs to prevent a customer
  // from requesting more stock than is available.
  const groupedItems = new Map();

  for (const item of items) {
    const { productId, quantity } = item;

    findProduct(productId);

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw new Error("Quantity must be a positive integer.");
    }

    groupedItems.set(
      productId,
      (groupedItems.get(productId) || 0) + quantity
    );
  }

  const orderItems = [];

  for (const [productId, quantity] of groupedItems) {
    const product = findProduct(productId);

    // Never calculate an unavailable purchase.
    if (quantity > product.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. ` +
        `Requested: ${quantity}. ` +
        `Available: ${product.quantity}.`
      );
    }

    orderItems.push({
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      lineTotal: product.price * quantity,
    });
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );

  // Round currency calculations to two decimal places.
  const vat = Number(
    (subtotal * VAT_RATE).toFixed(2)
  );

  const total = Number(
    (subtotal + vat).toFixed(2)
  );

  return {
    items: orderItems,
    subtotal,
    vatRate: "16%",
    vat,
    total,
    currency: "KES",

    // This project provides a quotation, not a real order.
    status: "quotation",
  };
}

// TOOL 4: Recommend alternative products.
export function getAlternatives({ productId }) {
  const originalProduct = findProduct(productId);

  const alternatives = products
    .filter(
      (product) =>
        product.category === originalProduct.category &&
        product.id !== originalProduct.id &&
        product.quantity > 0
    )
    .slice(0, 3)
    .map((product) => ({
      ...formatProduct(product),
      quantityAvailable: product.quantity,
    }));

  return {
    requestedProduct: originalProduct.name,
    category: originalProduct.category,
    alternatives,
  };
}

// Map tool names to their actual JavaScript functions.
export const shoppingImplementations = {
  searchProducts,
  checkStock,
  calculateTotal,
  getAlternatives,
};