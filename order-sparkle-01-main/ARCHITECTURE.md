# 🏗️ OrderSparkle Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Vite)                       │
│                      http://localhost:5173                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐      │
│  │  Login   │  │Dashboard │  │   POS    │  │    Menu      │      │
│  │  Page    │  │  Page    │  │  Page    │  │   Admin      │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘      │
│       │             │             │               │               │
│       └─────────────┴─────────────┴───────────────┘               │
│                     │                                              │
│        ┌────────────▼─────────────┐                              │
│        │   Zustand Store (State)  │                              │
│        │ - Auth (token, user)     │                              │
│        │ - POS (cart, discount)   │                              │
│        │ - Persist to localStorage│                              │
│        └────────────┬─────────────┘                              │
│                     │                                              │
│        ┌────────────▼─────────────┐                              │
│        │   API Client (Axios)     │                              │
│        │ - Token Interceptor      │                              │
│        │ - Error Handler          │                              │
│        │ - Response Formatter     │                              │
│        └────────────┬─────────────┘                              │
│                     │                                              │
│                  HTTP/REST                                         │
│                     │                                              │
└─────────────────────┼──────────────────────────────────────────────┘
                      │
                      │ Proxy: /api → http://localhost:5000/api
                      │       (Vite Config)
                      │
┌─────────────────────▼──────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                     │
│                    http://localhost:5000/api                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                   Route Handlers                            │ │
│  │  /auth    /menu    /orders    /sales    /user              │ │
│  │ (5 route modules)                                          │ │
│  └────────────────────┬─────────────────────────────────────────┘ │
│                       │                                             │
│  ┌────────────────────▼──────────────────────────────────┐        │
│  │          MIDDLEWARE STACK (From Top)                 │        │
│  │ 1. CORS Middleware                                   │        │
│  │ 2. JSON Parser                                       │        │
│  │ 3. Auth Middleware (JWT Verification)                │        │
│  │ 4. Error Handler                                     │        │
│  └────────────────────┬──────────────────────────────────┘        │
│                       │                                             │
│  ┌────────────────────▼──────────────────────────────────┐        │
│  │          CONTROLLERS (Business Logic)                │        │
│  │ - authController    (register, login, profile)      │        │
│  │ - menuController    (CRUD, discount)               │        │
│  │ - orderController   (create, verify, edit)         │        │
│  │ - salesController   (daily, weekly, monthly)       │        │
│  └────────────────────┬──────────────────────────────────┘        │
│                       │                                             │
│  ┌────────────────────▼──────────────────────────────────┐        │
│  │           SERVICES (External APIs)                  │        │
│  │ - paymentService   (Razorpay)                      │        │
│  │ - whatsappService  (Twilio)                        │        │
│  └────────────────────┬──────────────────────────────────┘        │
│                       │                                             │
│  ┌────────────────────┴──────────────────────┐                   │
│  │                                           │                   │
│  ▼                                           ▼                   │
│ ┌──────────────────┐              ┌──────────────────────┐      │
│ │   MongoDB        │              │ External APIs        │      │
│ │ (local or Atlas) │              │ - Razorpay          │      │
│ │                  │              │ - Twilio            │      │
│ │ Collections:     │              └──────────────────────┘      │
│ │ - Restaurants    │                                             │
│ │ - MenuItems      │                                             │
│ │ - Orders         │                                             │
│ │ - Sales          │                                             │
│ └──────────────────┘                                             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Breakdown

### FRONTEND LAYER

#### Pages (React Components)

**LoginPage.tsx**
```
Responsibilities:
├─ Display registration form OR login form (tab UI)
├─ Validate email, password, restaurant name
├─ Call authAPI.register() or authAPI.login()
├─ Store JWT token in Zustand
├─ Redirect to /dashboard on success
└─ Show errors via toast notifications
```

**DashboardPage.tsx**
```
Responsibilities:
├─ Fetch daily sales data (salesAPI.getDailySales)
├─ Display revenue stat cards
├─ Render line chart with 7-day trend
├─ Show payment method pie chart
├─ Display quick action buttons
└─ Update data on refresh
```

**POSPage.tsx**
```
Responsibilities:
├─ Fetch menu items (menuAPI.getItems)
├─ Filter menu by selected category
├─ Display items in grid layout
├─ Add/remove items from cart (Zustand)
├─ Calculate totals, tax, discounts
├─ Collect customer phone number
├─ Trigger Razorpay payment modal
├─ Verify payment and create order
└─ Show success/error feedback
```

**MenuAdminPage.tsx**
```
Responsibilities:
├─ Display menu items list
├─ Show form to add new items
├─ Edit item using modal form
├─ Delete item with confirmation
├─ Validate discount range (0-100)
├─ Call menuAPI (add, update, delete)
└─ Show toast notifications
```

**SalesPage.tsx**
```
Responsibilities:
├─ Render 3 tabs: Daily / Weekly / Monthly
├─ Fetch appropriate sales data
├─ Display revenue stat cards
├─ Render trend line charts
├─ Show payment breakdown pie chart
├─ Display top selling items list
├─ Show category-wise sales
└─ Update on refresh button click
```

### STATE MANAGEMENT LAYER

**Zustand Store (posStore.ts)**
```typescript
State Structure:
├─ Auth State
│  ├─ isAuthenticated: boolean
│  ├─ token: string | null
│  ├─ restaurant: { id, name, email }
│  └─ lastLoginTime: number
│
├─ POS State
│  ├─ cart: CartItem[]
│  ├─ discount: number (0-100)
│  └─ selectedPaymentMethod: string
│
├─ Computed Properties
│  ├─ getSubtotal() - Sum of (price * qty)
│  ├─ getTax() - Subtotal * 5% (hardcoded)
│  ├─ getTotal() - (Subtotal - discount * item) + tax
│
└─ Actions
   ├─ setAuth(token, restaurant) - Login
   ├─ logout() - Clear state + localStorage
   ├─ addToCart(item) - Add item with qty 1
   ├─ removeFromCart(itemId) - Remove from cart
   ├─ updateQuantity(itemId, qty) - Change qty
   ├─ clearCart() - Empty cart
   └─ setDiscount(percent) - Global discount

Persistence:
└─ localStorage with key 'pos-store' (auto-hydrate on mount)
```

### API INTEGRATION LAYER

**API Client (src/lib/api.ts)**
```typescript
Axios Instance Configuration:
├─ Base URL: http://localhost:5000/api
├─ Default Headers: application/json
│
├─ Request Interceptor
│  ├─ Add Authorization header with Bearer token
│  └─ Attach restaurantId from store
│
├─ Response Interceptor
│  ├─ Return data directly
│  ├─ Catch 401 (Unauthorized)
│  ├─ Clear auth state on 401
│  └─ Redirect to /login
│
└─ Endpoint Groups
   ├─ authAPI
   │  ├─ register(data)
   │  └─ login(data)
   │
   ├─ menuAPI
   │  ├─ addItem(data)
   │  ├─ getItems()
   │  ├─ getByCategory(cat)
   │  ├─ updateItem(id, data)
   │  └─ deleteItem(id)
   │
   ├─ orderAPI
   │  ├─ createOrder(items, payment)
   │  ├─ getOrders()
   │  ├─ getOrder(id)
   │  ├─ updateOrder(id, data)
   │  └─ verifyPayment(data)
   │
   └─ salesAPI
      ├─ getDailySales()
      ├─ getWeeklySales()
      ├─ getMonthlySales()
      ├─ getTopItems()
      └─ getCategorySales()
```

---

## BACKEND LAYER

### Express Server Architecture

```
server.js (Entry Point)
│
├─ Middleware Setup
│  ├─ CORS (allow localhost:5173)
│  ├─ express.json()
│  ├─ express.urlencoded()
│  └─ errorHandler (bottom of stack)
│
├─ Route Registration
│  ├─ /api/auth → authRoutes (PUBLIC)
│  ├─ /api/user → protectedRoutes (PROTECTED)
│  ├─ /api/menu → menuRoutes (PROTECTED)
│  ├─ /api/orders → orderRoutes (PROTECTED)
│  └─ /api/sales → salesRoutes (PROTECTED)
│
└─ Server Start
   ├─ Connect to MongoDB
   ├─ Listen on PORT (default 5000)
   └─ Log status
```

### Authentication Flow

```
User Registration:
┌────────────────┐
│ Submit Form    │ POST /api/auth/register
│ {email, name,  │     ↓
│  username,     │ ┌─────────────────────────┐
│  password}     │ │ authController.register │
└────────────────┘ │ 1. Validate unique email│
                   │ 2. Hash password bcrypt │
                   │ 3. Create Restaurant doc│
                   │ 4. Generate JWT token   │
                   │ 5. Return token + data  │
                   └──────────┬──────────────┘
                              ↓
                   {token, restaurant}
                   Stored in Zustand



User Login:
┌────────────────┐
│ Submit Form    │ POST /api/auth/login
│ {username,     │     ↓
│  password}     │ ┌─────────────────────────┐
└────────────────┘ │ authController.login    │
                   │ 1. Find restaurant      │
                   │ 2. Compare password bcry│
                   │ 3. Generate JWT token   │
                   │ 4. Return token + data  │
                   └──────────┬──────────────┘
                              ↓
                   {token, restaurant}
                   Stored in Zustand


Protected Route Access:
┌────────────────┐
│ API Request    │ Header: Authorization: Bearer <token>
│ with JWT token │     ↓
└────────────────┘ ┌──────────────────────┐
                   │ authMiddleware       │
                   │ 1. Extract token     │
                   │ 2. Verify JWT        │
                   │ 3. Decode restaurantId
                   │ 4. Inject into req   │
                   │ 5. Call next()       │
                   └──────┬───────────────┘
                          ↓
                   Route Handler (ensures
                   restaurantId is provided
                   for data isolation)
```

### Request Flow Example (Create Order)

```
FRONTEND: submitOrder(items, phone, method)
    │
    │ POST /api/orders
    │ Body: { items: [...], customerPhone, paymentMethod }
    │ Header: Authorization: Bearer <jwt_token>
    │
    ▼
BACKEND: Route Handler
    ├─ authMiddleware checks JWT
    ├─ Extracts restaurantId from JWT
    ├─ Calls orderController.createOrder(req, res)
    │
    ▼
CONTROLLER:
    ├─ Validate items exist and belong to restaurant
    ├─ Fetch items from DB
    ├─ Calculate subtotal: Sum(item.finalPrice * qty)
    ├─ Calculate tax: subtotal * 5%
    ├─ Calculate total: subtotal + tax
    ├─ Create Order document:
    │  ├─ restaurantId (from req)
    │  ├─ orderId (auto-generated: ORD-timestamp-random)
    │  ├─ items (array with finalPrice)
    │  ├─ subtotal, tax, totalAmount
    │  ├─ customerPhone
    │  ├─ paymentMethod
    │  ├─ paymentStatus: 'pending'
    │  └─ createdAt: now
    │
    ├─ If paymentMethod === 'razorpay':
    │  ├─ Call paymentService.createRazorpayOrder()
    │  └─ Razorpay returns orderId
    │
    └─ Return Order data to frontend
        │
        ▼
FRONTEND: Zustand updates
    ├─ Clear cart
    ├─ Show order ID
    ├─ If paymentMethod === 'cash':
    │  └─ Show success
    │
    └─ If paymentMethod === 'razorpay':
       ├─ Open Razorpay checkout modal
       ├─ User completes payment
       │
       ▼
       PAYMENT VERIFICATION
       ├─ Razorpay returns paymentId + signature
       ├─ Frontend calls verifyPayment endpoint
       │
       ►BACKEND: Verify signature (Razorpay SDK)
       │  ├─ Update Order:
       │  │  ├─ paymentStatus: 'confirmed'
       │  │  ├─ razorpayPaymentId: <id>
       │  │  └─ razorpayOrderId: <id>
       │  │
       │  ├─ Call Sales model to aggregate
       │  └─ Send WhatsApp message
       │
       ▼
       FRONTEND: Show confirmation
       └─ Update dashboard with new order
```

### Database Schema Design

```
Restaurant Collection:
├─ _id: ObjectId
├─ restaurantName: String (UNIQUE)
├─ adminUsername: String (UNIQUE)
├─ adminEmail: String
├─ passwordHash: String (bcrypt)
├─ phoneNumber: String
├─ address: String
├─ city: String
├─ state: String
├─ zipCode: String
├─ cuisineType: String
├─ logo: String (URL)
├─ subscriptionStatus: Enum (free/premium/enterprise)
├─ createdAt: Date
└─ updatedAt: Date

MenuItem Collection:
├─ _id: ObjectId
├─ restaurantId: ObjectId (Ref: Restaurant)  [INDEX]
├─ name: String
├─ category: Enum (breakfast, lunch, dinner, beverage...)
├─ price: Number
├─ discountPercentage: Number (0-100)
├─ finalPrice: Number (auto-calculated in pre-save)
│  └─ Formula: price - (price * discount / 100)
├─ image: String (URL)
├─ description: String
├─ isVeg: Boolean
├─ preparationTime: Number (minutes)
├─ rating: Number (0-5)
├─ createdAt: Date
└─ updatedAt: Date
INDEXES: [restaurantId, category]


Order Collection:
├─ _id: ObjectId
├─ restaurantId: ObjectId (Ref: Restaurant)  [INDEX]
├─ orderId: String (auto-generated: ORD-<timestamp>-<random>)  [UNIQUE]
├─ items: Array
│  └─ [
│      {
│        menuItemId: ObjectId,
│        name: String,
│        price: Number,
│        finalPrice: Number,
│        quantity: Number,
│        subtotal: Number
│      }
│    ]
├─ subtotal: Number (sum of all items)
├─ tax: Number (subtotal * 5%)
├─ totalAmount: Number (subtotal + tax)
├─ customerPhone: String
├─ paymentMethod: Enum (cash, card, upi, wallet)  [INDEX]
├─ paymentStatus: Enum (pending, confirmed, failed)  [INDEX]
├─ razorpayOrderId: String
├─ razorpayPaymentId: String
├─ whatsappMessageSent: Boolean
├─ createdAt: Date
└─ updatedAt: Date
INDEXES: [restaurantId, createdAt], [restaurantId, paymentStatus]


Sales Collection:
├─ _id: ObjectId
├─ restaurantId: ObjectId (Ref: Restaurant)  [INDEX]
├─ date: Date (only date part, no time)  [INDEX]
├─ dailyTotal: Number (total revenue for day)
├─ orderCount: Number (total orders for day)
├─ paymentSummary: Object
│  └─ {
│      upi: Number,
│      card: Number,
│      cash: Number,
│      wallet: Number
│    }
├─ topItems: Array
│  └─ [
│      {
│        itemId: ObjectId,
│        itemName: String,
│        quantity: Number
│      }
│    ]
├─ categoryWiseSales: Array
│  └─ [
│      {
│        category: String,
│        revenue: Number,
│        itemCount: Number
│      }
│    ]
├─ createdAt: Date
└─ updatedAt: Date
INDEXES: [restaurantId, date]
```

---

## Data Flow Diagram

### Menu Item Creation Flow

```
Frontend: MenuAdminPage.tsx
    │
    ├─ User fills form
    │  ├─ name: "Biryani"
    │  ├─ category: "Main Course"
    │  ├─ price: 250
    │  ├─ discount: 10%
    │  └─ image: <file>
    │
    └─ Calls menuAPI.addItem(data)
        │
        ▼
    Axios interceptor
        ├─ Adds Authorization header
        ├─ Adds restaurantId
        └─ POST to /api/menu
           │
           ▼
    Backend: POST /api/menu
       ├─ menuRoutes.js routes to controller
       │
       ▼
    menuController.addMenuItem()
       ├─ Validate inputs
       ├─ Attach restaurantId from req
       ├─ Create MenuItem document
       │  ├─ price: 250
       │  ├─ discountPercentage: 10
       │  └─ finalPrice: calculated by pre-save hook
       │     └─ 250 - (250 * 10 / 100) = 225
       │
       ├─ Save to MongoDB
       └─ Return saved item
           │
           ▼
    Frontend Receives Response
       ├─ Clear form
       ├─ Show success toast
       └─ Refresh menu list
```

### Order Payment Flow

```
Frontend: POSPage.tsx
    │
    ├─ User adds items to cart
    ├─ Sets quantity and discount
    └─ Clicks "Proceed to Payment"
        │
        ▼
    Payment Modal Opens
       ├─ Customer enters phone
       ├─ Selects payment method
       │  ├─ Cash → Direct confirmation
       │  └─ Card/UPI → Razorpay modal
       │
       ▼ (if Razorpay selected)
    
    Call orderAPI.createOrder()
       │
       ▼
    Backend: POST /api/orders
       ├─ Calculate totals
       ├─ Create Order document
       ├─ Call paymentService.createRazorpayOrder()
       │  └─ Returns razorpayOrderId
       │
       └─ Return order data
           │
           ▼
    Frontend: Open Razorpay Modal
       ├─ Modal displayed
       ├─ User enters payment details
       └─ Razorpay processes payment
           │
           ▼
    Razorpay Returns Payment Response
       ├─ paymentId
       ├─ signature
       └─ status
           │
           ▼
    Call orderAPI.verifyPayment()
       │
       ▼
    Backend: POST /api/orders/payment/verify
       ├─ Verify signature (Razorpay SDK)
       ├─ Update Order:
       │  ├─ paymentStatus: 'confirmed'
       │  ├─ razorpayPaymentId
       │  └─ razorpayOrderId
       │
       ├─ Update Sales document
       │  ├─ dailyTotal += amount
       │  ├─ orderCount += 1
       │  ├─ paymentSummary.upi += amount
       │  └─ topItems, categoryWiseSales
       │
       ├─ Call whatsappService.sendOrderConfirmation()
       │  └─ Twilio sends message to customer
       │
       └─ Return success
           │
           ▼
    Frontend: Show Success
       ├─ Display order ID
       ├─ Clear cart
       └─ Redirect to dashboard
```

---

## Multi-Tenant Data Isolation

```
How It Works:

1. Registration:
   Restaurant A creates account
   └─ Password hashed, stored in DB
   
2. Login:
   Restaurant A logs in
   └─ JWT generated with payload:
      {
        restaurantId: A_ID,
        iat: <timestamp>,
        exp: <7 days from now>
      }
   
3. API Call:
   Restaurant A calls /api/menu
   ├─ Request header: Authorization: Bearer <JWT_A>
   │
   └─ authMiddleware:
      ├─ Validates JWT signature
      ├─ Extracts restaurantId: A_ID
      ├─ Injects into req.restaurantId
      └─ Calls next()
   
4. Database Query:
   menuController.getMenuItems()
   ├─ ALWAYS queries: { restaurantId: req.restaurantId }
   │
   └─ Returns ONLY Restaurant A's items
   
5. Separation:
   Restaurant B cannot:
   ├─ See Restaurant A's menu
   ├─ Access Restaurant A's orders
   ├─ Modify Restaurant A's data
   └─ View Restaurant A's sales
   
   Because:
   ├─ Restaurant B's JWT has restaurantId: B_ID
   ├─ All queries filter by restaurantId
   └─ Tokens cannot be forged (HMAC signature)
```

---

## Error Handling Architecture

```
Error Handling Levels:

1. Input Validation (Controllers)
   ├─ Missing fields
   ├─ Type mismatches
   ├─ Value range validation
   └─ Response: 400 Bad Request

2. Authentication (Middleware)
   ├─ Missing token
   ├─ Invalid signature
   ├─ Token expired
   └─ Response: 401 Unauthorized

3. Authorization (Controllers)
   ├─ restaurantId mismatch
   ├─ Cannot modify others' data
   └─ Response: 403 Forbidden

4. Not Found (Controllers)
   ├─ Item doesn't exist
   ├─ Order not found
   └─ Response: 404 Not Found

5. Business Logic (Controllers)
   ├─ Insufficient data
   ├─ Invalid state transition
   ├─ Duplicate entries
   └─ Response: 409 Conflict or 422 Unprocessable

6. External APIs (Services)
   ├─ Razorpay API error
   ├─ Twilio API error
   ├─ Retry logic implemented
   └─ Response: 500 Internal Server Error

7. Database (Controllers)
   ├─ Connection lost
   ├─ Query timeout
   ├─ Data inconsistency
   └─ Response: 500 Internal Server Error

Frontend Error Handling:
├─ API errors trigger toast notification
├─ 401 errors clear auth and redirect to login
├─ Form validation provides inline feedback
├─ Network errors show retry option
└─ User always sees meaningful message
```

---

## Security Architecture

```
Security Layers:

1. Client Side (Frontend)
   ├─ Protected routes (check isAuthenticated)
   ├─ Token stored in Zustand (in-memory + localStorage)
   ├─ HTTPS enforced in production
   └─ Form validation before submission

2. Transport Layer
   ├─ CORS allows only frontend origin
   ├─ HTTPS in production
   └─ No sensitive data in URLs

3. Authentication
   ├─ bcrypt hashing (10 rounds)
   ├─ JWT tokens (HS256 algorithm)
   ├─ Token expiration (7 days)
   ├─ restaurantId in JWT for isolation
   └─ Session-less (scalable)

4. Authorization
   ├─ Every query filters by restaurantId
   ├─ Tokens cannot be forged
   ├─ Middleware enforces auth on protected routes
   └─ Password never returned in responses

5. Database
   ├─ MongoDB Atlas encryption (optional)
   ├─ Indexed queries for performance
   ├─ Connection pooling
   └─ Parameterized queries (Mongoose)

6. Input Validation
   ├─ Type checking on all inputs
   ├─ Range validation (e.g., discount 0-100)
   ├─ Email format validation
   ├─ Phone number validation
   └─ Length constraints

7. Output Validation
   ├─ Sensitive fields excluded (password never sent)
   ├─ Response format consistent
   ├─ Error messages don't leak internals
   └─ HTTP status codes appropriate

8. External Integrations
   ├─ Razorpay signature verification
   ├─ Twilio webhook validation (when added)
   └─ Credentials never exposed in frontend
```

---

## Conclusion

This architecture provides:

✅ **Scalability** - Stateless API, can scale horizontally
✅ **Security** - Multi-layer protection, proper auth/authz
✅ **Maintainability** - Clear separation of concerns
✅ **Reliability** - Error handling at all levels
✅ **Performance** - Indexed queries, efficient state management
✅ **Multi-Tenancy** - Complete data isolation per restaurant

The system is production-ready and can handle thousands of concurrent users across multiple restaurant tenants!
