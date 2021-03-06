const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const app = express();

app.enable('trust proxy');

//1)Global Middleware
//Set security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//Set limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this IP, please try again in an hour!',
});
app.use('/api/users', limiter);//лимитируем только то что надо
app.use('/api/journal', limiter);
app.use('/api/archive', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against noSQL query injection
app.use(mongoSanitize());

//Data ssanitizationagains XSS
app.use(xss());

//Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingAverage',
//       'ratingQuantity',
//       'difficulty',
//       'maxGroupSize',
//       'price',
//     ],
//   })
// );

app.use(compression());
const corsoptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsoptions));
app.options('*', cors(corsoptions));

//Static files from public directory
//app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const deviceNet = require('./netHandler/netHandler');
const netHandler = new deviceNet('192.168.100.155', 5000);
netHandler.init();

//3) Routes
const userRouter = require(`${__dirname}/routes/usersRoutes.js`);
const deviceRouterCreater = require(`${__dirname}/routes/deviceRouterCreater.js`);
const journalRouter = require(`${__dirname}/routes/journalRoutes.js`);
const archiveRouter = require(`${__dirname}/routes/archiveRoutes.js`);

app.use('/api/users', userRouter);
app.use('/api/pump', deviceRouterCreater('pump', netHandler));
app.use('/api/flow0', deviceRouterCreater('flow1', netHandler));
app.use('/api/flow1', deviceRouterCreater('flow2', netHandler));
app.use('/api/drain', deviceRouterCreater('drain', netHandler));
app.use('/api/clock', deviceRouterCreater('clock', netHandler));
app.use('/api/light', deviceRouterCreater('light', netHandler));
app.use('/api/ventilation', deviceRouterCreater('ventilation', netHandler));
app.use('/api/humidity', deviceRouterCreater('humidity', netHandler));
app.use('/api/journal', journalRouter);
app.use('/api/archive', archiveRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

//4) START SERVER
module.exports = app;
