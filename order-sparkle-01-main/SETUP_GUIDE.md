# OrderSparkle - SaaS Restaurant POS Platform

A production-ready, multi-tenant Restaurant Point of Sale (POS) system built with React, Node.js, MongoDB, and Razorpay integration.

## 🚀 Features

- ✅ **Multi-Tenant Architecture** - Each restaurant is completely isolated
- ✅ **Restaurant Registration & Authentication** - JWT-based login system
- ✅ **POS Billing System** - Fast and intuitive ordering interface
- ✅ **Menu Management** - Add, edit, delete menu items with discounts
- ✅ **Discount System** - Per-item and global discount support
- ✅ **Payment Integration** - Razorpay UPI, Card, Cash, and Wallet
- ✅ **Sales Analytics** - Daily, weekly, and monthly sales dashboards
- ✅ **WhatsApp Notifications** - Twilio integration for order updates
- ✅ **Responsive Design** - Works on desktop and tablet
- ✅ **Real-time Calculations** - Auto-calculate final prices with tax

## 📋 Tech Stack

### Frontend
- **React** (Vite) - UI library
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **shadcn/ui** - UI components
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Razorpay** - Payment gateway
- **Twilio** - WhatsApp API

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- Razorpay Account (free)
- Twilio Account (free trial)

### 1. Environment Configuration

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/restaurant-pos

# JWT
JWT_SECRET=your-super-secret-jwt-key-never-share-this

# Razorpay (Get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Twilio (Get from https://www.twilio.com)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=+1234567890
```

### 2. Install Dependencies

```bash
# Install both frontend and backend dependencies
npm install
```

### 3. Running the Project

**Option A: Run both in the same terminal**
```bash
npm start
```

**Option B: Run separately**

Terminal 1 (Backend):
```bash
npm run server:dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

## 📱 User Roles & Workflows

### Admin/Restaurant Manager
1. **Register** - Create restaurant account
2. **Login** - Access dashboard
3. **Dashboard** - View sales overview
4. **Manage Menu** - Add/edit/delete items
5. **POS** - Create orders and process payments
6. **Analytics** - View sales trends

---

## 🗄️ Database Schema

### Collections

#### `Restaurants`
- `_id` - MongoDB ID
- `restaurantName` - Unique restaurant name
- `adminUsername` - Unique username
- `adminEmail` - Contact email
- `password` - Hashed password
- `phoneNumber` - Business phone
- `address` - Restaurant location
- `isActive` - Account status
- `subscriptionStatus` - free/premium/enterprise

#### `MenuItems`
- `_id` - MongoDB ID
- `restaurantId` - Reference to restaurant
- `name` - Item name
- `category` - Appetizers, Main Course, etc.
- `price` - Base price
- `discountPercentage` - Discount %
- `finalPrice` - Auto-calculated price
- `image` - Item image URL
- `description` - Item details
- `isVeg` - Vegetarian flag

#### `Orders`
- `_id` - MongoDB ID
- `restaurantId` - Reference to restaurant
- `orderId` - Unique order ID
- `items` - Array of order items
- `subtotal` - Before tax & discount
- `tax` - 5% auto-calculated
- `totalAmount` - Final amount
- `customerPhone` - WhatsApp number
- `paymentMethod` - upi/card/cash/wallet
- `paymentStatus` - pending/paid/failed/refunded
- `razorpayOrderId` - For verification
- `razorpayPaymentId` - Payment reference

#### `Sales`
- `restaurantId` - Reference to restaurant
- `date` - Sales date
- `dailyTotal` - Daily revenue
- `orderCount` - Orders that day
- `paymentSummary` - Breakdown by method
- `topItems` - Best sellers
- `categoryWiseSales` - Sales by category

---

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new restaurant
POST   /api/auth/login             # Login
GET    /api/user/profile           # Get restaurant profile
PUT    /api/user/profile           # Update restaurant info
```

### Menu Management
```
POST   /api/menu                   # Add menu item
GET    /api/menu                   # Get all items
GET    /api/menu/category/:cat     # Get by category
PUT    /api/menu/:id               # Update item
DELETE /api/menu/:id               # Delete item
POST   /api/menu/discount/apply-global  # Apply global discount
```

### Orders & Billing
```
POST   /api/orders                 # Create order
GET    /api/orders                 # Get orders (with filters)
GET    /api/orders/:orderId        # Get single order
PUT    /api/orders/:orderId        # Edit order
POST   /api/orders/:orderId/mark-paid    # Mark as paid
POST   /api/orders/:orderId/cancel       # Cancel order
POST   /api/orders/payment/verify        # Verify Razorpay payment
```

### Sales Analytics
```
GET    /api/sales/daily            # Daily sales
GET    /api/sales/weekly           # Weekly sales
GET    /api/sales/monthly          # Monthly sales
GET    /api/sales/top-items        # Top selling items
GET    /api/sales/category-sales   # Sales by category
```

---

## 💳 Payment Integration

### Razorpay Flow
1. User selects UPI payment
2. Frontend calls `/api/orders` to create order
3. Backend creates Razorpay order and returns details
4. Frontend opens Razorpay checkout modal
5. User completes payment
6. Razorpay callback confirms payment
7. Backend verifies signature and marks order as PAID
8. WhatsApp notification sent to customer

### Test Credentials (Sandbox)
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Date: Any future date

---

## 📊 Dashboard Features

- **Today's Sales** - Real-time revenue
- **Order Count** - Total orders today
- **Weekly Revenue** - 7-day trend
- **Payment Methods** - UPI/Card/Cash breakdown
- **Charts** - Line charts for trends, Pie charts for methods
- **Quick Actions** - Links to POS, Menu, Analytics

---

## 🎨 UI/UX Design

- **Glassmorphism** - Modern frosted glass effect
- **Soft Shadows** - Subtle depth
- **Gradient Backgrounds** - Colorful gradients
- **Framer Motion** - Smooth animations
- **Mobile Responsive** - Tablet and desktop optimized
- **Dark/Light Support** - Theme toggle ready

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

Environment variables needed:
```
VITE_API_URL=https://your-api-domain.com/api
```

### Backend (Render/Railway)
```bash
# Push to GitHub
# Connect repository to Render/Railway
# Set environment variables in dashboard
# Deploy
```

---

## 📝 Development Notes

### Multi-Tenant Safety
- All queries filter by `restaurantId`
- JWT contains restaurant ID
- No cross-restaurant data access
- Indexes on `restaurantId` for performance

### Security
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- CORS enabled for frontend origin only
- Input validation on all endpoints
- SQL injection prevention via Mongoose

### Performance
- Connection pooling enabled
- Indexes on frequently queried fields
- Pagination support (ready to add)
- Caching ready (Redis)

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
# Linux/Mac: brew services start mongodb-community
# Or use MongoDB Atlas (cloud)
```

### Razorpay Payment Error
- Check API keys in `.env`
- Ensure whitelist includes localhost in Razorpay dashboard
- Use test keys for development

### WhatsApp Messages Not Sending
- Verify Twilio credentials
- Check phone format: `+919876543210`
- Ensure Twilio WhatsApp sandbox is active

---

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [MongoDB Guide](https://docs.mongodb.com)
- [Express.js](https://expressjs.com)
- [React Documentation](https://react.dev)

---

## 🎯 Future Enhancements

- [ ] Table Management
- [ ] Kitchen Display System (KDS)
- [ ] Customer Loyalty Program
- [ ] SMS Notifications
- [ ] Staff Management
- [ ] Inventory Tracking
- [ ] Supplier Integration
- [ ] Mobile App (React Native)
- [ ] Advanced Analytics
- [ ] Multi-location Support

---

## 📄 License

This project is proprietary and confidential for OrderSparkle.

---

## 🤝 Support

For issues, feature requests, or questions:
- Email: support@ordersparkle.com
- GitHub Issues: [Create Issue]
- Documentation: [Wiki]

---

**Built with ❤️ for restaurants worldwide**
