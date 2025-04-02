-- Add booking_id column to payments table
ALTER TABLE payments
ADD COLUMN booking_id UUID;

-- Add foreign key constraint
ALTER TABLE payments
ADD CONSTRAINT fk_payments_booking
FOREIGN KEY (booking_id) 
REFERENCES bookings(id)
ON DELETE SET NULL;

-- Add index for booking_id
CREATE INDEX idx_payments_booking_id ON payments(booking_id); 