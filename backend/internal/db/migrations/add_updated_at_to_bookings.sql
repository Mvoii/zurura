-- Add updated_at column to bookings table
ALTER TABLE bookings
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_modtime
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 