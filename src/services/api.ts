import {
  MandiRecord,
  WeatherData,
  FarmerProfile,
  ProduceListing,
  Buyer,
  ProduceOffer,
  PaymentRecord,
  SystemStatus,
  SubscriptionAlert,
  AlertNotification,
} from '../types';

const API_BASE = 'https://agriconnect-galq.onrender.com/api';

export const api = {
  // 1. Mandi Prices
  async getMarketPrices(params: {
    state?: string;
    district?: string;
    commodity?: string;
    market?: string;
  }): Promise<{
    records: MandiRecord[];
    source: string;
    sourceUrl: string;
    retrievedAt: string;
    status: 'LIVE' | 'CACHED REAL DATA' | 'UNAVAILABLE';
  }> {
    const query = new URLSearchParams();
    if (params.state && params.state !== 'All') query.set('state', params.state);
    if (params.district && params.district !== 'All') query.set('district', params.district);
    if (params.commodity && params.commodity !== 'All') query.set('commodity', params.commodity);
    if (params.market && params.market !== 'All') query.set('market', params.market);

    const res = await fetch(`${API_BASE}/market-prices?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch market prices');
    return res.json();
  },

  // 2. Price Trends
  async getPriceTrends(commodity: string) {
    const res = await fetch(`${API_BASE}/price-trends?commodity=${encodeURIComponent(commodity)}`);
    if (!res.ok) throw new Error('Failed to fetch price trends');
    return res.json();
  },

  // 3. Live Weather
  async getWeather(district: string): Promise<WeatherData> {
    const res = await fetch(`${API_BASE}/weather?district=${encodeURIComponent(district)}`);
    if (!res.ok) throw new Error('Failed to fetch live weather');
    const data = await res.json();
    return data.weather;
  },

  // 4. Farmer Auth
  async sendOtp(mobile: string): Promise<{ success: boolean; message: string; devMode?: boolean; devOtp?: string }> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile }),
    });
    return res.json();
  },

  async verifyOtp(mobile: string, otp: string): Promise<{
    success: boolean;
    token?: string;
    isNewUser?: boolean;
    profile?: FarmerProfile | null;
    message?: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp }),
    });
    return res.json();
  },

  async registerFarmer(data: {
    token: string;
    name: string;
    language: string;
    state: string;
    district: string;
    village: string;
    fpoName?: string;
    primaryCrops: string[];
  }): Promise<{ success: boolean; profile?: FarmerProfile; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/register-farmer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getFarmerProfile(token?: string): Promise<{ success: boolean; profile: FarmerProfile }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/farmer/profile`, { headers });
    return res.json();
  },

  // 5. Admin
  async adminLogin(email: string, password: string) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getSystemStatus(): Promise<{ success: boolean; status: SystemStatus }> {
    const res = await fetch(`${API_BASE}/admin/system-status`);
    return res.json();
  },

  async updateAdminConfig(apiKey: string) {
    const res = await fetch(`${API_BASE}/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return res.json();
  },

  // 6. Buyers & Produce & Offers
  async getBuyers(commodity?: string): Promise<{ success: boolean; buyers: Buyer[] }> {
    const url = commodity && commodity !== 'All' ? `${API_BASE}/buyers?commodity=${encodeURIComponent(commodity)}` : `${API_BASE}/buyers`;
    const res = await fetch(url);
    return res.json();
  },

  async getProduce(): Promise<{ success: boolean; produce: ProduceListing[] }> {
    const res = await fetch(`${API_BASE}/produce`);
    return res.json();
  },

  async addProduce(data: Partial<ProduceListing>): Promise<{ success: boolean; produce: ProduceListing }> {
    const res = await fetch(`${API_BASE}/produce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getOffers(): Promise<{ success: boolean; offers: ProduceOffer[] }> {
    const res = await fetch(`${API_BASE}/offers`);
    return res.json();
  },

  async createOffer(data: Partial<ProduceOffer>): Promise<{ success: boolean; offer: ProduceOffer }> {
    const res = await fetch(`${API_BASE}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateOffer(id: string, updates: { status?: string; counterPrice?: number }): Promise<{ success: boolean; offer: ProduceOffer }> {
    const res = await fetch(`${API_BASE}/offers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // 7. Transport & Payments
  async getTransport(village: string, mandi: string, quantity: number) {
    const res = await fetch(`${API_BASE}/transport?village=${encodeURIComponent(village)}&mandi=${encodeURIComponent(mandi)}&quantity=${quantity}`);
    return res.json();
  },

  async getPayments(): Promise<{ success: boolean; payments: PaymentRecord[] }> {
    const res = await fetch(`${API_BASE}/payments`);
    return res.json();
  },

  async createPayment(data: {
    farmerId?: string;
    farmerName?: string;
    farmerMobile?: string;
    buyerName?: string;
    crop: string;
    quantityQuintals: number;
    amount: number;
    paymentMode: string;
    status?: string;
    bankAccount?: string;
    ifscCode?: string;
    upiId?: string;
    notes?: string;
    produceId?: string;
  }): Promise<{ success: boolean; message: string; payment: PaymentRecord }> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async releaseEscrow(id: string): Promise<{ success: boolean; message: string; payment: PaymentRecord }> {
    const res = await fetch(`${API_BASE}/payments/${id}/release`, {
      method: 'PATCH',
    });
    return res.json();
  },

  async updatePaymentStatus(id: string, status: string): Promise<{ success: boolean; payment: PaymentRecord }> {
    const res = await fetch(`${API_BASE}/payments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Admin CRUD
  async getAdminFarmers(): Promise<{ success: boolean; farmers: FarmerProfile[] }> {
    const res = await fetch(`${API_BASE}/admin/farmers`);
    return res.json();
  },

  async addAdminMandiRecord(record: Partial<MandiRecord>): Promise<{ success: boolean; record: MandiRecord }> {
    const res = await fetch(`${API_BASE}/admin/mandi-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return res.json();
  },

  async deleteAdminMandiRecord(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/mandi-record/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async addAdminBuyer(buyer: Partial<Buyer>): Promise<{ success: boolean; buyer: Buyer }> {
    const res = await fetch(`${API_BASE}/admin/buyers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buyer),
    });
    return res.json();
  },

  async toggleBuyerVerify(id: string): Promise<{ success: boolean; buyer: Buyer }> {
    const res = await fetch(`${API_BASE}/admin/buyers/${id}/verify`, {
      method: 'PATCH',
    });
    return res.json();
  },

  async deleteProduce(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/produce/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // 8. Voice Query NLP
  async sendVoiceQuery(query: string, language: string) {
    const res = await fetch(`${API_BASE}/voice-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language }),
    });
    return res.json();
  },

  // 9. Daily SMS & In-App Rate Alert Subscriptions
  async getSubscriptions(): Promise<{
    success: boolean;
    subscriptions: SubscriptionAlert[];
    unreadNotificationCount: number;
  }> {
    const res = await fetch(`${API_BASE}/alerts/subscriptions`);
    return res.json();
  },

  async subscribeAlert(data: {
    crop: string;
    market: string;
    state?: string;
    district?: string;
    channel?: 'SMS' | 'IN_APP' | 'BOTH';
    frequency?: 'DAILY_MORNING' | 'REALTIME';
    deliveryTime?: string;
    minTargetPricePerKg?: number;
    maxTargetPricePerKg?: number;
    mobile?: string;
    farmerId?: string;
  }): Promise<{
    success: boolean;
    message: string;
    subscription: SubscriptionAlert;
    initialNotification?: AlertNotification;
  }> {
    const res = await fetch(`${API_BASE}/alerts/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleSubscription(id: string): Promise<{ success: boolean; message: string; subscription: SubscriptionAlert }> {
    const res = await fetch(`${API_BASE}/alerts/subscriptions/${id}/toggle`, {
      method: 'PATCH',
    });
    return res.json();
  },

  async deleteSubscription(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/alerts/subscriptions/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async sendTestAlert(subscriptionId: string): Promise<{
    success: boolean;
    message: string;
    notification: AlertNotification;
  }> {
    const res = await fetch(`${API_BASE}/alerts/send-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId }),
    });
    return res.json();
  },

  async getNotifications(): Promise<{
    success: boolean;
    notifications: AlertNotification[];
    unreadCount: number;
  }> {
    const res = await fetch(`${API_BASE}/alerts/notifications`);
    return res.json();
  },

  async markNotificationRead(id: string): Promise<{ success: boolean; notification: AlertNotification }> {
    const res = await fetch(`${API_BASE}/alerts/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return res.json();
  },

  async clearNotifications(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/alerts/notifications/clear`, {
      method: 'DELETE',
    });
    return res.json();
  },
};

