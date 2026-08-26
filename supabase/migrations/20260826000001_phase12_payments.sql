-- Add booking reference for customer-facing tickets
ALTER TABLE bookings
ADD COLUMN booking_reference VARCHAR(20) UNIQUE;

-- Generate references for existing bookings if any
UPDATE bookings SET booking_reference = 'TKT-' || upper(substr(md5(random()::text), 1, 8)) WHERE booking_reference IS NULL;

-- Add provider payment id to track Stripe session IDs
ALTER TABLE payments
ADD COLUMN provider_payment_id TEXT UNIQUE;

-- Webhook events for idempotency
CREATE TABLE webhook_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
