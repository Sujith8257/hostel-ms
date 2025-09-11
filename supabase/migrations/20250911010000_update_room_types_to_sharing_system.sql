-- Migration to update room types from old to new sharing system
-- This updates room types from single/double/triple/dormitory to 2_sharing/4_sharing/5_sharing

BEGIN;

-- Update room types mapping
UPDATE rooms SET 
  room_type = CASE 
    WHEN room_type = 'single' THEN '2_sharing'
    WHEN room_type = 'double' THEN '2_sharing'
    WHEN room_type = 'triple' THEN '4_sharing'
    WHEN room_type = 'dormitory' THEN '5_sharing'
    ELSE room_type
  END;

-- Update capacity based on new room types
UPDATE rooms SET 
  capacity = CASE 
    WHEN room_type = '2_sharing' THEN 2
    WHEN room_type = '4_sharing' THEN 4
    WHEN room_type = '5_sharing' THEN 5
    ELSE capacity
  END;

-- Update waiting list preferences
UPDATE room_waiting_list SET 
  preferred_room_type = CASE 
    WHEN preferred_room_type = 'single' THEN '2_sharing'
    WHEN preferred_room_type = 'double' THEN '2_sharing'
    WHEN preferred_room_type = 'triple' THEN '4_sharing'
    WHEN preferred_room_type = 'dormitory' THEN '5_sharing'
    ELSE preferred_room_type
  END
WHERE preferred_room_type IS NOT NULL;

COMMIT;