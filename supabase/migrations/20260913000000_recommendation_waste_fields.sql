-- Migration: Add dedicated raw material and waste stream tracking to recommendations
-- Target Project: iflyiggpbnkivkxzdoca

ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS target_material text DEFAULT '',
  ADD COLUMN IF NOT EXISTS target_waste_stream text DEFAULT '',
  ADD COLUMN IF NOT EXISTS waste_reduction_tonnes numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS annual_material_recovered_tonnes numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS action_steps jsonb DEFAULT '[]'::jsonb;

-- Add index on category and target_material for fast lookup
CREATE INDEX IF NOT EXISTS recommendations_category_idx ON public.recommendations(category);
CREATE INDEX IF NOT EXISTS recommendations_target_material_idx ON public.recommendations(target_material);
