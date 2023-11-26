const mongoose = require('mongoose')
const Logcontroller = require('../controllers/logController')

var tenantMap = new Map();
var db

const connectDB = async () => {
    await mongoose.connect(
        process.env.MONGODB_URI)
        .then(() => {
            console.log("Connected to the Database. Yayzow!");
            Logcontroller.createLog('info', `Database Connected successfully!!! @db_connect/connectDB`)
        })
        .catch(err => {
            Logcontroller.createLog('fatal', `Database Connection Error @db_connect/connectDB Error:- ${err}`);
            console.log(err);
        });
    db = mongoose.connection
    db.on('error', (err) => {
        console.log(err);
        Logcontroller.createLog('fatal', `Database Connection Error @db_connect/connectDB Error:- ${err}`);
    })
    db.once('open', () => {
        Logcontroller.createLog('info', `Mongoose Connection with db Connected successfully!!! @db_connect/connectDB`);
        console.log('mongoose connection :- Connected');
    })
}


// Description:- this function is for fetching the DB connection based on subdomain.
const getTenantDB = () => {
    let database = 'stackoverflowclone'
    if (tenantMap.has(database)) {
        const db = tenantMap.get(database);
        return db;
    } else {
        try {
            const db2 = db.useDb(database, { useCache: true });
            tenantMap.set(database, db2);
            Logcontroller.createLog('info', `New db connection stored in map for ${database} !!!`);
            return db2;
        }
        catch (error) {
            Logcontroller.createLog('fatal', `Database Connection Error @db_connect/connectDB Error:- ${error}`);
        }
    }
}

module.exports = {
    getTenantDB, connectDB
}