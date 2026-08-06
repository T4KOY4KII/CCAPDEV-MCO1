//Airlines
const airlines = [
    "Philippine Airlines",
    "Cebu Pacific",
    "Royal Air Philippines",
    "Philippines AirAsia",
    "Singapore Airlines",
    "Emirates",
    "Cathay Pacific"
];

// Countries (Origin and destination)
const airports = [
    "Manila (MNL)",
    "Cebu (CEB)",
    "Clark (CRK)",
    "Davao (DVO)",
    "Singapore (SIN)",
    "Tokyo (NRT)",
    "Hong Kong (HKG)",
    "Seoul (ICN)",
    "Dubai (DXB)",
    "Kuala Lumpur (KUL)",
    "Sydney (SYD)",
    "Bangkok (BKK)"
];

//Meal options for booking
const mealOptions = [
    { value: 'Standard', label: 'Standard', price: 0 },
    { value: 'Vegetarian', label: 'Vegetarian', price: 250 },
    { value: 'Vegan', label: 'Vegan', price: 250 },
    { value: 'Halal', label: 'Halal', price: 250 },
    { value: 'Kosher', label: 'Kosher', price: 350 },
    { value: 'Gluten-Free', label: 'Gluten-Free', price: 250 }
];

//Seat pricing but only row 1 is the "premium" row in the seat map
const seatPricing = {
    premiumSurcharge: 385
};

//Extra services pricing in PHP
const extraServicesPricing = {
    baggagePerUnit: 1250,
    priorityBoarding: 720,
    travelInsurance: 6780,
    loungeAccess: 2100
};

//Flat taxes & fees rate applied on top of fare + seat + meal + extras
const taxRate = 0.15;

module.exports = { airlines, airports, mealOptions, seatPricing, extraServicesPricing, taxRate };