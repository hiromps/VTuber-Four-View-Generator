-- Delete specific history records from 2025/11/16
-- These were created by mistake and need to be removed

-- Delete records created at specific times on 2025/11/16
-- Times are in JST (Japan Standard Time, UTC+9)
DELETE FROM image_history
WHERE
  -- 2025/11/16 18:36 JST
  (created_at >= '2025-11-16 09:35:00+00' AND created_at < '2025-11-16 09:37:00+00')
  OR
  -- 2025/11/16 17:20 JST
  (created_at >= '2025-11-16 08:19:00+00' AND created_at < '2025-11-16 08:21:00+00')
  OR
  -- 2025/11/16 17:07 JST
  (created_at >= '2025-11-16 08:06:00+00' AND created_at < '2025-11-16 08:08:00+00')
  OR
  -- 2025/11/16 16:42 JST
  (created_at >= '2025-11-16 07:41:00+00' AND created_at < '2025-11-16 07:43:00+00')
  OR
  -- 2025/11/16 21:47 JST
  (created_at >= '2025-11-16 12:46:00+00' AND created_at < '2025-11-16 12:48:00+00');

-- Log the deletion
DO $$
BEGIN
  RAISE NOTICE 'Deleted history records from 2025/11/16 at times: 18:36, 17:20, 17:07, 16:42, 21:47 JST';
END $$;
