import { describe, expect, it } from "vitest";
import {
  keyDetailRows,
  quickFacts,
  schemaCondition,
  shortSpec,
  titleWithSpecs,
} from "./adPresentation";

// Structured details as ads store them (Listing.attributes).
const DETAILS: Record<string, Record<string, string>> = {
  "canon-eos-250d": {
    condition: "Used",
    deviceType: "Camera",
    brand: "Canon",
    model: "EOS 250D",
    warranty: "No warranty",
    accessories: "18-55mm kit lens, battery, charger",
    availability: "In stock",
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
  "labrador-puppies-kurunegala": {
    listingType: "For sale",
    animalType: "Dog",
    breed: "Labrador Retriever",
    age: "2 months",
    vaccinated: "true",
    pedigree: "false",
  },
  "toyota-vios-2014": {
    condition: "Used",
    brand: "Toyota",
    model: "Aqua",
    year: "2017",
    mileage: "68000",
    fuelType: "Hybrid",
    transmission: "Automatic",
    engineCapacity: "1500",
    bodyType: "Hatchback",
  },
};

const words = {
  yes: "Yes",
  no: "No",
  warrantyMonths: (type: string, months: string) => `${type}, ${months} months`,
};

describe("shortSpec", () => {
  it("shortens processors to the family name", () => {
    expect(shortSpec("processor", "Intel Core i7-1165G7")).toBe("i7");
    expect(shortSpec("processor", "Apple M1")).toBe("M1");
    expect(shortSpec("processor", "Apple M2 Pro")).toBe("M2 Pro");
    expect(shortSpec("processor", "AMD Ryzen 5 5600U")).toBe("Ryzen 5");
  });

  it("keeps an unknown processor as typed", () => {
    expect(shortSpec("processor", "Snapdragon X")).toBe("Snapdragon X");
  });

  it("drops the drive type from storage", () => {
    expect(shortSpec("storage", "512GB SSD")).toBe("512GB");
    expect(shortSpec("storage", "128GB")).toBe("128GB");
  });
});

describe("titleWithSpecs", () => {
  const dell = DETAILS["dell-xps-13-laptop"];

  it("adds the key specs a laptop title leaves out", () => {
    expect(titleWithSpecs("Dell XPS 13 Laptop", dell)).toBe(
      "Dell XPS 13 Laptop (i7, 16GB, 512GB)",
    );
  });

  it("does not repeat specs already in the title", () => {
    expect(titleWithSpecs("Dell XPS 13 i7 16GB", dell)).toBe(
      "Dell XPS 13 i7 16GB (512GB)",
    );
    expect(titleWithSpecs("XPS 13, i7, 16GB, 512GB", dell)).toBe(
      "XPS 13, i7, 16GB, 512GB",
    );
  });

  it("only adds storage for phones", () => {
    expect(titleWithSpecs("iPhone 13", DETAILS["iphone-13-128gb"])).toBe(
      "iPhone 13 (128GB)",
    );
  });

  it("leaves other categories alone", () => {
    expect(
      titleWithSpecs("Toyota Vios 2014", DETAILS["toyota-vios-2014"]),
    ).toBe("Toyota Vios 2014");
    expect(titleWithSpecs("Anything", {})).toBe("Anything");
  });
});

describe("keyDetailRows", () => {
  it("follows the category schema order and labels", () => {
    const rows = keyDetailRows(
      "electronics",
      DETAILS["dell-xps-13-laptop"],
      words,
    );
    expect(rows.map((r) => r.key)).toEqual([
      "condition",
      "deviceType",
      "brand",
      "model",
      "processor",
      "ram",
      "storage",
      "screenSize",
      "warranty",
      "availability",
      "accessories",
    ]);
    expect(rows.find((r) => r.key === "deviceType")?.label).toBe(
      "Type of device",
    );
  });

  it("adds units and folds the warranty length into one row", () => {
    const rows = keyDetailRows(
      "electronics",
      DETAILS["dell-xps-13-laptop"],
      words,
    );
    expect(rows.find((r) => r.key === "screenSize")?.value).toBe("13.4 in");
    expect(rows.find((r) => r.key === "warranty")?.value).toBe(
      "Seller warranty, 6 months",
    );
    expect(rows.some((r) => r.key === "warrantyMonths")).toBe(false);
  });

  it("formats large numbers and toggles", () => {
    const car = keyDetailRows("vehicles", DETAILS["toyota-vios-2014"], words);
    expect(car.find((r) => r.key === "mileage")?.value).toBe("68,000 km");
    const pup = keyDetailRows(
      "animals-pets",
      DETAILS["labrador-puppies-kurunegala"],
      words,
    );
    expect(pup.find((r) => r.key === "vaccinated")?.value).toBe("Yes");
    expect(pup.find((r) => r.key === "pedigree")?.value).toBe("No");
  });

  it("hides fields whose showWhen condition is not met", () => {
    // A laptop-only field on a phone is never shown, even if stored.
    const rows = keyDetailRows(
      "electronics",
      { deviceType: "Phone", processor: "A15", storage: "128GB" },
      words,
    );
    expect(rows.map((r) => r.key)).toEqual(["deviceType", "storage"]);
  });

  it("skips empty values and unknown categories", () => {
    expect(keyDetailRows("electronics", { brand: "" }, words)).toEqual([]);
    expect(keyDetailRows("no-such-category", { brand: "X" }, words)).toEqual(
      [],
    );
  });
});

describe("quickFacts", () => {
  it("lists condition, warranty and availability", () => {
    expect(
      quickFacts(DETAILS["dell-xps-13-laptop"], words.warrantyMonths),
    ).toEqual(["Used", "Seller warranty, 6 months", "In stock"]);
  });

  it("leaves out 'No warranty' and free-text availability", () => {
    expect(quickFacts(DETAILS["canon-eos-250d"], words.warrantyMonths)).toEqual(
      ["Used", "In stock"],
    );
    expect(
      quickFacts({ availability: "Same day bookings" }, words.warrantyMonths),
    ).toEqual([]);
  });
});

describe("schemaCondition", () => {
  it("maps the condition field to schema.org", () => {
    expect(schemaCondition("Brand new")).toBe(
      "https://schema.org/NewCondition",
    );
    expect(schemaCondition("Used")).toBe("https://schema.org/UsedCondition");
    expect(schemaCondition("Refurbished")).toBe(
      "https://schema.org/RefurbishedCondition",
    );
    expect(schemaCondition("Reconditioned")).toBe(
      "https://schema.org/RefurbishedCondition",
    );
    expect(schemaCondition(undefined)).toBeUndefined();
  });
});
