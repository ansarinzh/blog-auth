const passport = require('passport');
const Logcontroller = require('./logController')


const login = async (req, res, next) => {
    try {
        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
        Logcontroller.createLog('info', "success")
        Logcontroller.createLog('warn', "warning")
        Logcontroller.createLog('error', "this is errror")
        Logcontroller.createLog('fatal', "this is fatal")
        // passport.authenticate("google", { state: req.query.companyId, scope: ['profile', 'email'] })(req, res, next)
    } catch (error) {
        console.log('error >>>', error);
        return res.status(400).json({ message: 'Something went wrong while google login authentication' })
    }
}


const loginCallback = async (req, res) => {

}

module.exports = {
    login, loginCallback
}