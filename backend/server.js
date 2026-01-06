const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss'); // <--- USING CORE LIBRARY DIRECTLY
const hpp = require('hpp');
const connectDB = require('./config/DB');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const noteRoutes = require('./routes/noteRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


// Set security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// --- MANUAL SANITIZATION MIDDLEWARE (Prevents "req.query" Crash) ---

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
// ------------------------------------------------------------------

// Prevent http param pollution
app.use(hpp());

// Mount routers
app.use('/api/notes', noteRoutes);
app.use('/api/auth', authRoutes);

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