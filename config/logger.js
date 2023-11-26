const winston = require('winston');


const myFormatter = winston.format((info) => {
    const { workspace, method, url, timestamp, userid, level, message } = info;
    // if (workspace) {
    info.message = `[${timestamp}][${userid}][${level}][${method}]:${url}|${message} `;
    // } else {
    //     info.message = `[${timestamp}][${level}]:|${message} `;
    // }

    info.level = "";
    delete info.ipaddress; delete info.os;
    delete info.timestamp; delete info.workspace; delete info.method;
    delete info.url; delete info.userid
    return info;
})();


// define log levels
const logLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        config: 3,
        info: 4,
        trace: 5,
        debug: 6,
    }
};




// Define the logger configuration
const logger = winston.createLogger({
    format: winston.format.combine(
        myFormatter,
        winston.format.simple(),
    ),
    // format: winston.format.simple(), // Using the simplest format
    levels: logLevels.levels,
    transports: [
        // new winston.transports.Console(), // Log to the console

        // Log to a file with max level debug
        // if set to info then all logs before level 4 will be logged in to the file
        new winston.transports.File({ filename: 'logs/combined.log', level: 'debug' })
    ],
});




module.exports = { logger, logLevels }