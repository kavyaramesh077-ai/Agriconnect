export type LanguageCode =
  | 'en'
  | 'hi'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa'
  | 'or';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  speechCode: string;
}

export interface MandiRecord {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number; // in ₹ per Quintal (100 kg)
  maxPrice: number;
  modalPrice: number;
  arrivalQuantity: number; // in tonnes or quintals
  unit: string; // e.g. "₹ / Quintal"
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  lastUpdated: string;
  status: 'LIVE' | 'CACHED REAL DATA' | 'UNAVAILABLE';
  // Rich agricultural trading details
  grade?: string; // e.g. "Fair Average Quality (FAQ)", "Super Grade A"
  moisturePercent?: number; // e.g. 10.5
  pricePerKg?: number; // e.g. 18.50
  minPricePerKg?: number; // e.g. 14.00
  maxPricePerKg?: number; // e.g. 22.00
  yesterdayModalPrice?: number; // e.g. 1780
  priceChangePercent?: number; // e.g. +3.9%
  distanceKm?: number; // e.g. 22 km
  tradingHours?: string; // e.g. "06:30 AM - 11:30 AM"
  auctionHallNo?: string; // e.g. "Shed B, Bay 4"
  marketSecretaryPhone?: string; // e.g. "+91 94432 10987"
  marketAddress?: string; // e.g. "APMC Market Yard, Rayakottai Main Road"
  estimatedRetailPricePerKg?: number; // e.g. 28 - 32
  enamTradingEnabled?: boolean;
}

export interface PriceTrendPoint {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  arrivalQuantity: number;
  market: string;
  commodity: string;
  modalPricePerKg?: number;
  minPricePerKg?: number;
  maxPricePerKg?: number;
}

export interface WeatherData {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  temperature: number;
  relativeHumidity: number;
  weatherCode: number;
  weatherCondition: string;
  windSpeed: number;
  precipitation: number;
  dailyForecast: {
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    condition: string;
  }[];
  farmingAdvisory: string;
  source: string;
  sourceUrl: string;
  retrievedAt: string;
  status: 'LIVE' | 'CACHED REAL DATA' | 'UNAVAILABLE';
}

export interface FarmerProfile {
  id: string;
  mobile: string;
  name: string;
  language: LanguageCode;
  state: string;
  district: string;
  village: string;
  fpoName?: string;
  primaryCrops: string[];
  registeredAt: string;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  crop: string;
  variety: string;
  quantityQuintals: number;
  askingPricePerQuintal: number;
  harvestDate: string;
  state: string;
  district: string;
  village: string;
  notes?: string;
  imageUrl?: string;
  status: 'AVAILABLE' | 'UNDER_OFFER' | 'SOLD';
  createdAt: string;
}

export interface Buyer {
  id: string;
  companyName: string;
  contactPerson: string;
  buyerType: 'Food Processor' | 'FPO Aggregator' | 'Retail Chain' | 'Wholesale Trader' | 'Exporters Co';
  state: string;
  district: string;
  verified: boolean;
  commoditiesWanted: {
    commodity: string;
    minQuantityQuintals: number;
    targetPricePerQuintal: number;
  }[];
  phone: string;
  email: string;
  paymentTerms: string;
}

export interface ProduceOffer {
  id: string;
  produceId?: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  crop: string;
  quantityQuintals: number;
  offeredPricePerQuintal: number;
  proposedDeliveryDate: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'REJECTED' | 'COMPLETED';
  counterPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transporter {
  id: string;
  agencyName: string;
  driverName: string;
  phone: string;
  vehicleType: 'Tata Ace (1 Ton)' | 'Pickup / 407 (3 Ton)' | '6-Wheeler (9 Ton)' | '10-Wheeler (16 Ton)';
  capacityQuintals: number;
  baseCharge: number; // ₹ base
  ratePerKmPerQuintal: number; // ₹ per km per quintal
  operatingStates: string[];
  rating: number;
  verified: boolean;
}

export interface PaymentRecord {
  id: string;
  transactionRef: string;
  farmerId: string;
  farmerName?: string;
  farmerMobile?: string;
  buyerName: string;
  crop: string;
  quantityQuintals: number;
  amount: number;
  paymentMode: 'e-NAM Settlement' | 'Direct Bank Transfer (NEFT/RTGS)' | 'UPI (Kisan Pay)';
  status: 'COMPLETED' | 'PROCESSING' | 'ESCROW_HELD';
  paymentDate: string;
  mandiSlipNo: string;
  bankAccount?: string;
  ifscCode?: string;
  upiId?: string;
  notes?: string;
  settledAt?: string;
}

export interface SystemStatus {
  dataGovInStatus: 'ONLINE' | 'RATE_LIMITED' | 'FALLBACK_CACHED' | 'OFFLINE';
  dataGovInLatencyMs: number;
  openMeteoStatus: 'ONLINE' | 'OFFLINE';
  openStreetMapStatus: 'ONLINE' | 'OFFLINE';
  bhashiniStatus: 'CONFIGURED' | 'READY_LOCAL_SPEECH' | 'OFFLINE';
  recordsInCache: number;
  lastCacheSync: string;
  registeredFarmersCount: number;
  activeProduceListingsCount: number;
  pendingOffersCount: number;
  devOtpMode: boolean;
}

export interface SubscriptionAlert {
  id: string;
  farmerId: string;
  farmerMobile: string;
  crop: string;
  market: string;
  state: string;
  district?: string;
  channel: 'SMS' | 'IN_APP' | 'BOTH';
  frequency: 'DAILY_MORNING' | 'REALTIME';
  deliveryTime: string;
  minTargetPricePerKg?: number;
  maxTargetPricePerKg?: number;
  active: boolean;
  createdAt: string;
  lastDeliveredAt?: string;
  latestRateSnapshot?: {
    date: string;
    modalPrice: number;
    pricePerKg: number;
    minPricePerKg: number;
    maxPricePerKg: number;
    arrivalQuantity: number;
    priceChangePercent: number;
    market: string;
    status: string;
    source: string;
  };
}

export interface AlertNotification {
  id: string;
  subscriptionId?: string;
  crop: string;
  market: string;
  channel: 'SMS' | 'IN_APP';
  title: string;
  message: string;
  smsPreview?: string;
  pricePerKg: number;
  modalPrice: number;
  changePercent?: number;
  timestamp: string;
  read: boolean;
}
