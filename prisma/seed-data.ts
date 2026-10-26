/*
 * Demo data for prisma/seed.ts only (never imported by the app): the
 * structured details (listingFields keys) and extra photos of the seeded
 * ads, keyed by ad slug. Toggles are "true" / "false", numbers plain digits.
 *
 * Photos (SEED_PHOTOS, in the development Cloudinary account) are from Unsplash
 * (free licence, no attribution required). Credits: toyota-vios Haryad
 * photography (number plate blurred), yamaha-fz-s Ankur Dagar, honda-vezel Ralph Florent,
 * bajaj-three-wheeler Zoshua Colah, iphone-13 Ash-Lab, iphone-14 Thai
 * Nguyen, dell-xps-13 (3 photos) Dell, canon-eos-250d Andrew Hutchings,
 * macbook-air-m1 Isaac Martin, airpods-pro Daniel Romero, sofa-set Goran
 * Ivos, dining-table Jonathan Borba, modern-house-rent Salman Saqib,
 * house-negombo Zoshua Colah, land-gampaha Javier Tavara,
 * apartment-sea-view Far Chinberdiev, party-dress (Unsplash
 * pHA6KL_HpoE), spice-pack
 * Anju Ravindranath, deep-cleaning Giorgio Trovato, mountain-bike Frederik
 * Rosar, labrador-puppy Jairo Alzate, tuition-science Ronald Felton,
 * facial-skincare (Unsplash g6q3lFAe3kA).
 */

// Demo photos, in the development Cloudinary account (oriu4yqh):
//   listings/<name>.webp          ad photos
//   business-covers/<id>.webp     business banners
export const SEED_PHOTOS =
  "https://res.cloudinary.com/oriu4yqh/image/upload/slmarket/seed";

// Where the subject of each cover photo sits (0 to 1), so square and
// wide crops keep it in view. Missing = centre.
export const SEED_PHOTO_FOCUS: Record<string, { x: number; y: number }> = {
  "mountain-bike-21-speed": { x: 0.55, y: 0.62 },
  "designer-party-dress": { x: 0.5, y: 0.45 },
  "facial-skincare-package": { x: 0.45, y: 0.55 },
  "toyota-vios-2014": { x: 0.5, y: 0.5 },
};

// Slugs of demo ads that were replaced; the seed removes them.
export const RETIRED_SEED_SLUGS = ["toyota-aqua-2017"];

export const SEED_AD_DETAILS: Record<string, Record<string, string>> = {
  "toyota-vios-2014": {
    condition: "Used",
    brand: "Toyota",
    model: "Vios",
    year: "2014",
    mileage: "86000",
    fuelType: "Petrol",
    transmission: "Automatic",
    engineCapacity: "1300",
    bodyType: "Sedan",
  },
  "modern-house-for-rent-rajagiriya": {
    listingType: "Rent out",
    propertyType: "House",
    bedrooms: "3",
    bathrooms: "3",
    floorArea: "2500",
    parking: "2",
    furnishing: "Semi-furnished",
  },
  "iphone-13-128gb": {
    condition: "Used",
    deviceType: "Phone",
    brand: "Apple",
    model: "iPhone 13",
    storage: "128GB",
    warranty: "Seller warranty",
    warrantyMonths: "3",
    accessories: "Original box, charger",
    availability: "In stock",
  },
  "sofa-set-3-1-1": {
    condition: "Used",
    itemType: "Furniture",
    material: "Fabric",
    dimensions: "3 seater + 2 single chairs",
  },
  "dell-xps-13-laptop": {
    condition: "Used",
    deviceType: "Laptop",
    brand: "Dell",
    model: "XPS 13 9310",
    processor: "Intel Core i7-1165G7",
    ram: "16GB",
    storage: "512GB SSD",
    screenSize: "13.4",
    warranty: "Seller warranty",
    warrantyMonths: "6",
    accessories: "Charger, original box",
    availability: "In stock",
  },
  "yamaha-fz-s-v3": {
    condition: "Used",
    brand: "Yamaha",
    model: "FZ-S V3",
    year: "2019",
    mileage: "32000",
    fuelType: "Petrol",
    transmission: "Manual",
    engineCapacity: "150",
  },
  "dining-table-set-negombo": {
    condition: "Used",
    itemType: "Furniture",
    material: "Solid wood",
    dimensions: "6 seater",
  },
  "canon-eos-250d": {
    condition: "Used",
    deviceType: "Camera",
    brand: "Canon",
    model: "EOS 250D",
    warranty: "No warranty",
    accessories: "18-55mm kit lens, battery, charger",
    availability: "In stock",
  },
  "3br-house-negombo": {
    listingType: "Sell",
    propertyType: "House",
    bedrooms: "3",
    bathrooms: "2",
    floorArea: "1800",
    landSize: "10",
    parking: "1",
    furnishing: "Unfurnished",
  },
  "accountant-full-time-colombo": {
    employmentType: "Full-time",
    workMode: "On-site",
    industry: "Accounting & finance",
    positions: "1",
    experienceLevel: "Mid level",
    salaryPeriod: "Per month",
  },
  "10-perches-land-gampaha": {
    listingType: "Sell",
    propertyType: "Land",
    landSize: "10",
  },
  "designer-party-dress": {
    condition: "Brand new",
    gender: "Women",
    size: "M",
    color: "Ivory white",
  },
  "organic-spice-pack": {
    foodType: "Spices & condiments",
    pricedBy: "Per pack",
    homemade: "true",
    delivery: "true",
  },
  "home-deep-cleaning-colombo": {
    serviceCategory: "Cleaning",
    serviceMode: "At your place",
    experience: "6",
    availability: "Same day bookings",
    teamSize: "4",
  },
  "mountain-bike-21-speed": { condition: "Used" },
  "labrador-puppies-kurunegala": {
    listingType: "For sale",
    animalType: "Dog",
    breed: "Labrador Retriever",
    age: "2 months",
    vaccinated: "true",
    pedigree: "false",
  },
  "tuition-physical-science-kandy": {},
  "facial-skincare-package": {},
  "honda-vezel-2016-galle": {
    condition: "Used",
    brand: "Honda",
    model: "Vezel",
    year: "2016",
    mileage: "84000",
    fuelType: "Hybrid",
    transmission: "Automatic",
    engineCapacity: "1500",
    bodyType: "SUV",
  },
  "bajaj-three-wheeler-gampaha": {
    condition: "Used",
    brand: "Bajaj",
    model: "RE 4 Stroke",
    year: "2019",
    mileage: "56000",
    fuelType: "Petrol",
    transmission: "Manual",
    engineCapacity: "200",
  },
  "apartment-for-rent-colombo": {
    listingType: "Rent out",
    propertyType: "Apartment",
    bedrooms: "2",
    bathrooms: "2",
    floorArea: "1150",
    parking: "1",
    furnishing: "Furnished",
  },
  "macbook-air-m1": {
    condition: "Used",
    deviceType: "Laptop",
    brand: "Apple",
    model: "MacBook Air (M1, 2020)",
    processor: "Apple M1",
    ram: "8GB",
    storage: "256GB SSD",
    screenSize: "13.3",
    warranty: "Seller warranty",
    warrantyMonths: "3",
    accessories: "Charger",
    availability: "In stock",
  },
  "iphone-14-128gb-kandy": {
    condition: "Used",
    deviceType: "Phone",
    brand: "Apple",
    model: "iPhone 14",
    storage: "128GB",
    warranty: "Under warranty",
    warrantyMonths: "5",
    availability: "In stock",
  },
  "airpods-pro-2": {
    condition: "Brand new",
    deviceType: "Audio",
    brand: "Apple",
    model: "AirPods Pro (2nd generation)",
    warranty: "Under warranty",
    warrantyMonths: "12",
    availability: "In stock",
  },
};

const IMG = `${SEED_PHOTOS}/listings`;

// Extra photos after the main one (only some sample ads have more).
export const SEED_AD_EXTRA_PHOTOS: Record<string, string[]> = {
  "dell-xps-13-laptop": [
    `${IMG}/dell-xps-13-2.webp`,
    `${IMG}/dell-xps-13-3.webp`,
  ],
};
