-- ============================================================
--                  CABALITO DATABASE SEED v2
--         Modelo escalable: products + market_products
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
    unit VARCHAR(50) DEFAULT 'kg',
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE IF NOT EXISTS market_products (
    id SERIAL PRIMARY KEY,
    region_id INTEGER NOT NULL REFERENCES regions(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    current_price DECIMAL(10,2) NOT NULL,
    market_status VARCHAR(10) DEFAULT 'GREEN' CHECK (market_status IN ('GREEN','YELLOW','RED')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    market_product_id INTEGER NOT NULL REFERENCES market_products(id),
    price DECIMAL(10,2) NOT NULL,
    recorded_date DATE NOT NULL,
    event_id INTEGER REFERENCES events(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE IF NOT EXISTS citizen_reports (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    region_id INTEGER REFERENCES regions(id),
    market_product_id INTEGER REFERENCES market_products(id),
    reported_price DECIMAL(10,2),
    reported_unit VARCHAR(50),
    market_place_reference VARCHAR(255),
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','VALIDATED','REJECTED')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
--                        REGIONES
-- ============================================================
INSERT INTO regions (name, weather_api_location, latitude, longitude, status) VALUES
('Mercado Rodríguez',  'La Paz, Bolivia', -16.4897, -68.1193, 'ACTIVE'),
('Feria Villa Fátima', 'La Paz, Bolivia', -16.4750, -68.1100, 'ACTIVE'),
('Mercado Lanza',      'La Paz, Bolivia', -16.4960, -68.1340, 'ACTIVE'),
('Zona Sur',           'La Paz, Bolivia', -16.5400, -68.0800, 'ACTIVE');

-- ============================================================
--                     TIPOS DE EVENTO
-- ============================================================
INSERT INTO event_types (name, status) VALUES
('Bloqueo de vías', 'ACTIVE'),
('Helada',          'ACTIVE'),
('Inundación',      'ACTIVE'),
('Paro de mercado', 'ACTIVE');

-- ============================================================
--                         EVENTOS
-- ============================================================
INSERT INTO events (region_id, event_type_id, description, severity, report_count, status) VALUES
(1, 1, 'Bloqueo en la avenida principal impide el ingreso de camiones con verduras al Mercado Rodríguez.', 'HIGH',   3, 'ACTIVE'),
(2, 2, 'Posible helada reportada por agricultores de la zona norte de Feria Villa Fátima.',                'MEDIUM', 1, 'PENDING');

-- ============================================================
--                   PRODUCTOS (catálogo general)
-- ============================================================
INSERT INTO products (name, unit, category, status) VALUES
('Papa Imilla',    'kg', 'Tubérculo',  'ACTIVE'),
('Tomate',         'kg', 'Verdura',    'ACTIVE'),
('Zanahoria',      'kg', 'Verdura',    'ACTIVE'),
('Cebolla',        'kg', 'Verdura',    'ACTIVE'),
('Arroz',          'kg', 'Cereal',     'ACTIVE'),
('Pollo entero',   'kg', 'Carne',      'ACTIVE'),
('Aceite vegetal', 'L',  'Aceite',     'ACTIVE');

-- ============================================================
--          MARKET PRODUCTS (producto por mercado)
-- ============================================================
-- Papa Imilla en 3 mercados
INSERT INTO market_products (region_id, product_id, current_price, market_status, status) VALUES
(1, 1, 3.50, 'RED',    'ACTIVE'),  -- Rodríguez (crisis activa)
(2, 1, 3.20, 'YELLOW', 'ACTIVE'),  -- Villa Fátima
(3, 1, 3.00, 'GREEN',  'ACTIVE');  -- Lanza

-- Tomate en 2 mercados
INSERT INTO market_products (region_id, product_id, current_price, market_status, status) VALUES
(1, 2, 6.00, 'YELLOW', 'ACTIVE'),  -- Rodríguez
(3, 2, 5.50, 'GREEN',  'ACTIVE');  -- Lanza

-- Zanahoria en 2 mercados
INSERT INTO market_products (region_id, product_id, current_price, market_status, status) VALUES
(1, 3, 2.50, 'GREEN',  'ACTIVE'),  -- Rodríguez
(4, 3, 2.80, 'GREEN',  'ACTIVE');  -- Zona Sur

-- Cebolla en 2 mercados
INSERT INTO market_products (region_id, product_id, current_price, market_status, status) VALUES
(3, 4, 4.00, 'GREEN',  'ACTIVE'),  -- Lanza
(4, 4, 4.20, 'GREEN',  'ACTIVE');  -- Zona Sur

-- Arroz en 2 mercados
INSERT INTO market_products (region_id, product_id, current_price, market_status, status) VALUES
(2, 5, 8.50, 'GREEN',  'ACTIVE'),  -- Villa Fátima
(4, 5, 8.80, 'YELLOW', 'ACTIVE');  -- Zona Sur

-- Pollo en 2 mercados
INSERT INTO market_products (region_id, product_id, current_price, market_status, status) VALUES
(1, 6, 22.00, 'YELLOW', 'ACTIVE'),  -- Rodríguez
(3, 6, 21.00, 'GREEN',  'ACTIVE');  -- Lanza

-- Aceite en 2 mercados
INSERT INTO market_products (region_id, product_id, current_price, market_status, status) VALUES
(2, 7, 12.00, 'GREEN', 'ACTIVE'),  -- Villa Fátima
(4, 7, 11.50, 'GREEN', 'ACTIVE');  -- Zona Sur

-- ============================================================
--               HISTORIAL DE PRECIOS (por market_product)
-- ============================================================

-- Papa Imilla - Mercado Rodríguez (mp_id=1)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(1, 2.50, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(1, 2.80, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(1, 3.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(1, 3.20, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(1, 3.50, CURRENT_DATE,                       1,    'ACTIVE');

-- Papa Imilla - Villa Fátima (mp_id=2)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(2, 2.40, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(2, 2.60, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(2, 3.00, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(2, 3.20, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Papa Imilla - Mercado Lanza (mp_id=3)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(3, 2.30, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(3, 2.50, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(3, 2.80, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(3, 3.00, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Tomate - Mercado Rodríguez (mp_id=4)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(4, 4.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(4, 4.50, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(4, 5.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(4, 5.50, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(4, 6.00, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Tomate - Mercado Lanza (mp_id=5)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(5, 4.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(5, 4.50, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(5, 5.00, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(5, 5.50, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Zanahoria - Mercado Rodríguez (mp_id=6)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(6, 2.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(6, 2.10, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(6, 2.30, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(6, 2.40, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(6, 2.50, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Zanahoria - Zona Sur (mp_id=7)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(7, 2.20, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(7, 2.40, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(7, 2.60, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(7, 2.80, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Cebolla - Mercado Lanza (mp_id=8)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(8, 3.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(8, 3.20, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(8, 3.50, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(8, 3.80, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(8, 4.00, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Cebolla - Zona Sur (mp_id=9)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(9, 3.20, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(9, 3.50, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(9, 3.80, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(9, 4.20, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Arroz - Villa Fátima (mp_id=10)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(10, 7.50, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(10, 7.80, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(10, 8.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(10, 8.20, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(10, 8.50, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Arroz - Zona Sur (mp_id=11)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(11, 7.80, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(11, 8.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(11, 8.50, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(11, 8.80, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Pollo - Mercado Rodríguez (mp_id=12)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(12, 18.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(12, 19.00, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(12, 20.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(12, 21.00, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(12, 22.00, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Pollo - Mercado Lanza (mp_id=13)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(13, 18.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(13, 19.50, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(13, 20.50, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(13, 21.00, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Aceite - Villa Fátima (mp_id=14)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(14, 10.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(14, 10.50, CURRENT_DATE - INTERVAL '21 days', NULL, 'ACTIVE'),
(14, 11.00, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(14, 11.50, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(14, 12.00, CURRENT_DATE,                       NULL, 'ACTIVE');

-- Aceite - Zona Sur (mp_id=15)
INSERT INTO price_history (market_product_id, price, recorded_date, event_id, status) VALUES
(15, 10.00, CURRENT_DATE - INTERVAL '28 days', NULL, 'ACTIVE'),
(15, 10.50, CURRENT_DATE - INTERVAL '14 days', NULL, 'ACTIVE'),
(15, 11.00, CURRENT_DATE - INTERVAL '7 days',  NULL, 'ACTIVE'),
(15, 11.50, CURRENT_DATE,                       NULL, 'ACTIVE');
