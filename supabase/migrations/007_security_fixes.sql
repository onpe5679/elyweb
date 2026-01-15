-- Security fixes for Supabase Linter warnings

-- 1. Fix function_search_path_mutable
-- Set immutable search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 2. Fix rls_policy_always_true for contact_submissions
-- The current policy allows anyone to INSERT, which is intentional for contact form
-- But we should add rate limiting or additional checks
-- For now, we'll keep it but add a check for valid email format
DROP POLICY IF EXISTS "Public can submit contact" ON contact_submissions;

CREATE POLICY "Public can submit contact with validation"
ON contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(name) > 0
    AND length(message) > 0
);

-- 3. Leaked Password Protection - This needs to be enabled in Supabase Dashboard
-- Go to: Authentication > Providers > Email > Enable "Leaked password protection"
-- This cannot be done via SQL migration
