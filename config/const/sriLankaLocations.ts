/*
 * Sri Lanka location data for the ad-posting location picker and, later,
 * search filters. Districts grouped by province; each district carries the
 * towns people actually search by.
 */

export type District = {
  name: string;
  province: string;
  cities: string[];
};

export const SRI_LANKA_DISTRICTS: District[] = [
  {
    name: "Colombo",
    province: "Western",
    cities: [
      "Colombo",
      "Dehiwala",
      "Mount Lavinia",
      "Moratuwa",
      "Nugegoda",
      "Kotte",
      "Battaramulla",
      "Maharagama",
      "Kesbewa",
      "Piliyandala",
      "Homagama",
      "Kaduwela",
      "Kolonnawa",
      "Kottawa",
    ],
  },
  {
    name: "Gampaha",
    province: "Western",
    cities: [
      "Gampaha",
      "Negombo",
      "Ja-Ela",
      "Wattala",
      "Kelaniya",
      "Kadawatha",
      "Kiribathgoda",
      "Ragama",
      "Minuwangoda",
      "Katunayake",
      "Nittambuwa",
      "Veyangoda",
      "Divulapitiya",
    ],
  },
  {
    name: "Kalutara",
    province: "Western",
    cities: [
      "Kalutara",
      "Panadura",
      "Horana",
      "Beruwala",
      "Aluthgama",
      "Wadduwa",
      "Matugama",
      "Bandaragama",
      "Ingiriya",
    ],
  },
  {
    name: "Kandy",
    province: "Central",
    cities: [
      "Kandy",
      "Katugastota",
      "Peradeniya",
      "Gampola",
      "Nawalapitiya",
      "Kadugannawa",
      "Akurana",
      "Kundasale",
      "Digana",
      "Pilimathalawa",
    ],
  },
  {
    name: "Matale",
    province: "Central",
    cities: [
      "Matale",
      "Dambulla",
      "Sigiriya",
      "Galewela",
      "Ukuwela",
      "Rattota",
      "Naula",
    ],
  },
  {
    name: "Nuwara Eliya",
    province: "Central",
    cities: [
      "Nuwara Eliya",
      "Hatton",
      "Talawakele",
      "Ginigathena",
      "Ragala",
      "Kotagala",
      "Maskeliya",
    ],
  },
  {
    name: "Galle",
    province: "Southern",
    cities: [
      "Galle",
      "Hikkaduwa",
      "Ambalangoda",
      "Elpitiya",
      "Karapitiya",
      "Baddegama",
      "Udugama",
      "Unawatuna",
      "Bentota",
    ],
  },
  {
    name: "Matara",
    province: "Southern",
    cities: [
      "Matara",
      "Weligama",
      "Akuressa",
      "Dikwella",
      "Hakmana",
      "Deniyaya",
      "Kamburupitiya",
      "Mirissa",
    ],
  },
  {
    name: "Hambantota",
    province: "Southern",
    cities: [
      "Hambantota",
      "Tangalle",
      "Tissamaharama",
      "Ambalantota",
      "Beliatta",
      "Weeraketiya",
      "Sooriyawewa",
    ],
  },
  {
    name: "Jaffna",
    province: "Northern",
    cities: [
      "Jaffna",
      "Nallur",
      "Chavakachcheri",
      "Point Pedro",
      "Kopay",
      "Chunnakam",
      "Manipay",
      "Tellippalai",
    ],
  },
  {
    name: "Kilinochchi",
    province: "Northern",
    cities: ["Kilinochchi", "Pallai", "Paranthan", "Poonakary"],
  },
  {
    name: "Mannar",
    province: "Northern",
    cities: ["Mannar", "Nanattan", "Pesalai", "Murunkan"],
  },
  {
    name: "Vavuniya",
    province: "Northern",
    cities: ["Vavuniya", "Nedunkeni", "Cheddikulam", "Omanthai"],
  },
  {
    name: "Mullaitivu",
    province: "Northern",
    cities: ["Mullaitivu", "Puthukudiyiruppu", "Oddusuddan", "Mankulam"],
  },
  {
    name: "Batticaloa",
    province: "Eastern",
    cities: [
      "Batticaloa",
      "Kattankudy",
      "Eravur",
      "Valachchenai",
      "Kaluwanchikudy",
      "Chenkalady",
    ],
  },
  {
    name: "Ampara",
    province: "Eastern",
    cities: [
      "Ampara",
      "Kalmunai",
      "Sammanthurai",
      "Akkaraipattu",
      "Pottuvil",
      "Uhana",
      "Dehiattakandiya",
    ],
  },
  {
    name: "Trincomalee",
    province: "Eastern",
    cities: [
      "Trincomalee",
      "Kinniya",
      "Kantale",
      "Mutur",
      "Nilaveli",
      "Kuchchaveli",
    ],
  },
  {
    name: "Kurunegala",
    province: "North Western",
    cities: [
      "Kurunegala",
      "Kuliyapitiya",
      "Narammala",
      "Wariyapola",
      "Pannala",
      "Melsiripura",
      "Ibbagamuwa",
      "Mawathagama",
      "Nikaweratiya",
    ],
  },
  {
    name: "Puttalam",
    province: "North Western",
    cities: [
      "Puttalam",
      "Chilaw",
      "Wennappuwa",
      "Nattandiya",
      "Anamaduwa",
      "Marawila",
      "Dankotuwa",
    ],
  },
  {
    name: "Anuradhapura",
    province: "North Central",
    cities: [
      "Anuradhapura",
      "Kekirawa",
      "Medawachchiya",
      "Thambuttegama",
      "Eppawala",
      "Mihintale",
      "Galenbindunuwewa",
    ],
  },
  {
    name: "Polonnaruwa",
    province: "North Central",
    cities: [
      "Polonnaruwa",
      "Kaduruwela",
      "Hingurakgoda",
      "Medirigiriya",
      "Dimbulagala",
    ],
  },
  {
    name: "Badulla",
    province: "Uva",
    cities: [
      "Badulla",
      "Bandarawela",
      "Haputale",
      "Welimada",
      "Mahiyanganaya",
      "Passara",
      "Hali-Ela",
      "Ella",
    ],
  },
  {
    name: "Monaragala",
    province: "Uva",
    cities: [
      "Monaragala",
      "Wellawaya",
      "Bibile",
      "Kataragama",
      "Buttala",
      "Medagama",
    ],
  },
  {
    name: "Ratnapura",
    province: "Sabaragamuwa",
    cities: [
      "Ratnapura",
      "Embilipitiya",
      "Balangoda",
      "Eheliyagoda",
      "Pelmadulla",
      "Kuruwita",
      "Kalawana",
    ],
  },
  {
    name: "Kegalle",
    province: "Sabaragamuwa",
    cities: [
      "Kegalle",
      "Mawanella",
      "Warakapola",
      "Rambukkana",
      "Ruwanwella",
      "Deraniyagala",
      "Yatiyantota",
    ],
  },
];

// Shown as one-tap chips at the top of the location picker.
export const POPULAR_CITIES = [
  "Colombo",
  "Gampaha",
  "Kandy",
  "Negombo",
  "Kurunegala",
  "Galle",
  "Jaffna",
  "Batticaloa",
];

export type LocationValue = {
  district: string;
  city: string;
};

export const flatCities: {
  city: string;
  district: string;
  province: string;
}[] = SRI_LANKA_DISTRICTS.flatMap((d) =>
  d.cities.map((city) => ({
    city,
    district: d.name,
    province: d.province,
  })),
);
