-- ==========================================
-- AGROTWIN AI - POSTGRESQL & POSTGIS SCHEMA
-- ==========================================
-- Enabling spatial features for land division vectors, soil mapping, and remote sensing geometries.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_raster;

-- 1. Farm Plot Boundaries
CREATE TABLE farm_plots (
    id SERIAL PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    plot_name VARCHAR(100) DEFAULT '1-Acre Plot',
    total_area_acres DECIMAL(5,2) DEFAULT 1.00,
    boundary_geom GEOMETRY(Polygon, 4326), -- Spatial boundaries (WGS 84 GPS projection)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Micro-Zone Sub-Plots (10x10 Grid Division)
CREATE TABLE grid_cells (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farm_plots(id) ON DELETE CASCADE,
    cell_row INT NOT NULL CHECK (cell_row BETWEEN 0 AND 9),
    cell_col INT NOT NULL CHECK (cell_col BETWEEN 0 AND 9),
    soil_classification VARCHAR(50) DEFAULT 'Clay Loam',
    baseline_ph DECIMAL(3,2) DEFAULT 6.50,
    baseline_moisture DECIMAL(5,2) DEFAULT 55.00,
    cell_geom GEOMETRY(Polygon, 4326), -- Exact rectangular coordinate polygon bounding each 10mx10m zone
    vulnerability_index DECIMAL(3,2) DEFAULT 0.25
);

-- Spatial index on grid cells for fast spatial query lookups
CREATE INDEX idx_grid_cells_geom ON grid_cells USING GIST(cell_geom);

-- 3. Soil Sensor Hardware Telemetry Nodes
CREATE TABLE sensor_nodes (
    id SERIAL PRIMARY KEY,
    cell_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    hardware_status VARCHAR(20) DEFAULT 'ACTIVE',
    battery_level DECIMAL(5,2) DEFAULT 100.00,
    node_location GEOMETRY(Point, 4326), -- GPS coordinate point of physical soil stake
    last_calibrated TIMESTAMP
);

CREATE INDEX idx_sensor_nodes_geom ON sensor_nodes USING GIST(node_location);

-- 4. Real-time Telemetry Data Streams (Partitioned by time-series or standard log)
CREATE TABLE telemetry_streams (
    id BIGSERIAL,
    node_id INT REFERENCES sensor_nodes(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    soil_temperature DECIMAL(4,1),
    soil_moisture DECIMAL(5,2),
    nitrogen_n_ppm INT,
    phosphorus_p_ppm INT,
    potassium_k_ppm INT,
    soil_ph DECIMAL(3,2),
    humidity DECIMAL(5,2),
    PRIMARY KEY (id, timestamp)
);

-- 5. Satellite NDVI Remote Sensing Images metadata
CREATE TABLE sentinel_imagery (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farm_plots(id) ON DELETE CASCADE,
    acquisition_date DATE NOT NULL,
    cloud_cover_percent DECIMAL(4,2),
    ndvi_raster RASTER, -- PostGIS Raster storage of the NDVI visual matrix
    mean_ndvi_index DECIMAL(4,3),
    sentinel_product_id VARCHAR(100)
);

-- 6. Generative Weather Scenarios time series logs
CREATE TABLE climate_scenarios (
    id SERIAL PRIMARY KEY,
    scenario_name VARCHAR(100) NOT NULL,
    stress_category VARCHAR(50) DEFAULT 'Normal Season', -- Delayed Monsoon, Flood, Heatwave, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scenario_daily_weather (
    id BIGSERIAL PRIMARY KEY,
    scenario_id INT REFERENCES climate_scenarios(id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 120),
    temperature_celsius DECIMAL(4,1) NOT NULL,
    rainfall_mm DECIMAL(5,1) NOT NULL,
    pest_risk_percent DECIMAL(5,2) NOT NULL,
    soil_moisture_forecast DECIMAL(5,2)
);

-- 7. Policy strategy evaluation logs
CREATE TABLE strategy_simulations (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farm_plots(id) ON DELETE CASCADE,
    simulated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    crop_selected VARCHAR(50) NOT NULL,
    sowing_offset_days INT NOT NULL,
    irrigation_protocol VARCHAR(50) NOT NULL,
    fertilizer_schedule VARCHAR(50) NOT NULL,
    
    -- Evaluated predictions
    expected_yield_t_ac DECIMAL(5,2),
    worst_case_yield_t_ac DECIMAL(5,2),
    failure_probability_percent INT,
    water_consumed_liters INT,
    resilience_score INT
);

-- 8. Searchable Farmers Directory Registry
CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'en'
);

-- 9. SMTP Climate Risk Report Delivery logs
CREATE TABLE report_delivery_logs (
    id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES farmers(id) ON DELETE SET NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient_email VARCHAR(100) NOT NULL,
    pdf_file_path VARCHAR(255),
    delivery_status VARCHAR(20) DEFAULT 'SENT', -- SENT, DELIVERED, FAILED
    error_message TEXT
);
