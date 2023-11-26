const passport = require('passport');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const Logcontroller = require('./logController')
const DatabaseCon = require('../database/connection');


const login = async (req, res, next) => {
    try {
        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
        Logcontroller.createLog('info', "success")

    } catch (error) {
        console.log('error >>>', error);
        return res.status(400).json({ message: 'Something went wrong while google login authentication' })
    }
}


const loginCallback = async (req, res) => {
    const email = req.user.emails[0].value;
    console.log('req.user', req.user);
    const db = DatabaseCon.getTenantDB()


    console.log('req', req);
    const isUserExist = await db.collection("users").findOne({ email: email }, {})
    console.log('result', isUserExist);
    if (!isUserExist) {
        Logcontroller.createLog('info', `User with email: ${email} does not exist... creating new record for ${email}`)
        let Values = {
            email: email,
            name: req.user.displayName,
            username: email,
            picture: req.user.photos[0].value,
            joinedAt: new Date()
        }
        const user = await db.collection("users").insertOne(Values)

        var token = jwt.sign({
            userId: user.insertedId,
            email: email,
            name: req.user.displayName,
            username: email
        }, process.env.JWT_SECRET_KEY, { expiresIn: '2d' });

        console.log('token in registration', token);
        return res.status(200).json({ message: 'Success', token: token })
        // return res.redirect(`${req.payload.hostUrl}/token?t=${token}`)

    } else {
        var token = jwt.sign({
            userId: isUserExist._id,
            email: email,
            name: req.user.displayName,
            username: email
        }, process.env.JWT_SECRET_KEY, { expiresIn: '2d' });
        console.log('token in login', token);
        // return res.status(200).json({ message: 'Success', token: token })
        return res.redirect(`http://localhost:3000/token?t=${token}`)
    }
}

module.exports = {
    login, loginCallback
}