const express = require('express');
const session = require('express-session');

const PORT = process.env.PORT || 5000;
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require('./db.js')

var RedisStore = require('connect-redis')(session);
var Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL);

console.log(process.env.REDIS_URL)

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
        session({
            store: new RedisStore({client: redisClient}),
            secret: '00000000000000',  // hidden for privacy
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 30
            }
        })
    );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.set('view engine', 'ejs')
app.use(express.static('public'))
// app.use(bodyParser.urlencoded({extended: false}));

const homeRoute = require('./routes/home')
app.use('/', homeRoute);

const loginRoute = require('./routes/login')
app.use('/login', loginRoute);

const registerRoute = require('./routes/register')
app.use('/register', registerRoute);

const discordRoute = require('./routes/discord')
app.use('/discord', discordRoute);

const aboutusRoute = require('./routes/aboutus')
app.use('/aboutus', aboutusRoute);

const faqRoute = require('./routes/faq')
app.use('/faq', faqRoute);

const contactRoute = require('./routes/contact')
app.use('/contact', contactRoute);

const dashboardRoute = require('./routes/dashboard')
app.use('/dashboard', dashboardRoute);

const settingsRoute = require('./routes/settings')
app.use('/settings', settingsRoute);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
