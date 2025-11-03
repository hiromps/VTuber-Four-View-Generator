-- Add 'generation_expressions' to transaction_type enum
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'generation_expressions';
