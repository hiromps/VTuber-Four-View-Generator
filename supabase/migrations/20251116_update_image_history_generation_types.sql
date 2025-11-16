-- Drop the old CHECK constraint on generation_type
ALTER TABLE public.image_history
DROP CONSTRAINT IF EXISTS image_history_generation_type_check;

-- Add new CHECK constraint with all generation types
ALTER TABLE public.image_history
ADD CONSTRAINT image_history_generation_type_check
CHECK (generation_type IN (
    'concept',
    'character_sheet',
    'facial_expressions',
    'pose_generation',
    'live2d_parts'
));
