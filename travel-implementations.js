// All travel information is simulated for this assignment.
// These are not live flight prices, bookings or forecasts.

const flights = [
  {
    id: "FL001",
    airline: "Kenya Airways",
    from: "Nairobi",
    to: "Mombasa",
    departureTime: "08:00",
    price: 8500,
  },
  {
    id: "FL002",
    airline: "Jambojet",
    from: "Nairobi",
    to: "Mombasa",
    departureTime: "10:30",
    price: 7200,
  },
  {
    id: "FL003",
    airline: "Skyward Express",
    from: "Nairobi",
    to: "Mombasa",
    departureTime: "14:15",
    price: 7800,
  },
  {
    id: "FL004",
    airline: "Kenya Airways",
    from: "Mombasa",
    to: "Nairobi",
    departureTime: "09:00",
    price: 8700,
  },
  {
    id: "FL005",
    airline: "Jambojet",
    from: "Mombasa",
    to: "Nairobi",
    departureTime: "16:30",
    price: 7300,
  },
];

const hotels = [
  {
    id: "HT001",
    name: "Nyali Beach Hotel",
    city: "Mombasa",
    stars: 4,
    pricePerNight: 12000,
    guestsPerRoom: 2,
  },
  {
    id: "HT002",
    name: "Bamburi Coast Resort",
    city: "Mombasa",
    stars: 3,
    pricePerNight: 8500,
    guestsPerRoom: 2,
  },
  {
    id: "HT003",
    name: "Coral Ocean Retreat",
    city: "Mombasa",
    stars: 5,
    pricePerNight: 18000,
    guestsPerRoom: 2,
  },
];

const weatherData = {
  mombasa: {
    temperature: 28,
    conditions: "Sunny with a coastal breeze",
    advisory:
      "Carry sunscreen, light clothing and drinking water.",
  },

  nairobi: {
    temperature: 23,
    conditions: "Partly cloudy",
    advisory:
      "Carry a light jacket for cooler evenings.",
  },

  kisumu: {
    temperature: 27,
    conditions: "Warm with possible showers",
    advisory:
      "Carry an umbrella and lightweight clothing.",
  },
};

const DAILY_EXPENSE_PER_TRAVELER = 2500;

// Validate city names before processing.
function normaliseCity(city) {
  if (typeof city !== "string" || !city.trim()) {
    throw new Error("A valid city name is required.");
  }

  return city.trim().toLowerCase();
}

// Validate ISO date strings.
function validateDate(date) {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    throw new Error("Use YYYY-MM-DD date format.");
  }

  const parsed = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error(`Invalid date: ${date}`);
  }

  return parsed;
}

// TOOL 1: Search flights.
export function searchFlights({ from, to, date }) {
  validateDate(date);

  const departure = normaliseCity(from);
  const destination = normaliseCity(to);

  const results = flights.filter(
    (flight) =>
      flight.from.toLowerCase() === departure &&
      flight.to.toLowerCase() === destination
  );

  return {
    from,
    to,
    date,
    currency: "KES",
    pricing: "One-way price per traveler",
    source: "mock",

    flights: results.map((flight) => ({
      ...flight,
      date,
    })),
  };
}

// TOOL 2: Search hotels.
export function searchHotels({
  city,
  checkIn,
  checkOut,
  guests,
}) {
  const arrival = validateDate(checkIn);
  const departure = validateDate(checkOut);

  if (departure <= arrival) {
    throw new Error(
      "Check-out must be after check-in."
    );
  }

  if (
    !Number.isSafeInteger(guests) ||
    guests < 1 ||
    guests > 100
  ) {
    throw new Error(
      "Guest count must be between 1 and 100."
    );
  }

  const destination = normaliseCity(city);

  const nights =
    (departure.getTime() - arrival.getTime()) /
    (1000 * 60 * 60 * 24);

  const results = hotels
    .filter(
      (hotel) =>
        hotel.city.toLowerCase() === destination
    )
    .map((hotel) => {
      const roomsRequired = Math.ceil(
        guests / hotel.guestsPerRoom
      );

      return {
        ...hotel,
        roomsRequired,
        estimatedHotelCost:
          hotel.pricePerNight *
          nights *
          roomsRequired,
      };
    });

  return {
    city,
    checkIn,
    checkOut,
    guests,
    nights,
    currency: "KES",
    source: "mock",
    hotels: results,
  };
}

// TOOL 3: Check simulated weather.
export function checkWeather({ city, date }) {
  validateDate(date);

  const destination = normaliseCity(city);

  if (!Object.hasOwn(weatherData, destination)) {
    return {
      city,
      date,
      available: false,
      message: "No mock weather data for this city.",
    };
  }

  return {
    city,
    date,
    available: true,
    ...weatherData[destination],
    unit: "Celsius",
    source: "mock",
  };
}

// TOOL 4: Calculate the total trip cost.
export function calculateTripCost({
  flights: selectedFlightIds,
  hotels: selectedHotelIds,
  nights,
  travelers,
}) {
  if (
    !Number.isSafeInteger(nights) ||
    nights < 1 ||
    nights > 365
  ) {
    throw new Error("Nights must be between 1 and 365.");
  }

  if (
    !Number.isSafeInteger(travelers) ||
    travelers < 1 ||
    travelers > 100
  ) {
    throw new Error(
      "Traveler count must be between 1 and 100."
    );
  }

  if (
    !Array.isArray(selectedFlightIds) ||
    selectedFlightIds.length === 0
  ) {
    throw new Error("Select at least one flight.");
  }

  if (
    new Set(selectedFlightIds).size !==
    selectedFlightIds.length
  ) {
    throw new Error("Duplicate flight IDs are not allowed.");
  }

  if (
    !Array.isArray(selectedHotelIds) ||
    selectedHotelIds.length !== 1
  ) {
    throw new Error("Select exactly one hotel.");
  }

  // Retrieve actual flight prices from the mock catalogue.
  const selectedFlights = selectedFlightIds.map((id) => {
    const flight = flights.find(
      (item) => item.id === id
    );

    if (!flight) {
      throw new Error(`Flight ${id} was not found.`);
    }

    return flight;
  });

  // Prevent multiple alternative flights from being charged
  // as if they were separate journey legs.
  const journeyLegs = selectedFlights.map(
    (flight) => `${flight.from}-${flight.to}`
  );

  if (new Set(journeyLegs).size !== journeyLegs.length) {
    throw new Error("Select only one flight per journey leg.");
  }

  const hotel = hotels.find(
    (item) => item.id === selectedHotelIds[0]
  );

  if (!hotel) {
    throw new Error("Selected hotel was not found.");
  }

  // Ensure the chosen hotel matches the outward destination.
  if (
    selectedFlights[0].to.toLowerCase() !==
    hotel.city.toLowerCase()
  ) {
    throw new Error(
      "The hotel does not match the flight destination."
    );
  }

  // Calculate flight cost for all travelers.
  const flightCost = selectedFlights.reduce(
    (sum, flight) =>
      sum + flight.price * travelers,
    0
  );

  // Calculate the number of required hotel rooms.
  const roomsRequired = Math.ceil(
    travelers / hotel.guestsPerRoom
  );

  const hotelCost =
    hotel.pricePerNight *
    nights *
    roomsRequired;

  // For this assignment, budgeted days equal hotel nights.
  const days = nights;

  const dailyExpenses =
    DAILY_EXPENSE_PER_TRAVELER *
    travelers *
    days;

  const total =
    flightCost +
    hotelCost +
    dailyExpenses;

  return {
    flights: selectedFlights,

    hotel: hotel.name,

    travelers,
    nights,
    budgetedDays: days,
    roomsRequired,

    flightCost,
    hotelCost,

    dailyExpensePerTraveler:
      DAILY_EXPENSE_PER_TRAVELER,

    dailyExpenses,

    total,

    costPerTraveler: Number(
      (total / travelers).toFixed(2)
    ),

    currency: "KES",
    source: "mock",
    status: "estimated",
  };
}

// Register available tools for the travel agent.
export const travelImplementations = {
  searchFlights,
  searchHotels,
  checkWeather,
  calculateTripCost,
};