const express = require('express');
const session = require('express-session');
const passport = require('passport');
require("dotenv").config();
require("./core/googleAuth");
const dbCon = require('./database/connection')


const app = express();

app.use(express.json({ limit: "60mb" }));
app.use(express.urlencoded({ limit: "60mb", extended: true }));

// Set up session middleware
app.use(session({
    secret: 'my-secret-blog-auth-service',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./router'));
const dbConn = async () => await dbCon.connectDB();
dbConn()
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});