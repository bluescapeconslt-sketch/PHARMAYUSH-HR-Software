/*
  # Insert Sample Data for HR System

  ## Description
  Populates the database with initial sample data for testing and demonstration.

  ## Data Inserted
  1. **Roles** - Admin, Manager, Employee
  2. **Departments** - Engineering, HR, Sales, Marketing, Finance
  3. **Employees** - Sample employees including admin
  4. **Notices** - Company announcements
  5. **Policies** - Company policies
  6. **Settings** - System configuration

  ## Notes
  - Admin user: admin@company.com / admin123
  - All passwords are stored in plain text for demo purposes
  - In production, passwords should be properly hashed
*/

-- Insert Roles
INSERT INTO roles (name, description, permissions) VALUES
  ('Admin', 'Full system access', '["manage_users", "manage_roles", "manage_departments", "manage_policies", "view_reports", "manage_settings", "approve_leaves", "manage_onboarding"]'::jsonb),
  ('Manager', 'Department management access', '["view_users", "manage_departments", "view_reports", "approve_leaves"]'::jsonb),
  ('Employee', 'Basic employee access', '["view_profile", "request_leave", "view_policies"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert Departments
INSERT INTO departments (name, description) VALUES
  ('Engineering', 'Software development and technical operations'),
  ('Human Resources', 'Employee management and recruitment'),
  ('Sales', 'Customer acquisition and revenue generation'),
  ('Marketing', 'Brand management and marketing campaigns'),
  ('Finance', 'Financial planning and accounting')
ON CONFLICT DO NOTHING;

-- Get role and department IDs for employee insertion
DO $$
DECLARE
  admin_role_id uuid;
  manager_role_id uuid;
  employee_role_id uuid;
  eng_dept_id uuid;
  hr_dept_id uuid;
  sales_dept_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM roles WHERE name = 'Admin' LIMIT 1;
  SELECT id INTO manager_role_id FROM roles WHERE name = 'Manager' LIMIT 1;
  SELECT id INTO employee_role_id FROM roles WHERE name = 'Employee' LIMIT 1;
  
  -- Get department IDs
  SELECT id INTO eng_dept_id FROM departments WHERE name = 'Engineering' LIMIT 1;
  SELECT id INTO hr_dept_id FROM departments WHERE name = 'Human Resources' LIMIT 1;
  SELECT id INTO sales_dept_id FROM departments WHERE name = 'Sales' LIMIT 1;

  -- Insert Employees
  INSERT INTO employees (
    email, password, first_name, last_name, 
    phone, date_of_birth, job_title, 
    department_id, role_id, hire_date, employment_status, salary
  ) VALUES
    (
      'admin@company.com', 'admin123', 'Admin', 'User',
      '+1-555-0100', '1985-01-15', 'System Administrator',
      hr_dept_id, admin_role_id, '2020-01-01', 'active', 120000
    ),
    (
      'john.doe@company.com', 'password123', 'John', 'Doe',
      '+1-555-0101', '1990-05-20', 'Senior Software Engineer',
      eng_dept_id, employee_role_id, '2021-03-15', 'active', 95000
    ),
    (
      'jane.smith@company.com', 'password123', 'Jane', 'Smith',
      '+1-555-0102', '1988-08-10', 'HR Manager',
      hr_dept_id, manager_role_id, '2020-06-01', 'active', 85000
    ),
    (
      'mike.johnson@company.com', 'password123', 'Mike', 'Johnson',
      '+1-555-0103', '1992-12-05', 'Sales Representative',
      sales_dept_id, employee_role_id, '2022-01-10', 'active', 65000
    ),
    (
      'sarah.williams@company.com', 'password123', 'Sarah', 'Williams',
      '+1-555-0104', '1995-03-25', 'Software Developer',
      eng_dept_id, employee_role_id, '2023-02-01', 'active', 75000
    )
  ON CONFLICT (email) DO NOTHING;
END $$;

-- Insert Notices
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM employees WHERE email = 'admin@company.com' LIMIT 1;
  
  INSERT INTO notices (title, content, author_id, author_name, notice_date, color) VALUES
    (
      'Welcome to the HR System',
      'We are excited to launch our new HR management system. Please explore all the features and provide feedback.',
      admin_id, 'Admin User', CURRENT_DATE, 'blue'
    ),
    (
      'Holiday Schedule',
      'Please note the upcoming holiday schedule. The office will be closed on the following dates...',
      admin_id, 'Admin User', CURRENT_DATE, 'green'
    ),
    (
      'Policy Update',
      'Our remote work policy has been updated. Please review the new guidelines in the Policies section.',
      admin_id, 'Admin User', CURRENT_DATE, 'yellow'
    )
  ON CONFLICT DO NOTHING;
END $$;

-- Insert Policies
INSERT INTO policies (title, category, content) VALUES
  (
    'Remote Work Policy',
    'Work Arrangements',
    'Employees are eligible for remote work based on role requirements and manager approval. Remote work days must be scheduled in advance and approved by your direct supervisor.'
  ),
  (
    'Leave Policy',
    'Time Off',
    'Full-time employees are entitled to: 20 days vacation per year, 10 days sick leave per year, and 5 days personal leave per year. Leave requests must be submitted at least 2 weeks in advance.'
  ),
  (
    'Code of Conduct',
    'Ethics',
    'All employees are expected to maintain professional conduct, respect colleagues, and adhere to company values. Any violations should be reported to HR immediately.'
  ),
  (
    'Data Security',
    'IT Security',
    'Employees must follow all data security protocols including: using strong passwords, enabling 2FA, not sharing credentials, and reporting security incidents immediately.'
  )
ON CONFLICT DO NOTHING;

-- Insert Settings
INSERT INTO settings (key, value) VALUES
  ('company_name', '"Pharmayush HR"'::jsonb),
  ('leave_approval_required', 'true'::jsonb),
  ('onboarding_enabled', 'true'::jsonb),
  ('performance_review_frequency', '"quarterly"'::jsonb)
ON CONFLICT (key) DO NOTHING;