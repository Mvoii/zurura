-- First, drop the existing constraint
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_bus_pass_id_fkey;

-- Remove the NOT NULL constraint from bus_pass_id column
ALTER TABLE payments 
ALTER COLUMN bus_pass_id DROP NOT NULL;

-- Then recreate the foreign key constraint to allow NULL values
ALTER TABLE payments
ADD CONSTRAINT payments_bus_pass_id_fkey
FOREIGN KEY (bus_pass_id) 
REFERENCES bus_passes(id)
ON DELETE SET NULL;

-- Update existing records with all-zero UUIDs to NULL
UPDATE payments
SET bus_pass_id = NULL
WHERE bus_pass_id = '00000000-0000-0000-0000-000000000000'; 