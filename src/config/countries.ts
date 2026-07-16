export interface CountryCity {
  id: string;
  name: string;
  tagline: string;
  stadium?: string;
  airport: string;
  description: string;
  highlights: string[];
  image: string;
}

export interface CountryVenue {
  name: string;
  capacity: number;
  city: string;
  description: string;
  matches: string;
}

export interface CountryConfig {
  id: string;
  code: string;
  name: string;
  nameLocal: string;
  domain: string;
  currency: { code: string; symbol: string; name: string };
  language: { code: string; name: string; greeting: string };
  flag: string;
  branding: {
    name: string;
    tagline: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
  };
  event: {
    name: string;
    year: number;
    dates: string;
    tagline: string;
    logo?: string;
  };
  cities: CountryCity[];
  venues: CountryVenue[];
  tourism: { title: string; items: { name: string; description: string; image: string }[] };
  contact: {
    emergency: string;
    touristPolice: string;
    embassy: string;
    supportEmail: string;
    supportPhone: string;
  };
  regulatory: {
    body: string;
    bodyShort: string;
    licenseRequired: boolean;
    licenseName: string;
    taxInfo: string;
  };
  payment: {
    providers: string[];
    mobileMoney: string[];
    currenciesAccepted: string[];
  };
}

const UGANDA: CountryConfig = {
  id: "uganda",
  code: "UG",
  name: "Uganda",
  nameLocal: "Uganda",
  domain: "kitufu.com",
  currency: { code: "UGX", symbol: "USh", name: "Uganda Shilling" },
  language: { code: "en", name: "English", greeting: "Oli otya" },
  flag: "🇺🇬",
  branding: {
    name: "Kitufu Residences",
    tagline: "The Correct Way to Stay",
    description: "Pop-up fan residences for AFCON 2027 in Uganda — converted homes, apartments, and buildings welcoming football fans.",
    primaryColor: "#E85D04",
    secondaryColor: "#2D6A4F",
  },
  event: {
    name: "AFCON 2027",
    year: 2027,
    dates: "June – July 2027",
    tagline: "The biggest football celebration in East Africa",
  },
  cities: [
    {
      id: "kampala",
      name: "Kampala",
      tagline: "The Heartbeat of Uganda",
      stadium: "Mandela National Stadium, Namboole",
      airport: "Entebbe International Airport (EBB)",
      description: "Uganda\'s vibrant capital, home to Mandela National Stadium. Bustling markets, nightlife on Kabalagala Road, and the shores of Lake Victoria.",
      highlights: ["Mandela National Stadium", "Kabalagala nightlife", "Owino Market", "Lake Victoria cruises", "Kasubi Tombs (UNESCO)", "Ndere Cultural Centre"],
      image: "/kampala-city.jpg",
    },
    {
      id: "hoima",
      name: "Hoima",
      tagline: "Oil City & Football Hub",
      stadium: "Hoima Stadium (under construction)",
      airport: "Hoima Airport (planned)",
      description: "Western Uganda\'s emerging oil city. Gateway to Murchison Falls National Park and home to a new 20,000-seat stadium.",
      highlights: ["Hoima Stadium", "Murchison Falls NP", "Bunyoro Kingdom Palace", "Lake Albert views", "Budongo Forest (chimpanzees)", "Kibiro Salt Gardens"],
      image: "/hoima-city.jpg",
    },
  ],
  venues: [
    { name: "Mandela National Stadium", capacity: 45000, city: "Kampala", description: "Uganda\'s largest stadium, undergoing major renovation for AFCON 2027.", matches: "Group stage, Round of 16, Quarter-final" },
    { name: "Hoima Stadium", capacity: 20000, city: "Hoima", description: "New purpose-built stadium in Uganda\'s oil city.", matches: "Group stage, Round of 16" },
  ],
  tourism: {
    title: "Discover Uganda",
    items: [
      { name: "Murchison Falls", description: "World\'s most powerful waterfall. Boat cruises to the falls\' base.", image: "/murchison-falls.jpg" },
      { name: "Bwindi Impenetrable Forest", description: "Home to half the world\'s mountain gorillas. Trek through misty jungles.", image: "/bwindi-gorillas.jpg" },
      { name: "Queen Elizabeth National Park", description: "Tree-climbing lions, Kazinga Channel boat safaris.", image: "/queen-elizabeth.jpg" },
      { name: "Source of the Nile", description: "Where the world\'s longest river begins. White-water rafting.", image: "/source-nile.jpg" },
    ],
  },
  contact: {
    emergency: "999",
    touristPolice: "+256 414 342 434",
    embassy: "+256 414 259 792",
    supportEmail: "hello@kitufu.com",
    supportPhone: "+256 772 123 456",
  },
  regulatory: {
    body: "Uganda Tourism Board",
    bodyShort: "UTB",
    licenseRequired: true,
    licenseName: "UTB Tourism License",
    taxInfo: "18% VAT on accommodation, 2% withholding tax",
  },
  payment: {
    providers: ["Flutterwave", "Mobile Money", "Bank Transfer"],
    mobileMoney: ["MTN Mobile Money", "Airtel Money"],
    currenciesAccepted: ["UGX", "USD", "EUR", "GBP"],
  },
};

const MOROCCO: CountryConfig = {
  id: "morocco",
  code: "MA",
  name: "Morocco",
  nameLocal: "المغرب",
  domain: "kitufu.ma",
  currency: { code: "MAD", symbol: "DH", name: "Moroccan Dirham" },
  language: { code: "ar", name: "Arabic", greeting: "السلام عليكم" },
  flag: "🇲🇦",
  branding: {
    name: "Kitufu Maroc",
    tagline: "L\'Hébergement Authentique",
    description: "Résidences temporaires pour la CAN 2025 au Maroc — maisons d\'hôtes et logements transformés pour les supporters.",
    primaryColor: "#C1272D",
    secondaryColor: "#006233",
  },
  event: {
    name: "AFCON 2025",
    year: 2025,
    dates: "December 2025 – January 2026",
    tagline: "Le football célèbre son héritage africain",
  },
  cities: [
    {
      id: "rabat",
      name: "Rabat",
      tagline: "Capital of Light",
      stadium: "Prince Moulay Abdellah Stadium",
      airport: "Rabat-Salé Airport (RBA)",
      description: "Morocco\'s elegant capital. UNESCO World Heritage medina, Kasbah of the Udayas, and modern stadium facilities.",
      highlights: ["Hassan Tower", "Kasbah of the Udayas", "Chellah Necropolis", "Royal Golf Dar Es Salam", "Medina of Rabat"],
      image: "/rabat-city.jpg",
    },
    {
      id: "casablanca",
      name: "Casablanca",
      tagline: "The White House",
      stadium: "Hassan II Stadium (new)",
      airport: "Mohammed V Airport (CMN)",
      description: "Morocco\'s economic powerhouse. The magnificent Hassan II Mosque, Art Deco architecture, and vibrant nightlife.",
      highlights: ["Hassan II Mosque", "Hassan II Stadium", "Corniche Ain Diab", "Old Medina", "Morocco Mall"],
      image: "/casablanca-city.jpg",
    },
    {
      id: "marrakech",
      name: "Marrakech",
      tagline: "The Red City",
      stadium: "Grand Stade de Marrakech",
      airport: "Marrakech Menara (RAK)",
      description: "The beating heart of Moroccan tourism. Famous souks, palaces, gardens, and the vibrant Jemaa el-Fnaa square.",
      highlights: ["Jemaa el-Fnaa", "Majorelle Garden", "Bahia Palace", "Koutoubia Mosque", "Saadian Tombs"],
      image: "/marrakech-city.jpg",
    },
    {
      id: "tangier",
      name: "Tangier",
      tagline: "Where Africa Meets Europe",
      stadium: "Ibn Batouta Stadium",
      airport: "Tangier Ibn Battouta (TNG)",
      description: "Strategic port city with a unique blend of African and European influences. Stunning medina and coastal views.",
      highlights: ["Medina of Tangier", "Cape Spartel", "Caves of Hercules", "Kasbah Museum", "Grand Socco"],
      image: "/tangier-city.jpg",
    },
  ],
  venues: [
    { name: "Hassan II Stadium", capacity: 93000, city: "Casablanca", description: "Brand new stadium under construction for AFCON 2025. Will be Africa\'s largest.", matches: "Opening match, Final" },
    { name: "Prince Moulay Abdellah Stadium", capacity: 53000, city: "Rabat", description: "Renovated for 2030 World Cup bid and AFCON 2025.", matches: "Group stage, Semi-final" },
    { name: "Grand Stade de Marrakech", capacity: 45000, city: "Marrakech", description: "Modern stadium in Morocco\'s tourist capital.", matches: "Group stage, Round of 16" },
    { name: "Ibn Batouta Stadium", capacity: 65000, city: "Tangier", description: "Large stadium in the gateway city to Africa.", matches: "Group stage, Quarter-final" },
  ],
  tourism: {
    title: "Discover Morocco",
    items: [
      { name: "Sahara Desert", description: "Sleep under the stars in Merzouga\'s golden dunes. Camel treks and Berber camps.", image: "/sahara-morocco.jpg" },
      { name: "Fes Medina", description: "The world\'s largest car-free urban area. Ancient tanneries and 9,000 alleyways.", image: "/fes-medina.jpg" },
      { name: "Chefchaouen", description: "The famous blue city in the Rif Mountains. Every surface painted in shades of blue.", image: "/chefchaouen.jpg" },
      { name: "Atlas Mountains", description: "Trek through Berber villages, valleys, and North Africa\'s highest peaks.", image: "/atlas-mountains.jpg" },
    ],
  },
  contact: {
    emergency: "19 (Police), 15 (Medical)",
    touristPolice: "+212 537 270 000",
    embassy: "+212 537 76 97 00",
    supportEmail: "support@kitufu.ma",
    supportPhone: "+212 522 123 456",
  },
  regulatory: {
    body: "Ministère du Tourisme",
    bodyShort: "MT",
    licenseRequired: true,
    licenseName: "Autorisation d\'exploitation",
    taxInfo: "10% TVA, 3.5% taxe de séjour",
  },
  payment: {
    providers: ["Stripe", "PayPal", "Cash Plus", "Bank Transfer"],
    mobileMoney: ["Inwi Money", "Orange Money"],
    currenciesAccepted: ["MAD", "EUR", "USD"],
  },
};

const IVORY_COAST: CountryConfig = {
  id: "ivory-coast",
  code: "CI",
  name: "Ivory Coast",
  nameLocal: "Côte d\'Ivoire",
  domain: "kitufu.ci",
  currency: { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
  language: { code: "fr", name: "French", greeting: "Bonjour" },
  flag: "🇨🇮",
  branding: {
    name: "Kitufu Côte d\'Ivoire",
    tagline: "Le Bon Logement",
    description: "Résidences temporaires pour la CAN en Côte d\'Ivoire — logements transformés pour accueillir les supporters.",
    primaryColor: "#FF8200",
    secondaryColor: "#009E60",
  },
  event: {
    name: "AFCON 2027",
    year: 2027,
    dates: "June – July 2027",
    tagline: "La célébration du football ouest-africain",
  },
  cities: [
    {
      id: "abidjan",
      name: "Abidjan",
      tagline: "The Pearl of Lagoons",
      stadium: "Stade Félix Houphouët-Boigny",
      airport: "Félix-Houphouët-Boigny Airport (ABJ)",
      description: "The economic capital of West Africa. Lagoons, skyscrapers, and the famous Plateau district.",
      highlights: ["Plateau district", "Treichville", "Banco National Park", "St. Paul\'s Cathedral", "Île Boulay"],
      image: "/abidjan-city.jpg",
    },
    {
      id: "yamoussoukro",
      name: "Yamoussoukro",
      tagline: "Home of the Basilica",
      stadium: "Stade de la Paix",
      airport: "Yamoussoukro Airport (ASK)",
      description: "The political capital, famous for the breathtaking Basilica of Our Lady of Peace — the world\'s largest church.",
      highlights: ["Basilica of Our Lady of Peace", "Presidential Palace", "Crocodile Lake", "Stade de la Paix"],
      image: "/yamoussoukro-city.jpg",
    },
  ],
  venues: [
    { name: "Stade Félix Houphouët-Boigny", capacity: 33000, city: "Abidjan", description: "Historic stadium in the Treichville district, recently renovated.", matches: "Group stage, Quarter-final" },
    { name: "Stade de la Paix", capacity: 40000, city: "Yamoussoukro", description: "Modern stadium in the political capital.", matches: "Group stage, Round of 16" },
    { name: "Stade Alassane Ouattara", capacity: 60000, city: "Abidjan (Ebimpe)", description: "New Olympic complex in Ebimpe. Hosted AFCON 2023 final.", matches: "Semi-final, Final" },
  ],
  tourism: {
    title: "Discover Ivory Coast",
    items: [
      { name: "Basilica of Yamoussoukro", description: "World\'s largest church. Guinness World Record holder, larger than St. Peter\'s.", image: "/basilica-yakro.jpg" },
      { name: "Taï National Park", description: "UNESCO World Heritage primary rainforest. Home to pygmy hippos and chimpanzees.", image: "/tai-national-park.jpg" },
      { name: "Grand-Bassam", description: "Colonial-era capital and UNESCO site. Beaches, French colonial architecture.", image: "/grand-bassam.jpg" },
      { name: "Comoé National Park", description: "West Africa\'s largest protected area. Savannah, forests, and incredible biodiversity.", image: "/comoe-national-park.jpg" },
    ],
  },
  contact: {
    emergency: "111",
    touristPolice: "+225 20 22 40 40",
    embassy: "+225 20 30 49 00",
    supportEmail: "support@kitufu.ci",
    supportPhone: "+225 07 12 34 56",
  },
  regulatory: {
    body: "Ministère du Tourisme",
    bodyShort: "MOT",
    licenseRequired: true,
    licenseName: "Autorisation d\'exploitation hôtelière",
    taxInfo: "18% TVA, taxe de séjour variable",
  },
  payment: {
    providers: ["Stripe", "Orange Money", "MTN Mobile Money", "Bank Transfer"],
    mobileMoney: ["Orange Money CI", "MTN MoMo", "Wave", "Flooz"],
    currenciesAccepted: ["XOF", "EUR", "USD"],
  },
};

export const COUNTRY_LIST: CountryConfig[] = [UGANDA, MOROCCO, IVORY_COAST];

export const DEFAULT_COUNTRY = "uganda";

export function getCountry(id: string): CountryConfig {
  const country = COUNTRY_LIST.find((c) => c.id === id);
  if (!country) throw new Error("Country not found: " + id);
  return country;
}

export function getCountryByDomain(domain: string): CountryConfig | undefined {
  return COUNTRY_LIST.find((c) => c.domain === domain);
}
