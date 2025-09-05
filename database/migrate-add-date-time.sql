-- Migration script to add training_date and training_time columns to existing trainings table
-- Run this if you have an existing database without these columns

-- Add the new columns if they don't exist
ALTER TABLE public.trainings 
ADD COLUMN IF NOT EXISTS training_date DATE,
ADD COLUMN IF NOT EXISTS training_time TIME;

-- Update existing sample data to have dates and times
UPDATE public.trainings 
SET training_date = '2024-09-15', training_time = '09:30:00'
WHERE id = '550e8400-e29b-41d4-a716-446655440003' AND name = 'React Fundamentals';

UPDATE public.trainings 
SET training_date = '2024-09-20', training_time = '14:00:00'
WHERE id = '550e8400-e29b-41d4-a716-446655440004' AND name = 'Advanced TailwindCSS';
