// JSON Schema definitions for the travel planning agent.

export const travelToolDefinitions = [
  {
    name: "searchFlights",

    description:
      "Search mock flight options between Kenyan cities. " +
      "Returns airline, departure time and one-way " +
      "price per traveler in KES.",

    input_schema: {
      type: "object",

      properties: {
        from: {
          type: "string",
          description: "Departure city, for example Nairobi",
        },

        to: {
          type: "string",
          description: "Destination city, for example Mombasa",
        },

        date: {
          type: "string",
          description: "Departure date in YYYY-MM-DD format",
        },
      },

      required: ["from", "to", "date"],
      additionalProperties: false,
    },
  },

  {
    name: "searchHotels",

    description:
      "Search mock hotels in a Kenyan city. Returns " +
      "hotel name, star rating and nightly room price " +
      "in KES for the specified dates and guests.",

    input_schema: {
      type: "object",

      properties: {
        city: {
          type: "string",
          description: "Destination city",
        },

        checkIn: {
          type: "string",
          description: "Check-in date in YYYY-MM-DD format",
        },

        checkOut: {
          type: "string",
          description: "Check-out date in YYYY-MM-DD format",
        },

        guests: {
          type: "integer",
          minimum: 1,
          description: "Number of guests",
        },
      },

      required: [
        "city",
        "checkIn",
        "checkOut",
        "guests",
      ],

      additionalProperties: false,
    },
  },

  {
    name: "checkWeather",

    description:
      "Return simulated weather conditions, temperature " +
      "and travel advice for a Kenyan city and date.",

    input_schema: {
      type: "object",

      properties: {
        city: {
          type: "string",
          description: "Destination city",
        },

        date: {
          type: "string",
          description: "Travel date in YYYY-MM-DD format",
        },
      },

      required: ["city", "date"],
      additionalProperties: false,
    },
  },

  {
    name: "calculateTripCost",

    description:
      "Calculate the estimated trip cost using selected " +
      "flight IDs and one selected hotel ID returned by " +
      "the search tools. Flights are priced per traveler. " +
      "Hotel prices are per room per night. Includes " +
      "daily expenses of KES 2,500 per traveler per day.",

    input_schema: {
      type: "object",

      properties: {
        flights: {
          type: "array",
          minItems: 1,
          uniqueItems: true,

          items: {
            type: "string",
          },

          description:
            "Selected flight IDs, one per journey leg",
        },

        hotels: {
          type: "array",
          minItems: 1,
          maxItems: 1,

          items: {
            type: "string",
          },

          description:
            "One selected hotel ID for the trip",
        },

        nights: {
          type: "integer",
          minimum: 1,
          maximum: 365,
          description: "Number of hotel nights",
        },

        travelers: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          description: "Number of travelers",
        },
      },

      required: [
        "flights",
        "hotels",
        "nights",
        "travelers",
      ],

      additionalProperties: false,
    },
  },
];