const express = require('express');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const morgan = require('morgan');
const connectDB = require('./server/models/db');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const { default: mongoose } = require('mongoose');
const process = require('process');

// dotenv.config( {path: './config/config.env'} );

connectDB();

const app = express();

// static files
app.use(express.urlencoded( { extended: true } ));
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));

// set templating engine
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// session
app.use(session({
    secret: 'aiaShoppingCart',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    cookie: { maxAge: 180 * 60 * 1000 }
}))

// flash messages middleware
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})

// routes
const routes = require('./server/routes/shopRoutes.js');
app.use('/', routes);
app.use('/checkout', routes);
app.use('/add-to-cart', routes);
app.use('/remove', routes);
app.use('/remove-all', routes);
app.use('/buy', routes);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(flash());

app.use(function(req, res, next){
    res.locals.session = req.session;
    next();
})

// logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// listen on port 3000
const port = process.env.PORT || 8080;
app.listen(
    port, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
    }
);