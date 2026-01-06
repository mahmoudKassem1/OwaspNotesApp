const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss'); 
const hpp = require('hpp');
const connectDB = require('./config/db.js');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const noteRoutes = require('./routes/noteRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();

// --- 1. CRITICAL FIX FOR RENDER DEPLOYMENT ---
// This tells Express to trust the "X-Forwarded-For" header from Render.
// Without this, the Rate Limiter sees all users as ONE IP and blocks everyone.
app.set('trust proxy', 1); 

// --- 2. CORS CONFIGURATION ---
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://owasp-notes-app.vercel.app", 
    "https://owaspnotesapp.vercel.app"      
  ],
  credentials: true
};
app.use(cors(corsOptions));

// Set security headers
app.use(helmet());

// --- 3. IMPROVED RATE LIMITING ---

// A. Strict Limiter for Auth (Login/Register)
// 20 attempts per 15 minutes - stops brute force password guessing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: { message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// B. General Limiter for API Routes (Notes)
// 100 requests per 10 minutes - allows normal usage
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100,
  message: { message: "Too many requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// --- MANUAL SANITIZATION MIDDLEWARE ---
app.use((req, res, next) => {
  // 1. Sanitize NoSQL Injection (Body & Params only)
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);

  // 2. Sanitize XSS (Body only - recursive function)
  if (req.body) {
    const cleanXSS = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = xss(obj[key]); // Clean string fields
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          cleanXSS(obj[key]); // Recurse into nested objects
        }
      }
    };
    cleanXSS(req.body);
  }
  
  next();
});

// Prevent http param pollution
app.use(hpp());

// --- 4. APPLY ROUTES WITH SPECIFIC LIMITERS ---

// Apply strict limit ONLY to auth routes
app.use('/api/auth', authLimiter, authRoutes);

// Apply general limit to note routes (and any other future API routes)
app.use('/api/notes', apiLimiter, noteRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});