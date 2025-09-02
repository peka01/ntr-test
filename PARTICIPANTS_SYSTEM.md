## Setup Instructions

### 1. Database Setup (Recommended - Clean Start)
1. **Run `database/clean-setup.sql`** in Supabase SQL Editor
   - This will drop all existing tables and policies
   - Creates the new schema from scratch
   - Avoids conflicts with existing policies
   - **WARNING**: This will delete all existing data!

### 2. Database Setup (Alternative - Migration)
1. Run `database/schema-participants-only.sql` in Supabase SQL Editor
2. If you get policy conflicts, run `database/setup-admin-user.sql` first to drop existing policies
3. Create an admin user manually in Supabase Auth dashboard
4. Run `database/setup-admin-user.sql` with the correct auth user ID

### 3. Create Admin User
1. Go to Supabase Auth dashboard
2. Create a new user with email/password
3. Copy the user's UUID from the auth.users table
4. Run `database/setup-admin-user.sql` with the correct UUID
5. Update the name and email in the script to match your admin user
