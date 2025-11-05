# Setup Guide - Shopping Safari

## Prerequisites

Before starting, ensure you have:

- Node.js (v18 or higher) installed
- npm or yarn package manager
- A Supabase account (free tier works fine)
- A code editor (VS Code recommended)

## Step 1: Supabase Database Setup

1. **Create a Supabase Project**

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set Up Database Tables**

   - In Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `server/database-setup.sql`
   - Run the SQL script
   - Verify tables are created in the Table Editor

3. **Configure Row Level Security (RLS)**
   - For production, you'll want to set up RLS policies
   - For development, you can disable RLS temporarily
   - Go to Authentication > Policies in Supabase dashboard

## Step 2: Backend Setup

1. **Navigate to server directory**

```bash
cd server
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**
   - Copy the example: (if .env.example exists)
   - Or create `.env` file manually with:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

4. **Update environment variables**

   - Replace `your_supabase_project_url_here` with your Supabase project URL
   - Replace `your_supabase_anon_key_here` with your Supabase anon key
   - Change `JWT_SECRET` to a secure random string (use a password generator)

5. **Start the server**

```bash
npm start
```

The server should start on `http://localhost:5000`

## Step 3: Frontend Setup

1. **Navigate to client directory**

```bash
cd client
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**
   - Create `.env` file with:

```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start development server**

```bash
npm run dev
```

The frontend should start on `http://localhost:3000`

## Step 4: Verify Setup

1. **Check Backend**

   - Open browser to `http://localhost:5000/api/health`
   - Should see: `{"status":"OK","message":"Server is running"}`

2. **Check Frontend**

   - Open browser to `http://localhost:3000`
   - Should see the Shopping Safari homepage

3. **Test Registration**
   - Click "Register" in navigation
   - Create a test account
   - Verify you can log in

## Troubleshooting

### Backend Issues

**Port already in use:**

- Change `PORT` in server `.env` file
- Or stop the process using port 5000

**Supabase connection errors:**

- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify database tables are created

**JWT errors:**

- Ensure `JWT_SECRET` is set in `.env`
- Use a strong, random string for production

### Frontend Issues

**API calls failing:**

- Verify `VITE_API_URL` in client `.env` matches backend port
- Check backend server is running
- Check browser console for CORS errors

**Icons not showing:**

- Ensure `react-icons` is installed: `npm install react-icons`
- Check icon names match exactly in constants.js

**Styling not working:**

- Clear browser cache
- Restart dev server
- Verify Tailwind CSS is configured correctly

### Database Issues

**Tables not found:**

- Run `database-setup.sql` again in Supabase SQL Editor
- Check table names match exactly (case-sensitive)

**Permission errors:**

- Check RLS policies in Supabase
- For development, you may need to disable RLS temporarily

## Next Steps

1. **Add Sample Products**

   - Use Supabase dashboard to add products manually
   - Or create an admin script to seed data

2. **Customize Theme**

   - Edit `client/src/config/constants.js`
   - Change colors, fonts, content as needed

3. **Configure Payment**

   - Integrate payment gateway (Stripe, PayPal, etc.)
   - Update checkout flow

4. **Deploy**
   - Set up production environment variables
   - Deploy backend to hosting service (Heroku, Railway, etc.)
   - Deploy frontend to Vercel, Netlify, or similar

## Environment Variables Summary

### Backend (.env)

```
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your-super-secret-jwt-key
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
```

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Enable Row Level Security in Supabase
- [ ] Set up proper CORS origins
- [ ] Use environment-specific API URLs
- [ ] Set up error logging
- [ ] Configure rate limiting
- [ ] Set up SSL/HTTPS
- [ ] Backup database regularly

---

**Need Help?** Check `PROJECT_STRUCTURE.md` for detailed documentation.
