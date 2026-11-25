import test from "node:test";
import assert from "node:assert/strict";

import {
  searchProducts,
  checkStock,
  calculateTotal,
  getAlternatives,
} from "./tool-implementations.js";

import {
  searchFlights,
  searchHotels,
  checkWeather,
  calculateTripCost,
} from "./travel-implementations.js";

// TEST 1: Product discovery.
test("Search returns Kenyan Coffee", () => {
  const results = searchProducts({
    query: "Kenyan Coffee",
  });

  assert.equal(results[0].id, 3);
  assert.equal(results[0].price, 1200);
});

// TEST 2: No matching products.
test("Unknown product returns an empty array", () => {
  const results = searchProducts({
    query: "Unknown Smartphone",
  });

  assert.deepEqual(results, []);
});

// TEST 3: Stock availability.
test("Kenyan Coffee has available stock", () => {
  const result = checkStock({
    productId: 3,
  });

  assert.equal(result.inStock, true);
  assert.equal(result.quantityAvailable, 50);
});

// TEST 4: Out-of-stock product.
test("Sisal Basket Bag is out of stock", () => {
  const result = checkStock({
    productId: 4,
  });

  assert.equal(result.inStock, false);
  assert.equal(result.quantityAvailable, 0);
});

// TEST 5: VAT calculation.
test("Shopping quotation includes 16% VAT", () => {
  const result = calculateTotal({
    items: [
      { productId: 3, quantity: 2 },
      { productId: 1, quantity: 1 },
    ],
  });

  assert.equal(result.subtotal, 4900);
  assert.equal(result.vat, 784);
  assert.equal(result.total, 5684);
});

// TEST 6: Reject insufficient stock.
test("Reject purchase exceeding available stock", () => {
  assert.throws(
    () =>
      calculateTotal({
        items: [
          { productId: 3, quantity: 100 },
        ],
      }),
    /Insufficient stock/
  );
});

// TEST 7: Reject invalid quantities.
test("Reject negative product quantity", () => {
  assert.throws(
    () =>
      calculateTotal({
        items: [
          { productId: 3, quantity: -2 },
        ],
      }),
    /positive integer/
  );
});

// TEST 8: Alternative recommendations.
test("Alternatives are available in the same category", () => {
  const result = getAlternatives({
    productId: 4,
  });

  assert.equal(result.alternatives.length, 3);

  assert.ok(
    result.alternatives.every(
      (product) =>
        product.inStock &&
        product.category === "Accessories"
    )
  );
});

// TEST 9: Flight search.
test("Find three Nairobi-Mombasa flight options", () => {
  const result = searchFlights({
    from: "Nairobi",
    to: "Mombasa",
    date: "2026-12-10",
  });

  assert.equal(result.flights.length, 3);
});

// TEST 10: Hotel search.
test("Find Mombasa hotels for three nights", () => {
  const result = searchHotels({
    city: "Mombasa",
    checkIn: "2026-12-10",
    checkOut: "2026-12-13",
    guests: 2,
  });

  assert.equal(result.nights, 3);
  assert.equal(result.hotels.length, 3);
});

// TEST 11: Simulated weather.
test("Return simulated Mombasa weather", () => {
  const result = checkWeather({
    city: "Mombasa",
    date: "2026-12-10",
  });

  assert.equal(result.temperature, 28);
  assert.equal(result.source, "mock");
});

// TEST 12: Travel cost calculation.
test("Calculate total trip cost of KES 68,000", () => {
  const result = calculateTripCost({
    flights: ["FL001"],
    hotels: ["HT001"],
    nights: 3,
    travelers: 2,
  });

  assert.equal(result.flightCost, 17000);
  assert.equal(result.hotelCost, 36000);
  assert.equal(result.dailyExpenses, 15000);
  assert.equal(result.total, 68000);
});