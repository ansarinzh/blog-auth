const bcrypt = require('bcrypt')

const validateEmail = (email) => {
    let validEmail = false

    // eslint-disable-next-line
    var validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (validRegex.test(email)) {
        validEmail = true
    }
    return validEmail;
}


const BcryptCompare = async (password, value) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, value).then(result => {
            resolve(result);
        }).catch(err => {
            LogController.createLog('error', `Bcrypt Compare error for password comparison  ERROR:- ${err}`);
            reject(err);
        })
    })

}


const EncryptPassword = (password) => {
    try {
        const passwordHash = bcrypt.hashSync(password, 10);
        if (!passwordHash) {
            LogController.createLog('error', `password not encrypted `);
            return undefined
        }
        return passwordHash
    } catch (error) {
        LogController.createLog('error', `Password encryption error  Error:-${error}`);
        return undefined
    }
}

module.exports = {
    validateEmail, BcryptCompare, EncryptPassword
}