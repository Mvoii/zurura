-- 1) add boarding and alighting columns to bookings table
Alter TABLE bookings
    ADD COLUMN boarding_stiop_id UUID NULL
    ADD COLUMN alighting_stop_id UUID NULL;
    ADD COLUMN boarding_stop_name VARCHAR(255) NULL
    ADD COLUMN alighting_stop_name VARCHAR(255) NULL;

-- 2) add foreign key constraints to the new columns
ALTER TABLE bookings
    ADD CONSTRAINT fk_booking_boarding
    FOREIGN KEY (boarding_stop_id)
    REFERENCES bus_stops (id)
    ON DELETE SET NULL;

ALTER TABLE bookings
    ADD CONSTRAINT fk_booking_alighting
    FOREIGN KEY (alighting_stop_id)
    REFERENCES bus_stops (id)
    ON DELETE SET NULL;
