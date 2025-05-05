-- SQL script to add new columns to the orders table
-- Run this script in your Supabase SQL Editor

-- Check if columns exist before adding them
DO $$
BEGIN
    -- Add receipt_image column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'receipt_image') THEN
        ALTER TABLE orders ADD COLUMN receipt_image BYTEA;
    END IF;

    -- Add payment_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pending';
    END IF;

    -- Add order_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'order_status') THEN
        ALTER TABLE orders ADD COLUMN order_status VARCHAR(50) DEFAULT 'Processing';
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
