-- ============================================================
-- CABALITO DATABASE SEED — La Paz, Bolivia
-- ============================================================

CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    weather_api_location VARCHAR(150),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE IF NOT EXISTS event_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES regions(id),
    event_type_id INTEGER REFERENCES event_types(id),
    description TEXT,
    severity VARCHAR(10) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW','MEDIUM','HIGH')),
    report_count INTEGER DEFAULT 0,
    ai_explanation TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACTIVE','INACTIVE'))
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    origin_region_id INTEGER REFERENCES regions(id),
    current_price DECIMAL(10,2) NOT NULL,
    market_status VARCHAR(10) DEFAULT 'GREEN' CHECK (market_status IN ('GREEN','YELLOW','RED')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    price DECIMAL(10,2) NOT NULL,
    recorded_date DATE NOT NULL,
    event_id INTEGER REFERENCES events(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);

-- ============================================================
-- REGIONES — Mercados de La Paz
-- ============================================================
INSERT INTO regions (name, weather_api_location, latitude, longitude, status) VALUES
('Mercado Rodríguez',   'La Paz, Bolivia',  -16.4897, -68.1193, 'ACTIVE'),
('Feria Villa Fátima',  'La Paz, Bolivia',  -16.4750, -68.1100, 'ACTIVE'),
('Mercado Lanza',       'La Paz, Bolivia',  -16.4960, -68.1340, 'ACTIVE'),
('Zona Sur',            'La Paz, Bolivia',  -16.5400, -68.0800, 'ACTIVE');

-- ============================================================
-- TIPOS DE EVENTO
-- ============================================================
INSERT INTO event_types (name, status) VALUES
('Bloqueo de vías',  'ACTIVE'),
('Helada',           'ACTIVE'),
('Inundación',       'ACTIVE'),
('Paro de mercado',  'ACTIVE');

-- ============================================================
-- EVENTOS (semilla con 1 activo, 1 pendiente)
-- ============================================================
INSERT INTO events (region_id, event_type_id, description, severity, report_count, status) VALUES
(1, 1, 'Bloqueo en la avenida principal impide el ingreso de camiones con verduras al Mercado Rodríguez.', 'HIGH', 3, 'ACTIVE'),
(2, 2, 'Posible helada reportada por agricultores de la zona norte de Feria Villa Fátima.', 'MEDIUM', 1, 'PENDING');

-- ============================================================
-- PRODUCTOS BÁSICOS
-- ============================================================
INSERT INTO products (name, origin_region_id, current_price, market_status, status) VALUES
('Papa Imilla (kg)',   1, 3.50,  'RED',    'ACTIVE'),
('Tomate (kg)',        2, 6.00,  'YELLOW', 'ACTIVE'),
('Zanahoria (kg)',     1, 2.50,  'GREEN',  'ACTIVE'),
('Cebolla (kg)',       3, 4.00,  'GREEN',  'ACTIVE'),
('Arroz (kg)',         4, 8.50,  'GREEN',  'ACTIVE'),
('Pollo entero (kg)', 4, 22.00, 'YELLOW', 'ACTIVE'),
('Aceite vegetal (L)',3, 12.00, 'GREEN',  'ACTIVE');

-- ============================================================
-- HISTÓRICO DE PRECIOS (últimas 4 semanas)
-- ============================================================
-- Papa Imilla
INSERT INTO price_history (product_id, price, recorded_date, event_id, status) VALUES
(1, 2.50, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(1, 2.80, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(1, 3.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(1, 3.20, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(1, 3.50, CURRENT_DATE,                       1,    'ACTIVE');

-- Tomate
INSERT INTO price_history (product_id, price, recorded_date, event_id, status) VALUES
(2, 4.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(2, 4.50, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(2, 5.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(2, 5.50, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(2, 6.00, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Zanahoria
INSERT INTO price_history (product_id, price, recorded_date, event_id, status) VALUES
(3, 2.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(3, 2.10, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(3, 2.30, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(3, 2.40, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(3, 2.50, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Cebolla
INSERT INTO price_history (product_id, price, recorded_date, event_id, status) VALUES
(4, 3.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(4, 3.20, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(4, 3.50, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(4, 3.80, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(4, 4.00, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Arroz
INSERT INTO price_history (product_id, price, recorded_date, event_id, status) VALUES
(5, 7.50, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(5, 7.80, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(5, 8.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(5, 8.20, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(5, 8.50, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Pollo
INSERT INTO price_history (product_id, price, recorded_date, event_id, status) VALUES
(6, 18.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(6, 19.00, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(6, 20.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(6, 21.00, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(6, 22.00, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Aceite
INSERT INTO price_history (product_id, price, recorded_date, event_id, status) VALUES
(7, 10.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(7, 10.50, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(7, 11.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(7, 11.50, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(7, 12.00, CURRENT_DATE,                       NULL, 'ACTIVE');
