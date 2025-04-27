-- Migration to add origin and destination columns to bus_routes table
-- Date: 2025-03-31

-- Add the new columns
ALTER TABLE bus_routes ADD COLUMN IF NOT EXISTS origin VARCHAR(255);
ALTER TABLE bus_routes ADD COLUMN IF NOT EXISTS destination VARCHAR(255);

-- Update existing routes with default values if needed
-- This ensures no existing records have NULL values
UPDATE bus_routes 
SET origin = 'Unknown Origin', 
    destination = 'Unknown Destination' 
WHERE origin IS NULL OR destination IS NULL;

-- Create a function to populate origin/destination based on first/last stops
CREATE OR REPLACE FUNCTION populate_route_origin_destination() 
RETURNS void AS $$
DECLARE
  r RECORD;
  first_stop TEXT;
  last_stop TEXT;
BEGIN
  FOR r IN SELECT id FROM bus_routes WHERE origin = 'Unknown Origin' OR destination = 'Unknown Destination'
  LOOP
    -- Get the first stop (lowest stop_order)
    SELECT bs.name INTO first_stop
    FROM route_bus_stops rbs
    JOIN bus_stops bs ON rbs.bus_stop_id = bs.id
    WHERE rbs.route_id = r.id
    ORDER BY rbs.stop_order ASC
    LIMIT 1;
    
    -- Get the last stop (highest stop_order)
    SELECT bs.name INTO last_stop
    FROM route_bus_stops rbs
    JOIN bus_stops bs ON rbs.bus_stop_id = bs.id
    WHERE rbs.route_id = r.id
    ORDER BY rbs.stop_order DESC
    LIMIT 1;
    
    -- Update the route with actual values
    IF first_stop IS NOT NULL AND last_stop IS NOT NULL THEN
      UPDATE bus_routes
      SET origin = first_stop,
          destination = last_stop
      WHERE id = r.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to populate the values
SELECT populate_route_origin_destination();

-- Drop the function as it's no longer needed
DROP FUNCTION populate_route_origin_destination();

-- Add an index to improve performance of searches on these columns
CREATE INDEX IF NOT EXISTS idx_bus_routes_origin_destination ON bus_routes(origin, destination);

COMMENT ON COLUMN bus_routes.origin IS 'Starting point of the route';
COMMENT ON COLUMN bus_routes.destination IS 'End point of the route';


