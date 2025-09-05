-- Fix existing trainings by adding date/time columns and updating sample data
-- Run this in your Supabase SQL Editor

-- Step 1: Add the new columns if they don't exist
ALTER TABLE public.trainings 
ADD COLUMN IF NOT EXISTS training_date DATE,
ADD COLUMN IF NOT EXISTS training_time TIME;

-- Step 2: Update existing trainings with sample dates/times
-- You can modify these dates/times as needed

-- Update "Stationspass" training
UPDATE public.trainings 
SET training_date = '2024-09-21', training_time = '09:30:00'
WHERE name = 'Stationspass' OR name ILIKE '%stationspass%';

-- Update "Onsdagsfys" training  
UPDATE public.trainings 
SET training_date = '2024-09-18', training_time = '18:00:00'
WHERE name = 'Onsdagsfys' OR name ILIKE '%onsdagsfys%';

-- Update any other existing trainings with generic dates
UPDATE public.trainings 
SET training_date = '2024-09-25', training_time = '10:00:00'
WHERE training_date IS NULL AND training_time IS NULL;

-- Step 3: Verify the changes
SELECT id, name, training_date, training_time 
FROM public.trainings 
ORDER BY created_at;
