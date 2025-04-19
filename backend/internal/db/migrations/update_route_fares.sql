-- Set a default base fare for routes with zero fare
UPDATE bus_routes
SET base_fare = 100.00  -- Set a reasonable default fare (KES 100)
WHERE base_fare IS NULL OR base_fare = 0; 