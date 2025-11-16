-- Add new transaction types for pose generation and Live2D parts
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'generation_pose';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'generation_live2d_parts';

-- Add refund transaction types
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_sheet';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_expressions';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_pose';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_live2d_parts';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_concept';
