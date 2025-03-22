-- DB setup for zurua bus transport management system

-- extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- enum types for status fields
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('mpesa', 'airtel_money', 'cash', 'bus_pass');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE pass_type AS ENUM ('prepaid', 'subscription');
CREATE TYPE pass_status AS ENUM ('active', 'expired', 'suspended');
CREATE TYPE notififcation_type AS ENUM ('bus_arrival', 'delay', 'route_deviation', 'pass_expiration', 'payment', 'schedule_update');


-- schools table
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(225) NOT NULL UNIQUE,
    location VARCHAR(225) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    profile_photo_url VARCHAR(255),
    ride_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    school_name VARCHAR(255) REFERENCES schools(name)
);

-- bus operators
CREATE TABLE IF NOT EXISTS bus_operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    contact_info TEXT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, user_id)
);

-- buses
CREATE TABLE IF NOT EXISTS buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES bus_operators(id),
    registration_plate VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    bus_photo_url VARCHAR(255),
    current_occupancy INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID REFERENCES buses(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    driver_photo_url VARCHAR(255),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- bus stops
CREATE TABLE IF NOT EXISTS bus_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    landmark_description TEXT,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    -- geoloaction GEOGRAPHY(POINT)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TODO: set geolocation point for spatial queries, updating bus location and seting bus stop geolocation

-- buss routes
CREATE TABLE IF NOT EXISTS bus_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration INTERVAL,
    base_fare DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- route yo bus stop mapping with stop order
CREATE TABLE IF NOT EXISTS route_bus_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
    bus_stop_id UUID NOT NULL REFERENCES bus_stops(id) ON DELETE CASCADE,
    stop_order INT NOT NULL,
    estimated_arrival_time INTERVAL, -- time from route start
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(route_id, bus_stop_id),
    UNIQUE(route_id, stop_order)
);

-- schedules
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY kEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES bus_routes(id),
    bus_id UUID NOT NULL REFERENCES buses(id),
    stop_id UUID NOT NULL REFERENCES bus_stops(id),
    day_of_week SMALLINT, -- 0=sunday ... 6=saturday, NULL for daily
    schedule_departure TIMESTAMPTZ NOT NULL,
    schedule_arrival TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- rt bus location
CREATE TABLE IF NOT EXISTS bus_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(id),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    geoloaction GEOGRAPHY(Point),
    speed FLOAT,
    direction FLOAT,
    occupancy INT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TODO: set geoloaction point for bus location spatial queries
CREATE OR REPLACE FUNCTION update_bus_location_geolocation()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geoloaction = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETRUN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_bus_location_geolocation
BEFORE INSERT OR UPDATE ON bus_locations
FOR EACH ROW EXECUTE FUNCTION update_bus_location_geolocation();


-- TODO: route delays

-- bus passes
CREATE TABLE IF NOT EXISTS bus_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    pass_type pass_type NOT NULL,
    balance FLOAT DEFAULT 0,
    fee FLOAT NOT NULL,
    status pass_status NOT NULL DEFAULT 'active',
    expiration_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    bus_pass_id UUID NOT NULL REFERENCES bus_passes(id),
    subscription_type VARCHAR(20) NOT NULL, -- 'monthly', 'per sem'
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    bus_pass_id UUID NOT NULL REFERENCES bus_passes(id),
    amount FLOAT NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(255) NOT NULL,
    payment_gateway_response JSONB,
    expires_at TIMESTAMPTZ,
    currency VARCHAR(3) NOT NULL DEFAULT 'KES',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    bus_id UUID NOT NULL REFERENCES buses(id),
    route_id UUID NOT NULL REFERENCES bus_routes(id),
    seats JSONB NOT NULL, -- {"seat_numbers": ["A1", "A2"], "count": 2}
    fare FLOAT NOT NULL,
    payment_method payment_method NOT NULL,
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL, -- Reservation expiry
    boarded_at TIMESTAMPTZ
);

-- Bus Pass Usage Tracking
CREATE TABLE IF NOT EXISTS pass_usage (
    pass_id UUID NOT NULL REFERENCES bus_passes(id),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    amount FLOAT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- notif

-- feedback and ratings

-- loyalty discounts
CREATE TABLE IF NOT EXISTS loyalty_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    discount_percentage FLOAT NOT NULL DEFAULT 10,
    rides_count INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- referrals

-- audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(55) NOT NULL,
    action VARCHAR(55) NOT NULL,
    user_id UUID REFERENCES users(id),
    old_data JSONB,
    new_data JSONB,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

-- Add token to blacklist
CREATE TABLE IF NOT EXISTS token_blacklist (
    jti UUID PRIMARY KEY,
    token TEXT NOT NULL,    -- full token for auditing
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- indexes for performance optimizations
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_name);
CREATE INDEX idx_buses_operator_id ON buses(operator_id);
CREATE INDEX idx_drivers_bus_id ON drivers(bus_id);
-- CREATE INDEX idx_bus_stops_geolocation ON bus_stops USING GIST(geoloaction)
CREATE INDEX idx_route_bus_stops_route_id ON route_bus_stops(route_id);
CREATE INDEX idx_route_bus_stops_stop_order ON route_bus_stops(route_id, stop_order);
CREATE INDEX idx_schedules_route_id ON schedules(route_id);
CREATE INDEX idx_schedules_bus_id ON schedules(bus_id);
CREATE INDEX idx_bus_locations_bus_id ON bus_locations(bus_id);
-- CREATE INDEX idx_bus_locations_timestamp ON bus_locations(timestamp);
CREATE INDEX idx_bus_locations_geolocation ON bus_locations USING GIST(geolocation);
CREATE INDEX idx_bus_passes_user_id ON bus_passes(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_bus ON bookings(bus_id);
CREATE INDEX idx_pass_usage ON pass_usage(pass_id);
--CREATE INDEX idx_bookings_status ON bookings(status);
--CREATE INDEX idx_notifications_user_id ON notifications(user_id);
--CREATE INDEX idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
--CREATE INDEX idx_feedback_ratings_user_id ON feedback_ratings(user_id);
--CREATE INDEX idx_feedback_ratings_bus_id ON feedback_ratings(bus_id);
CREATE INDEX idx_loyalty_dicounts_user_id ON loyalty_discounts(user_id);


-- common views of frequent quweies
CREATE VIEW active_buses_view AS
SELECT b.id, b.registration_plate, b.capacity, b.current_occupancy,
        o.name as operator_name, d.name as driver_name, d.driver_photo_url
FROM buses b
JOIN bus_operators o ON b.operator_id = o.id
LEFT JOIN drivers d ON d.bus_id = b.id
WHERE b.status = 'active';

-- bus passes
CREATE VIEW active_passes_view AS
SELECT bp.id, u.first_name, u.last_name, u.email, bp.pass_type,
       bp.balance, bp.expiration_date
FROM bus_passes bp
JOIN users u ON bp.user_id = u.id
WHERE bp.status = 'active'
AND bp.expiration_date > NOW();

-- func to calculate distance by postgis
CREATE OR REPLACE FUNCTION get_distance_to_stop(bus_id UUID, stop_id UUID)
RETURNS FLOAT AS $$
DECLARE
    distance FLOAT;
BEGIN
    SELECT ST_Distance(bl.geolocation, bs.geolocation)
    INTO distance
    FROM bus_locations bl
    CROSS JOIN bus_stops bs
    WHERE bl.bus_id = $1
    AND bs.id = $2
    ORDER BY bl.timestamp DESC
    LIMIT 1;
    
    RETURN distance;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a user can book a ride
CREATE OR REPLACE FUNCTION can_book_ride(user_id UUID, amount FLOAT)
RETURNS BOOLEAN AS $$
DECLARE
    pass_balance FLOAT;
    is_valid BOOLEAN;
BEGIN
    -- Check if user has an active pass with sufficient balance
    SELECT bp.balance >= $2, bp.balance
    INTO is_valid, pass_balance
    FROM bus_passes bp
    WHERE bp.user_id = $1
    AND bp.status = 'active'
    AND bp.expiration_date > NOW()
    ORDER BY bp.expiration_date DESC
    LIMIT 1;
    
    RETURN COALESCE(is_valid, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to apply loyalty discount after 50 rides
CREATE OR REPLACE FUNCTION apply_loyalty_discount()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment ride count
    UPDATE users SET ride_count = ride_count + 1 
    WHERE id = NEW.user_id;
    
    -- Check if user has reached 50 rides and doesn't have a discount yet
    INSERT INTO loyalty_discounts (user_id, discount_percentage, rides_count)
    SELECT id, 10.0, ride_count
    FROM users
    WHERE id = NEW.user_id
    AND ride_count >= 50
    AND NOT EXISTS (
        SELECT 1 FROM loyalty_discounts 
        WHERE user_id = NEW.user_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Permission setup for application roles
DO $$
BEGIN
    -- App role with limited permissions
    EXECUTE 'CREATE ROLE app_user';
    EXECUTE 'GRANT CONNECT ON DATABASE msafiri TO app_user';
    EXECUTE 'GRANT USAGE ON SCHEMA public TO app_user';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user';
    EXECUTE 'GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user';
    EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM app_user';
    
    -- Admin role with full permissions
    EXECUTE 'CREATE ROLE app_admin';
    EXECUTE 'GRANT CONNECT ON DATABASE msafiri TO app_admin';
    EXECUTE 'GRANT ALL PRIVILEGES ON SCHEMA public TO app_admin';
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin';
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin';
    
    -- Operator role with limited permissions
    EXECUTE 'CREATE ROLE bus_operator';
    EXECUTE 'GRANT CONNECT ON DATABASE msafiri TO bus_operator';
    EXECUTE 'GRANT USAGE ON SCHEMA public TO bus_operator';
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA public TO bus_operator';
    EXECUTE 'GRANT INSERT, UPDATE ON buses, drivers, bus_locations, route_delays TO bus_operator';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Roles already exist, skipping creation';
END;
$$;

-- Comment on database objects
COMMENT ON TABLE users IS 'Student users who use the bus service';
COMMENT ON TABLE bus_operators IS 'Companies that operate buses';
COMMENT ON TABLE buses IS 'Individual buses with their details';
COMMENT ON TABLE drivers IS 'Bus drivers with their details';
COMMENT ON TABLE bus_stops IS 'Physical bus stop locations with geospatial data';
COMMENT ON TABLE bus_routes IS 'Bus routes connecting multiple stops';
COMMENT ON TABLE route_bus_stops IS 'Mapping of bus stops to routes with ordering';
--COMMENT ON TABLE schedules IS 'Regular bus schedules for routes';
COMMENT ON TABLE bus_locations IS 'Real-time bus location tracking data';
--COMMENT ON TABLE route_delays IS 'Recorded delays for bus routes';
COMMENT ON TABLE bus_passes IS 'Digital bus passes for students';
COMMENT ON TABLE subscriptions IS 'Subscription details for pass holders';
COMMENT ON TABLE payments IS 'Payment records for bus passes and rides';
--COMMENT ON TABLE bookings IS 'Individual ride bookings';
COMMENT ON TABLE notifications IS 'User notifications for various events';
--COMMENT ON TABLE feedback_ratings IS 'User feedback and ratings';
COMMENT ON TABLE loyalty_discounts IS 'Discounts for loyal users based on ride count';
--COMMENT ON TABLE referrals IS 'User referral tracking';
COMMENT ON TABLE audit_logs IS 'System audit logs for security and compliance';

ALTER TABLE bus_operators
ADD COLUMN user_id UUID NOT NULL REFERENCES users(id);

-- Drop the old primary key (if exists)
ALTER TABLE bus_operators DROP CONSTRAINT IF EXISTS bus_operators_pkey;

-- Create composite primary key (id + user_id)
ALTER TABLE bus_operators
ADD PRIMARY KEY (id, user_id);

-- Add base_fare to bus_routes
ALTER TABLE bus_routes ADD COLUMN base_fare DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Add currency and metadata to payments
ALTER TABLE payments 
    ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'KES',
    ADD COLUMN metadata JSONB;

-- Add to db_schema.sql
CREATE TABLE IF NOT EXISTS bus_route_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(id),
    route_id UUID NOT NULL REFERENCES bus_routes(id),
    operator_id UUID NOT NULL REFERENCES bus_operators(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_bus_route_assignments_bus_id ON bus_route_assignments(bus_id);
CREATE INDEX idx_bus_route_assignments_route_id ON bus_route_assignments(route_id);
CREATE INDEX idx_bus_route_assignments_operator_id ON bus_route_assignments(operator_id);
CREATE INDEX idx_bus_route_assignments_status ON bus_route_assignments(status);
