# Supabase Integration Setup Guide

This guide will help you set up the Supabase database for the Training Management System.

## 🚀 Quick Setup

### 1. Database Schema Setup

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Navigate to the **SQL Editor**
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run** to execute the SQL script

### 2. Verify Tables Created

After running the schema, you should see these tables in your **Table Editor**:

- `users` - Stores user information and voucher balances
- `trainings` - Stores training course information
- `subscriptions` - Tracks user subscriptions to trainings
- `attendance` - Tracks user attendance at trainings

### 3. Sample Data

The schema includes sample data:
- **Users**: Alice Johnson (5 vouchers), Bob Williams (3 vouchers)
- **Trainings**: React Fundamentals, Advanced TailwindCSS
- **Subscriptions**: Both users subscribed to React Fundamentals

## 🔧 Configuration

### Environment Variables

The app uses environment variables for Supabase credentials:

```typescript
// services/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

Make sure to set these in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Row Level Security (RLS)

For production, consider enabling RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Example policy for public read access
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON trainings FOR SELECT USING (true);
```

## 📊 Database Schema Details

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    voucher_balance INTEGER DEFAULT 0 CHECK (voucher_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Trainings Table
```sql
CREATE TABLE trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, training_id)
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, training_id)
);
```

## 🔄 Data Flow

### 1. User Management
- **Create User**: Inserts into `users` table with 0 voucher balance
- **Update Vouchers**: Updates `voucher_balance` field

### 2. Training Management
- **Create Training**: Inserts into `trainings` table
- **Update Training**: Updates name and description

### 3. Subscriptions
- **Subscribe**: Inserts into `subscriptions` table
- **Unsubscribe**: Deletes from `subscriptions` table

### 4. Attendance
- **Mark Attendance**: 
  1. Deducts 1 voucher from user
  2. Inserts into `attendance` table
- **Unmark Attendance**:
  1. Refunds 1 voucher to user
  2. Deletes from `attendance` table

## 🛠️ Testing the Integration

### 1. Start the App
```bash
docker-compose -f docker-compose.quick.yml up
```

### 2. Test Data Operations
1. Go to **Admin** view
2. Create a new user
3. Create a new training
4. Go to **Public** view
5. Subscribe a user to a training
6. Go to **Attendance** view
7. Mark attendance (should deduct voucher)

### 3. Verify Data Persistence
1. Refresh the page
2. Check that all data is still there
3. Verify voucher balances are correct

## 🚨 Troubleshooting

### Common Issues

1. **"relation does not exist" error**
   - Make sure you ran the schema.sql script
   - Check that tables were created in the Table Editor

2. **"permission denied" error**
   - Check that RLS policies allow the operations
   - Verify the API key has correct permissions

3. **Data not persisting**
   - Check browser console for errors
   - Verify Supabase connection in Network tab

### Debug Mode

Enable debug logging by adding this to your browser console:
```javascript
localStorage.setItem('supabase.debug', 'true');
```

## 🔒 Security Considerations

1. **API Key**: The current key is for anonymous access. For production:
   - Use service role key for admin operations
   - Implement proper authentication
   - Enable RLS policies

2. **Data Validation**: The app includes basic validation:
   - Voucher balance cannot go negative
   - Unique constraints on subscriptions/attendance
   - Email uniqueness for users

3. **Rate Limiting**: Consider implementing rate limiting for:
   - User creation
   - Voucher updates
   - Attendance marking

## 📈 Performance Optimization

The schema includes indexes for common queries:
- `idx_users_email` - Fast user lookup by email
- `idx_subscriptions_user_id` - Fast subscription queries
- `idx_subscriptions_training_id` - Fast training subscription queries
- `idx_attendance_user_id` - Fast attendance queries
- `idx_attendance_training_id` - Fast training attendance queries

## 🎯 Next Steps

1. **Authentication**: Add user login/signup
2. **Authorization**: Implement role-based access control
3. **Real-time**: Enable real-time subscriptions for live updates
4. **Backup**: Set up automated database backups
5. **Monitoring**: Add database performance monitoring

