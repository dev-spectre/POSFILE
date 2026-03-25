# 🚀 Quick Start Checklist

## Immediate Next Steps (DO THIS NOW)

### Step 1: Create Environment File (.env)
```bash
# In project root, create .env file with:

PORT=5000
FRONTEND_URL=http://localhost:5173

# MongoDB Connection (pick one)
MONGODB_URI=mongodb://localhost:27017/restaurant-pos
# OR for cloud: mongodb+srv://username:password@cluster.mongodb.net/restaurant-pos

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-123456

# Razorpay (get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Twilio (get from https://console.twilio.com/)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=+14155552671
```

⚠️ **CRITICAL: This must be done before running the server!**

---

## Step 2: Install Dependencies
```bash
npm install
```

---

## Step 3: Start MongoDB
Choose one option:

**Option A: Local MongoDB**
```bash
# Windows - Run MongoDB service
# OR start mongod manually:
mongod --dbpath "C:\data\db"
```

**Option B: MongoDB Atlas (Cloud)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string
- Copy to MONGODB_URI in .env

---

## Step 4: Start Backend

```bash
npm run server:dev
```

**Expected Output:**
```
✓ Server running on port 5000
✓ MongoDB connected
✓ API ready at http://localhost:5000/api
```

---

## Step 5: Start Frontend (New Terminal)

```bash
npm run dev
```

**Expected Output:**
```
✓ Vite server running at http://localhost:5173
✓ Ready in XXX ms
```

---

## Step 6: Test Application

1. **Open Browser**
   - Go to http://localhost:5173

2. **You should see:**
   - Login page with "Register" tab
   - Beautiful modern UI

3. **Register a Restaurant**
   ```
   Restaurant Name: Test Restaurant
   Admin Username: admin
   Admin Email: admin@test.com
   Password: test123
   Phone: 9999999999
   Address: Test Address
   ```

4. **Login**
   - Use username and password from step 3

5. **Explore Dashboard**
   - See empty sales data
   - Click "Go to POS" button

6. **Add Menu Items**
   - Go to "Menu Management"
   - Add sample items:
     ```
     Item 1:
     - Name: Biryani
     - Category: Main Course
     - Price: 250
     - Discount: 10%
     
     Item 2:
     - Name: Samosa
     - Category: Appetizers
     - Price: 30
     ```

7. **Create Order**
   - Go to POS
   - Select items and add to cart
   - Click "Proceed to Payment"
   - Test payment options

8. **Check Analytics**
   - Go to "Sales"
   - Should see order reflected in daily sales

---

## Troubleshooting

### Backend Issues

**"Port 5000 already in use"**
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**"Cannot connect to MongoDB"**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Try local connection first: `mongodb://localhost:27017/restaurant-pos`

**"JWT_SECRET not found"**
- Add JWT_SECRET to .env file
- Restart server after adding

---

### Frontend Issues

**"Cannot GET /api/xxx"**
- Backend not running
- Check if http://localhost:5000 is accessible
- Check Vite proxy in vite.config.ts

**"Blank page or errors in console"**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

**"CORS errors"**
- Backend CORS middleware not working
- Check port numbers are correct

---

## File Locations

```
Project Root/
├── .env                 ← CREATE THIS FILE FIRST!
├── .env.example         ← Use as template
├── package.json
├── src/                 ← Frontend code
├── server/              ← Backend code
├── SETUP_GUIDE.md       ← Detailed setup
├── IMPLEMENTATION_GUIDE.md  ← Technical details
└── PROJECT_SUMMARY.md   ← This file
```

---

## Commands Cheat Sheet

```bash
# Install dependencies
npm install

# Development
npm run dev              → Frontend only (http://localhost:5173)
npm run server:dev      → Backend only (http://localhost:5000)

# Production
npm run build           → Build frontend
npm start              → Run backend in production

# Other
npm run lint           → Check code
npm run test           → Run tests
```

---

## Testing Payments (Razorpay Test Mode)

Use these test card details:
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
OTP: 123456
```

---

## Testing WhatsApp (Twilio Sandbox)

1. Go to Twilio Console
2. Find WhatsApp Sandbox
3. Send initial message to activate
4. Get sandbox number from there
5. Update TWILIO_WHATSAPP_NUMBER in .env

---

## Keys and Credentials

### Get Razorpay Keys
1. Go to https://dashboard.razorpay.com
2. Sign up or login
3. Go to Account Settings → API Keys
4. Copy Test Mode keys
5. Add to .env

### Get Twilio Credentials
1. Go to https://console.twilio.com
2. Sign up or login
3. Get Account SID and Auth Token
4. Get phone number from Phone Numbers
5. Add to .env

---

## Expected Behavior Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can register restaurant account
- [ ] Can login with credentials
- [ ] Dashboard shows sales data (empty initially)
- [ ] Can add menu items
- [ ] Can browse menu in POS
- [ ] Can add items to cart
- [ ] Cart totals calculate correctly
- [ ] Can view order summary
- [ ] Razorpay modal opens on checkout
- [ ] Can see orders in analytics
- [ ] Analytics show sales data

---

## Next: Deep Features

Once basic flow works:

1. **Test All Features**
   - Try edit/delete menu items
   - Try different payment methods
   - Try applying discounts
   - Check analytics for accuracy

2. **Prepare for Production**
   - Get real Razorpay credentials
   - Get real Twilio credentials
   - Use MongoDB Atlas
   - Update all .env variables
   - Test thoroughly

3. **Deploy to Cloud**
   - Follow SETUP_GUIDE.md deployment section
   - Frontend to Vercel/Netlify
   - Backend to Render/Railway
   - Database to MongoDB Atlas

---

## Need Help?

**Comprehensive Guides:**
- SETUP_GUIDE.md - Complete setup instructions
- IMPLEMENTATION_GUIDE.md - Architecture & features

**Check:**
1. Is MongoDB running?
2. Is .env file created and filled?
3. Are ports 5000 and 5173 free?
4. Is API responding? (curl http://localhost:5000/api/health)
5. Check browser console for errors

---

## 🎉 You're Ready!

Follow steps 1-6 above and you'll have a working POS system in minutes!

**Questions? Check the documentation files:**
- SETUP_GUIDE.md
- IMPLEMENTATION_GUIDE.md

**Time Estimate:**
- Setup: 5-10 minutes
- First test: 5 minutes
- Exploring features: 15+ minutes

**Total: ~30 minutes to full working system** ⚡
