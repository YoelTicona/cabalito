export type Status = "ACTIVE" | "INACTIVE" | string;
export type MarketStatus = "GREEN" | "YELLOW" | "RED" | string;
export type Severity = "LOW" | "MEDIUM" | "HIGH" | string;

export interface RegionOut {
  id: number;
  name: string;
  weather_api_location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: Status;
}

export interface EventTypeOut {
  id: number;
  name: string;
  status: Status;
}

export interface EventOut {
  id: number;
  region_id: number;
  event_type_id: number;
  description: string | null;
  severity: Severity;
  report_count: number;
  ai_explanation: string | null;
  status: string;
  region: RegionOut | null;
  event_type: EventTypeOut | null;
}

export interface EventPage {
  total: number;
  items: EventOut[];
}

export interface ProductOut {
  id: number;
  name: string;
  origin_region_id: number;
  current_price: string;
  market_status: MarketStatus;
  status: Status;
  origin_region: RegionOut | null;
}

export interface ProductPage {
  total: number;
  items: ProductOut[];
}

export interface RadarProduct {
  id: number;
  name: string;
  current_price: string;
  market_status: MarketStatus;
  latitude: number | null;
  longitude: number | null;
  region_name: string | null;
}

export interface PriceHistoryOut {
  id: number;
  price: string;
  recorded_date: string;
  event_id: number | null;
  status: string;
}

export interface ChatResponse {
  reply: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}
