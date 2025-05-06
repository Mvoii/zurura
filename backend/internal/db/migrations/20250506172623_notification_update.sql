-- create enum type
CREATE TYPE notification_type AS ENUM (
    'bus_arrival',
    'delay',
    'route_deviation',
    'pass_expiration',
    'payment'
    'schedule_update'
    'booking'
);

-- create notification table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- update notifications table
ALTER TABLE notifications
    ALTER COLUMN type TYPE notification_type USING type::notification_type,
    ALTER COLUMN delivered_at DROP NOT NULL,
    ALTER COLUMN read_at DROP NOT NULL;

-- add retry tracking
ALTER TABLE notifications
    ADD COLUMN delivery_attempts INT DEFAULT 0,
    ADD COLUMN last_attempt_at TIMESTAMPTZ;
