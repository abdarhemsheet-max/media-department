-- ============================================
-- RESET: DANGER — This will erase ALL data
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
