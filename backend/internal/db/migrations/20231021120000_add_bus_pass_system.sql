BEGIN;

-- add new columns to bus_passes
ALTER TABLE bus_passes
    ADD COLUMN auto_reload BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN reload_threshold  DECIMAL(10,2) DEFAULT 100.00,
    ADD CONSTRAINT balance_non_negative CHECK (balance >= 0);


-- create pass transactions table
CREATE TABLE pass_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pass_id UUID NOT NULL REFERENCES bus_passes(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('topup', 'booking', 'refund')),
    reference_id UUID, -- links to payments.id or bookings.id
    created_at TIMESTAMPZ NOT NULL DEFAULT NOW()
);

-- add index for common queries
CREATE INDEX idx_pass_transactions_pass_id ON pass_transactions(pass_id);
CREATE INDEX idx_pass_transactions_created_at ON pass_transactions(created_at);

-- add pass rship to bookings
ALTER TABLE bookings
    ADD COLUMN pass_id UUID REFERENCES bus_passes(id);

COMMIT;
