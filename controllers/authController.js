const passport = require('passport');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const Logcontroller = require('./logController')
const DatabaseCon = require('../database/connection');
const Utility = require('../utils/utility');


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
    const db = DatabaseCon.getTenantDB()

    const isUserExist = await db.collection("users").findOne({ email: email }, {})

    // if the user is trying to login for the first time
    // then create the new entry into the db
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


        // generate JWT token with custom data embedded in it
        var token = jwt.sign({
            userId: user.insertedId,
            email: email,
            name: req.user.displayName,
            username: email
        }, process.env.JWT_SECRET_KEY, { expiresIn: '2d' });

        return res.status(200).json({ message: 'Success', token: token })
        // return res.redirect(`${req.payload.hostUrl}/token?t=${token}`)

    } else {

        // if user found in the our database then just generate the token
        var token = jwt.sign({
            userId: isUserExist._id,
            email: email,
            name: req.user.displayName,
            username: email
        }, process.env.JWT_SECRET_KEY, { expiresIn: '2d' });
        // return res.status(200).json({ message: 'Success', token: token })
        return res.redirect(`http://localhost:3000/token?t=${token}`)
    }
}

const loginViaCredentials = async (req, res) => {

    let { email, password } = req.body;
    const db = DatabaseCon.getTenantDB()

    if (!email) {
        Logcontroller.createLog('error', 'Email is empty')
        return res.status(400).json({ message: 'Invalid Login Credentials' })
    }

    if (!password) {
        Logcontroller.createLog('error', 'Password is empty')
        return res.status(400).json({ message: 'Invalid Login Credentials' })
    }

    // validate the format of the email with regex
    if (!(Utility.validateEmail(email))) {
        Logcontroller.createLog('error', `Email: ${email} format is incorrect`)
        return res.status(400).json({ message: `Email: ${email} format is incorrect` })
    }

    const user = await db.collection("users").findOne({ email: { $in: [email.toLowerCase(), email] } })
    if (!user) {
        Logcontroller.createLog('error', `User with email: ${email} not found`)
        return res.status(404).json({ message: `User with email: ${email} not found` })
    }

    // get the user info from the db then compare the password with hashed pass
    if (user && user.passwordHash) {
        const validCredentials = await Utility.BcryptCompare(password, user.passwordHash);
        if (validCredentials) {
            var token = jwt.sign({
                userId: user._id,
                email: email,
                name: user.name,
                username: user.username
            }, process.env.JWT_SECRET_KEY, { expiresIn: '2d' });
            Logcontroller.createLog('info', `Login Successful with email: ${email}`)
            return res.status(200).json({ token, userId: user._id })
        } else {
            Logcontroller.createLog('warn', `Invalid User Credentials for email:${email}`)
            return res.status(401).json({ message: "Invalid Credentials!" })
        }
    } else {
        Logcontroller.createLog('warn', `user doesnot exist with email:${email}`);
        return res.status(404).json({ message: "User not found!" });
    }

}

const registerUser = async (req, res) => {
    let { email, password, username, name } = req.body;

    if (!email) {
        Logcontroller.createLog('error', 'Email is empty')
        return res.status(400).json({ message: 'Email must not be empty' })
    }

    if (!password) {
        Logcontroller.createLog('error', 'Password is empty')
        return res.status(400).json({ message: 'Password must not be empty' })
    }

    if (!username) {
        Logcontroller.createLog('error', 'Password is empty')
        return res.status(400).json({ message: 'Username must not be empty' })
    }

    const db = DatabaseCon.getTenantDB()


    const existence_query = { $or: [{ email: email }, { username: username }] }
    const userExist = await db.collection("users").findOne(existence_query, {})
    if (userExist) {
        Logcontroller.createLog('error', `User already registered Email:${email}`)
        return res.status(400).json({ message: 'User already registered' })
    }


    const encryptedPass = Utility.EncryptPassword(password)
    if (!encryptedPass) {
        Logcontroller.createLog('error', `Unable to register user Password failed to encrypt`)
        return res.status(400).json({ message: 'Unable to register user' })
    }

    let userData = {
        name: name,
        username,
        email,
        passwordHash: encryptedPass,
        picture: '',
        joinedAt: new Date()
    }


    const user = await db.collection("users").insertOne(userData)
    if (!user) {
        Logcontroller.createLog('error', 'Unable to register user')
        return res.status(400).json({ message: 'Unable to register user' })
    }
    return res.status(200).json({ message: 'Successfully registered' })
}

module.exports = {
    login, loginCallback, loginViaCredentials, registerUser
}