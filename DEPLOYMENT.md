# Deployment Guide (Secure Docker Setup)

This project uses a production-ready Docker setup with comprehensive security measures.

## Prerequisites

- Docker and Docker Compose installed
- Supabase project created with authentication enabled
- Environment variables configured

## 1) Configure Environment Variables

Create a `.env` file in the project root with your credentials:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Gemini AI Configuration (Optional)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
VITE_APP_ENV=production
VITE_APP_URL=https://your-domain.com
```

**⚠️ CRITICAL**: Never commit the `.env` file to version control!

## 2) Database Setup

### Option A: Step-by-Step Setup (Recommended)

Due to Supabase permission restrictions, run the database setup in smaller chunks:

1. **Go to Supabase Dashboard → SQL Editor**
2. **Run Step 1** (Create tables):
   ```sql
   -- Copy and paste the contents of database/schema-step-by-step.sql
   -- Run only the "Step 1: Create tables" section
   ```

3. **Run Step 2** (Create indexes):
   ```sql
   -- Run only the "Step 2: Create indexes" section
   ```

4. **Run Step 3** (Create triggers):
   ```sql
   -- Run only the "Step 3: Create triggers" section
   ```

5. **Run Step 4** (Enable RLS):
   ```sql
   -- Run only the "Step 4: Enable RLS" section
   ```

6. **Run Step 5** (Create RLS policies):
   ```sql
   -- Run only the "Step 5: Create RLS policies" section
   ```

### Option B: Single File Setup (May cause permission errors)

If you have admin access, you can try running the complete `database/schema.sql` file.

### Create Admin User

After setting up the database:

1. **Sign up through your app** or Supabase dashboard
2. **Get your user UUID** from the auth.users table
3. **Run this SQL** to grant admin privileges:
```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('your-user-uuid-here', 'admin');
```

## 3) Build and Deploy

### Local Testing
```bash
# Build and test locally
docker-compose up --build

# The app will be available at http://localhost:3000
```

### Production Deployment
```bash
# Build and run in background
docker-compose up --build -d

# Check logs
docker-compose logs -f

# Check health status
docker-compose ps
```

## 4) Security Verification

After deployment, verify these security measures:

- [ ] Authentication required for all protected routes
- [ ] Admin functions only accessible to admin users
- [ ] Users can only access their own data
- [ ] HTTPS enabled (production)
- [ ] Security headers present
- [ ] No hardcoded credentials in source

## 5) Monitoring and Maintenance

### Health Checks
```bash
# Check container health
docker-compose ps

# View logs
docker-compose logs -f training-management-app

# Restart if needed
docker-compose restart
```

### Security Updates
- Regularly update dependencies: `npm audit fix`
- Monitor Supabase security logs
- Review access patterns
- Update environment variables as needed

## 6) Stop and Clean Up

```bash
# Stop services
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Clean up images
docker system prune -a
```

## Troubleshooting

### Common Issues

**Port conflicts**: Change the port in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change 3000 to your preferred port
```

**Environment variables not loading**: 
- Ensure `.env` file exists and has correct format
- Check Docker Compose environment variable syntax
- Verify VITE_ prefix for client-side variables

**Authentication errors**:
- Verify Supabase URL and keys
- Check RLS policies are enabled
- Ensure admin user has proper role assignment

**Database connection issues**:
- Verify Supabase project is active
- Check network connectivity
- Review RLS policy configuration

**Permission denied errors**:
- Use the step-by-step schema setup
- Ensure you're running SQL in the correct Supabase project
- Check that you have access to create tables and policies

### Rebuild Clean
```bash
# Force rebuild without cache
docker-compose build --no-cache

# Clear Docker cache (aggressive)
docker system prune -a
```

## Security Features

This deployment includes:
- ✅ **Authentication**: Supabase Auth with JWT tokens
- ✅ **Authorization**: Role-based access control
- ✅ **Data Isolation**: Row Level Security (RLS)
- ✅ **Input Validation**: Client and server-side validation
- ✅ **Container Security**: Read-only filesystem, no privileges
- ✅ **Network Security**: HTTPS, security headers, CORS
- ✅ **Environment Security**: No hardcoded secrets

## Production Checklist

Before going live:
- [ ] HTTPS certificate configured
- [ ] Environment variables set
- [ ] Database RLS enabled
- [ ] Admin user created
- [ ] Security headers verified
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Incident response plan ready

---

**Security Note**: This app is now secure for public deployment with proper authentication, authorization, and data isolation. All critical security vulnerabilities have been addressed.

**Database Setup Note**: If you encounter permission errors, use the step-by-step approach in `database/schema-step-by-step.sql` instead of the complete schema file.
