# Dual Database Setup Guide
## MongoDB (Current) + PostgreSQL (Future)

This guide helps you run both databases side-by-side.

---

## 📋 Prerequisites Checklist

- [x] Node.js installed
- [x] MongoDB installed and running
- [ ] PostgreSQL installed
- [ ] PostgreSQL added to PATH
- [ ] Dependencies installed

---

## 🔧 Step 1: Install PostgreSQL

### Option A: Using winget (Recommended)
```powershell
winget install PostgreSQL.PostgreSQL.17
```

### Option B: Manual Download
1. Visit: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 17 installer
3. Run installer and follow these settings:
   - **Password**: Set a strong password (you'll need this!)
   - **Port**: 5432 (default)
   - **Locale**: Default
   - **Components**: Select all (Server, pgAdmin, Command Line Tools)

### Important: Add PostgreSQL to PATH

**Option 1: Automatic (Run as Administrator)**
```powershell
$pgPath = "C:\Program Files\PostgreSQL\17\bin"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$pgPath", [EnvironmentVariableTarget]::Machine)
```

**Option 2: Manual**
1. Open System Properties → Environment Variables
2. Edit System Variable `Path`
3. Add: `C:\Program Files\PostgreSQL\17\bin`
4. Click OK

**After adding to PATH: Restart PowerShell!**

---

## 📦 Step 2: Install Node.js Dependencies

```powershell
npm install
```

This installs:
- `pg` - PostgreSQL client for Node.js
- `dotenv` - Environment variable management
- All existing dependencies

---

## 🔐 Step 3: Configure Environment Variables

1. **Copy the example file:**
   ```powershell
   Copy-Item .env.example .env
   ```

2. **Edit `.env` file** with your settings:
   ```env
   # MongoDB (already working)
   MONGODB_URL=mongodb://127.0.0.1:27017/wanderlust
   
   # PostgreSQL (add your password)
   PG_HOST=localhost
   PG_PORT=5432
   PG_DATABASE=wanderlust
   PG_USER=postgres
   PG_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
   
   # Other settings
   SESSION_SECRET=change_this_in_production
   ```

---

## 🗄️ Step 4: Create PostgreSQL Database

**Method 1: Using Command Line**
```powershell
# Create database
createdb wanderlust

# Or using psql
psql -U postgres -c "CREATE DATABASE wanderlust;"
```

**Method 2: Using pgAdmin**
1. Open pgAdmin 4
2. Connect to PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `wanderlust`

---

## 🚀 Step 5: Set Up PostgreSQL Schema

Run these commands **one by one**:

```powershell
# Step 1: Create all tables
psql -U postgres -d wanderlust -f database/migrations/001_initial_schema.sql

# Step 2: Load property types
psql -U postgres -d wanderlust -f database/seeds/001_property_types.sql

# Step 3: Load amenities
psql -U postgres -d wanderlust -f database/seeds/002_amenities.sql

# Step 4: Create analytical views
psql -U postgres -d wanderlust -f database/views/analytics_views.sql

# Step 5: Create functions and triggers
psql -U postgres -d wanderlust -f database/functions/business_logic.sql
```

**Or run all at once using npm script:**
```powershell
npm run pg:setup
```

---

## ✅ Step 6: Test Both Connections

```powershell
npm run test:db
```

You should see:
```
✅ MongoDB connected successfully
✅ PostgreSQL connected successfully
🎉 Both databases are ready!
```

---

## 🎮 Usage

### Continue Using MongoDB (Current)
```powershell
# Start your app normally
npm run dev
# or
nodemon app.js
```

Your app continues using MongoDB as before.

### Test PostgreSQL Connection
```powershell
# Test database connections
npm run test:db
```

### Access PostgreSQL Directly

**Using psql (Command Line):**
```powershell
# Connect to database
psql -U postgres -d wanderlust

# Run queries
SELECT * FROM users LIMIT 5;
SELECT * FROM property_types;
\dt                    # List all tables
\d users              # Describe users table
\q                    # Quit
```

**Using pgAdmin (GUI):**
1. Open pgAdmin 4
2. Navigate to: Servers → PostgreSQL 17 → Databases → wanderlust
3. Use Query Tool to run SQL

---

## 📚 NPM Scripts Reference

```powershell
# Application
npm start              # Start production server
npm run dev            # Start development server with nodemon

# Database Testing
npm run test:db        # Test both MongoDB and PostgreSQL connections

# PostgreSQL Setup
npm run pg:setup       # Run all PostgreSQL setup steps at once
npm run pg:migrate     # Run schema migrations only
npm run pg:seed        # Run seed data only
npm run pg:views       # Create views only
npm run pg:functions   # Create functions and triggers only
```

---

## 🔍 Troubleshooting

### PostgreSQL not found
**Error:** `psql : The term 'psql' is not recognized`

**Solution:**
1. Verify PostgreSQL is installed: Check `C:\Program Files\PostgreSQL\17\bin`
2. Add to PATH (see Step 1)
3. **Restart PowerShell** after adding to PATH
4. Verify: `psql --version`

### Database does not exist
**Error:** `FATAL: database "wanderlust" does not exist`

**Solution:**
```powershell
createdb wanderlust
```

### Wrong password
**Error:** `password authentication failed for user "postgres"`

**Solution:**
1. Check password in `.env` file
2. Reset password:
   ```powershell
   psql -U postgres
   ALTER USER postgres PASSWORD 'new_password';
   ```

### Connection refused
**Error:** `ECONNREFUSED`

**Solution:**
- PostgreSQL service is not running
- Start it:
  ```powershell
  # Using Services
  Start-Service postgresql-x64-17
  
  # Or check in Services.msc
  # Find "postgresql-x64-17" and start it
  ```

### Port already in use (8080)
**Error:** `EADDRINUSE: address already in use :::8080`

**Solution:**
```powershell
# Find and kill process using port 8080
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force

# Then restart your app
npm run dev
```

---

## 🎯 Current Status

✅ **MongoDB**: Active and working  
⏳ **PostgreSQL**: Set up for future migration  

Your application continues using MongoDB. The PostgreSQL schema is ready when you're ready to migrate!

---

## 📖 Next Steps

1. ✅ Install PostgreSQL
2. ✅ Set up environment variables
3. ✅ Create database and schema
4. ✅ Test connections
5. 🔜 Learn PostgreSQL queries
6. 🔜 Build data migration scripts
7. 🔜 Create API endpoints using PostgreSQL
8. 🔜 Gradual migration from MongoDB to PostgreSQL

---

## 📞 Quick Reference

### PostgreSQL Commands
```powershell
psql --version                          # Check version
psql -U postgres                        # Connect as postgres user
psql -U postgres -d wanderlust          # Connect to wanderlust database
createdb wanderlust                     # Create database
dropdb wanderlust                       # Delete database (careful!)
pg_dump wanderlust > backup.sql         # Backup database
psql wanderlust < backup.sql            # Restore database
```

### Useful Queries
```sql
-- List all tables
\dt

-- Describe table structure
\d table_name

-- Show all databases
\l

-- Show database size
SELECT pg_size_pretty(pg_database_size('wanderlust'));

-- Count rows in table
SELECT COUNT(*) FROM property_types;

-- Check extensions
\dx
```

---

## 🆘 Need Help?

- PostgreSQL Docs: https://www.postgresql.org/docs/
- pgAdmin Docs: https://www.pgadmin.org/docs/
- node-postgres (pg) Docs: https://node-postgres.com/

Good luck! 🚀
