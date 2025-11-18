# 🚀 CogniScope Setup Instructions

## ⚠️ IMPORTANT: Follow these steps in order!

### Step 1: Environment Variables

1. Make sure you have a `.env` file in the root directory
2. Update it with your actual values:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/cogniscope?schema=public"

# NextAuth - Generate a secure secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-this-with-openssl-command-below"

# Gemini API - Get from Google AI Studio
GEMINI_API_KEY="your-gemini-api-key-from-google"
```

### Step 2: Generate NextAuth Secret

**On Windows PowerShell:**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**On Linux/Mac:**

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

### Step 3: Get Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

### Step 4: Set up PostgreSQL Database

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL if not installed
# Create a database:
createdb cogniscope

# Update DATABASE_URL in .env:
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/cogniscope?schema=public"
```

**Option B: Use a Cloud Provider (Recommended for quick setup)**

- **Neon (Free tier):** https://neon.tech
- **Supabase:** https://supabase.com
- **Railway:** https://railway.app

After creating your database, copy the connection string to your `.env` file.

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Generate Prisma Client & Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### Step 7: Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 🎯 Quick Start Guide

1. **Sign Up**: Go to `/auth/signup` and create an account
2. **Login**: Sign in with your credentials
3. **Dashboard**: View your dashboard and stats
4. **Take Assessment**: Click "Start New Assessment"
5. **Complete Test**: Answer 20 AI-generated questions
6. **View Report**: See your detailed cognitive assessment report

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module '@prisma/client'"

**Solution:**

```bash
npx prisma generate
```

### Issue: "Database connection failed"

**Solution:**

- Check your DATABASE_URL is correct
- Ensure PostgreSQL is running
- Test connection with: `npx prisma db push`

### Issue: "NEXTAUTH_SECRET not defined"

**Solution:**

- Generate a secret using the command above
- Make sure .env file exists in root directory

### Issue: Gemini API errors

**Solution:**

- Verify your API key is valid
- Check you have API quota remaining
- Visit: https://makersuite.google.com/app/apikey

## 📦 Production Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Set Environment Variables in Vercel:**

1. Go to your project settings
2. Add all variables from .env
3. Update NEXTAUTH_URL to your production domain

### Database for Production

Use one of these managed PostgreSQL services:

- Vercel Postgres
- Neon
- Supabase
- Railway
- AWS RDS

## 📊 Database Management

**View Database in GUI:**

```bash
npx prisma studio
```

**Reset Database (⚠️ Deletes all data):**

```bash
npx prisma migrate reset
```

**Create a new migration:**

```bash
npx prisma migrate dev --name your_migration_name
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to change the color scheme.

### Test Questions

Modify prompts in `src/lib/gemini.ts` to adjust question generation.

### UI Components

All reusable components are in `src/components/ui/`.

## 📝 Testing the Full Flow

1. Create account → Login
2. Dashboard → Start New Assessment
3. Answer questions → Submit
4. View generated report
5. Dashboard → View all reports

## 🆘 Need Help?

If you encounter issues:

1. Check all environment variables are set
2. Ensure PostgreSQL is running
3. Run `npm install` again
4. Clear `.next` folder: `rm -rf .next` (or delete manually)
5. Check console for specific error messages

---

**Ready to start? Run these commands:**

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate dev

# 4. Start development server
npm run dev
```

Your app will be running at **http://localhost:3000** 🎉
