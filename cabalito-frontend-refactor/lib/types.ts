export type Status = "ACTIVE" | "INACTIVE" | string;
export type MarketStatus = "GREEN" | "YELLOW" | "RED" | string;
export type Severity = "LOW" | "MEDIUM" | "HIGH" | string;
export type ReportStatus = "PENDING" | "VALIDATED" | "REJECTED" | string;

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

// Catálogo general de productos (sin precios)
export interface ProductOut {
  id: number;
  name: string;
  unit: string;
  category: string | null;
  status: Status;
}

export interface ProductPage {
  total: number;
  items: ProductOut[];
}

// Producto en un mercado específico
export interface MarketProductOut {
  id: number;
  region_id: number;
  product_id: number;
  current_price: string;
  market_status: MarketStatus;
  status: Status;
  last_updated: string | null;
  region: RegionOut | null;
  product: ProductOut | null;
}

export interface MarketProductPage {
  total: number;
  items: MarketProductOut[];
}

// Datos del radar (combinación market_product + product + region)
export interface RadarProduct {
  market_product_id: number;
  product_id: number;
  product_name: string;
  unit: string;
  region_id: number;
  region_name: string | null;
  latitude: number | null;
  longitude: number | null;
  current_price: string;
  market_status: MarketStatus;
  status: Status;
  last_updated: string | null;
}

export interface PriceHistoryOut {
  id: number;
  market_product_id: number;
  price: string;
  recorded_date: string;
  event_id: number | null;
  event_description: string | null;
  status: string;
}

export interface CitizenReportPayload {
  event_id?: number | null;
  region_id?: number | null;
  market_product_id?: number | null;
  reported_price?: number | null;
  reported_unit?: string | null;
  market_place_reference?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CitizenReportResponse {
  message: string;
  status: ReportStatus;
  report_id: number;
  event_status?: string | null;
  report_count?: number | null;
}

export interface ChatResponse {
  reply: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}
