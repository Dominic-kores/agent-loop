// Tool definitions that will be sent to Claude.
// JSON Schema describes the arguments each tool accepts.

export const toolDefinitions = [
  {
    name: "searchProducts",

    description:
      "Search the Kenyan product catalogue by product name " +
      "or category. Returns matching products with ID, name, " +
      "price in KES, category and stock status.",

    input_schema: {
      type: "object",

      properties: {
        query: {
          type: "string",
          description:
            "Product name or category, for example Kenyan Coffee",
        },
      },

      required: ["query"],
      additionalProperties: false,
    },
  },

  {
    name: "checkStock",

    description:
      "Check the exact available quantity, warehouse location " +
      "and restock date of a specific product. Always use this " +
      "before confirming product availability.",

    input_schema: {
      type: "object",

      properties: {
        productId: {
          type: "integer",
          description: "Product ID returned by searchProducts",
        },
      },

      required: ["productId"],
      additionalProperties: false,
    },
  },

  {
    name: "calculateTotal",

    description:
      "Calculate the subtotal, 16% VAT and grand total in KES " +
      "for a list of products and quantities. Only use after " +
      "checking that sufficient stock is available.",

    input_schema: {
      type: "object",

      properties: {
        items: {
          type: "array",
          minItems: 1,

          items: {
            type: "object",

            properties: {
              productId: {
                type: "integer",
                description: "Unique product ID",
              },

              quantity: {
                type: "integer",
                minimum: 1,
                description: "Number of units requested",
              },
            },

            required: ["productId", "quantity"],
            additionalProperties: false,
          },
        },
      },

      required: ["items"],
      additionalProperties: false,
    },
  },

  {
    name: "getAlternatives",

    description:
      "Find up to three available alternative products in " +
      "the same category when a requested product is out " +
      "of stock or has insufficient quantity.",

    input_schema: {
      type: "object",

      properties: {
        productId: {
          type: "integer",
          description: "ID of the unavailable product",
        },
      },

      required: ["productId"],
      additionalProperties: false,
    },
  },
];