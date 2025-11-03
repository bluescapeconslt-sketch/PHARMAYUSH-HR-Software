/*
  # Fix Security Issues

  This migration addresses performance and security issues identified in the database audit:

  1. **Missing Indexes on Foreign Keys**
     - Add indexes on all foreign key columns that lack covering indexes
     - Tables affected: buddies, employees, hierarchies, notices, performance_reviews

  2. **RLS Policy Optimization**
     - Optimize auth function calls in RLS policies by wrapping them in subqueries
     - This prevents re-evaluation for each row, improving query performance at scale
     - Tables affected: shifts, attendance, hierarchies, buddies

  3. **Multiple Permissive Policies**
     - These are intentional for role-based access (employees vs managers)
     - No changes needed as the design allows proper access control
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_buddies_buddy_id ON public.buddies(buddy_id);
CREATE INDEX IF NOT EXISTS idx_employees_shift_id ON public.employees(shift_id);
CREATE INDEX IF NOT EXISTS idx_hierarchies_manager_id ON public.hierarchies(manager_id);
CREATE INDEX IF NOT EXISTS idx_notices_author_id ON public.notices(author_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee_id ON public.performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer_id ON public.performance_reviews(reviewer_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - SHIFTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert shifts" ON public.shifts;
DROP POLICY IF EXISTS "Admins can update shifts" ON public.shifts;
DROP POLICY IF EXISTS "Admins can delete shifts" ON public.shifts;

CREATE POLICY "Admins can insert shifts"
  ON public.shifts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.roles r ON e.role_id = r.id
      WHERE e.id = (SELECT auth.uid())
      AND r.permissions @> '["manage:shifts"]'::jsonb
    )
  );

CREATE POLICY "Admins can update shifts"
  ON public.shifts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.roles r ON e.role_id = r.id
      WHERE e.id = (SELECT auth.uid())
      AND r.permissions @> '["manage:shifts"]'::jsonb
    )
  );

CREATE POLICY "Admins can delete shifts"
  ON public.shifts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.roles r ON e.role_id = r.id
      WHERE e.id = (SELECT auth.uid())
      AND r.permissions @> '["manage:shifts"]'::jsonb
    )
  );

-- ============================================================================
-- 3. OPTIMIZE RLS POLICIES - ATTENDANCE TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Employees can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Managers can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Employees can insert own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Employees can update own attendance" ON public.attendance;

CREATE POLICY "Employees can view own attendance"
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (employee_id = (SELECT auth.uid()));

CREATE POLICY "Managers can view all attendance"
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.roles r ON e.role_id = r.id
      WHERE e.id = (SELECT auth.uid())
      AND r.permissions @> '["view:attendance-report"]'::jsonb
    )
  );

CREATE POLICY "Employees can insert own attendance"
  ON public.attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = (SELECT auth.uid()));

CREATE POLICY "Employees can update own attendance"
  ON public.attendance
  FOR UPDATE
  TO authenticated
  USING (employee_id = (SELECT auth.uid()))
  WITH CHECK (employee_id = (SELECT auth.uid()));

-- ============================================================================
-- 4. OPTIMIZE RLS POLICIES - HIERARCHIES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Employees can view own hierarchy" ON public.hierarchies;
DROP POLICY IF EXISTS "Managers can view all hierarchies" ON public.hierarchies;
DROP POLICY IF EXISTS "Admins can manage hierarchies" ON public.hierarchies;

CREATE POLICY "Employees can view own hierarchy"
  ON public.hierarchies
  FOR SELECT
  TO authenticated
  USING (employee_id = (SELECT auth.uid()));

CREATE POLICY "Managers can view all hierarchies"
  ON public.hierarchies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.roles r ON e.role_id = r.id
      WHERE e.id = (SELECT auth.uid())
      AND r.permissions @> '["view:employees"]'::jsonb
    )
  );

CREATE POLICY "Admins can manage hierarchies"
  ON public.hierarchies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.roles r ON e.role_id = r.id
      WHERE e.id = (SELECT auth.uid())
      AND r.permissions @> '["manage:employees"]'::jsonb
    )
  );

-- ============================================================================
-- 5. OPTIMIZE RLS POLICIES - BUDDIES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Employees can view own buddy assignments" ON public.buddies;
DROP POLICY IF EXISTS "Managers can view all buddy assignments" ON public.buddies;
DROP POLICY IF EXISTS "Admins can manage buddy assignments" ON public.buddies;

CREATE POLICY "Employees can view own buddy assignments"
  ON public.buddies
  FOR SELECT
  TO authenticated
  USING (
    employee_id = (SELECT auth.uid())
    OR buddy_id = (SELECT auth.uid())
  );

CREATE POLICY "Managers can view all buddy assignments"
  ON public.buddies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.roles r ON e.role_id = r.id
      WHERE e.id = (SELECT auth.uid())
      AND r.permissions @> '["view:onboarding"]'::jsonb
    )
  );

CREATE POLICY "Admins can manage buddy assignments"
  ON public.buddies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.roles r ON e.role_id = r.id
      WHERE e.id = (SELECT auth.uid())
      AND r.permissions @> '["manage:onboarding"]'::jsonb
    )
  );
