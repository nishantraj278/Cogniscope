# Quick Start Commands - Copy and Paste These!

## ⚡ Fast Setup (5 minutes)

### 1️⃣ First Time Setup

```powershell
# Navigate to project
cd "C:\Users\nisha\OneDrive\Desktop\DEV\cogniscope"

# Generate a secure NextAuth secret
$secret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "Your NEXTAUTH_SECRET: $secret"
# Copy this value and paste it into your .env file!
```

### 2️⃣ Update .env File

Open `.env` and update these values:

```env
# 1. Get a FREE database from: https://neon.tech (takes 2 minutes)
DATABASE_URL="your-postgresql-url-from-neon"

# 2. Use the secret generated above
NEXTAUTH_SECRET="paste-secret-here"

# 3. Get FREE API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key"
```

### 3️⃣ Install & Run

```powershell
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start the development server
npm run dev
```

## 🎯 Open Your App

Your app will be running at: **http://localhost:3000**

## 🚀 Quick Test Flow

1. **Sign Up**: http://localhost:3000/auth/signup
2. **Login**: http://localhost:3000/auth/login
3. **Dashboard**: http://localhost:3000/dashboard
4. **Start Test**: Click "Start New Assessment"
5. **Take Test**: Answer 20 AI-generated questions
6. **View Report**: See your detailed cognitive assessment

## 🆘 Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```powershell
npx prisma generate
```

### Error: "Database connection failed"

```powershell
# Test your database connection
npx prisma db push
```

### Clear cache and restart

```powershell
# Remove build cache
Remove-Item -Recurse -Force .next
# Restart dev server
npm run dev
```

## 🎨 What You Get

✅ Modern landing page
✅ User authentication (login/signup)
✅ AI-powered test generation
✅ Interactive test interface
✅ Comprehensive reports with AI analysis
✅ User dashboard with statistics
✅ Complete database with Prisma
✅ Black/White/Red medical-tech design
✅ Smooth animations
✅ Fully responsive

## 📦 Quick Commands Reference

```powershell
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma db push       # Push schema to database

# Maintenance
npm run lint             # Check code quality
```

## 🌐 Get Free Services

### Database (Choose One):

- **Neon** (Recommended): https://neon.tech - PostgreSQL, free tier
- **Supabase**: https://supabase.com - PostgreSQL + extras
- **Railway**: https://railway.app - Easy setup

### Gemini API:

- **Google AI Studio**: https://makersuite.google.com/app/apikey
- Free tier: 60 requests per minute
- No credit card required

## 🎉 Success Checklist

- [ ] `.env` file configured with all 3 variables
- [ ] `npm install` completed successfully
- [ ] `npx prisma generate` completed
- [ ] `npx prisma migrate dev` created database tables
- [ ] `npm run dev` started successfully
- [ ] App opens at http://localhost:3000
- [ ] Can sign up and login
- [ ] Can start and complete a test
- [ ] Can view generated report

---

**Need help?** Check SETUP.md for detailed instructions!
**Want to learn more?** Check PROJECT_OVERVIEW.md for complete documentation!

🚀 **Ready to revolutionize cognitive health assessment!**
