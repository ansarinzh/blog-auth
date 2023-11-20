const fs = require("fs");
const winston = require('winston');
const { logger, logLevels } = require('../config/logger');


//Function to capture the file & line number before logging.
const createLog = (type, message) => {
    const orig = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();
    Error.captureStackTrace(err, global);
    const callee = err.stack[1];
    Error.prepareStackTrace = orig;
    const callerFile = callee.getFileName().split(/\\(?=[^\\]+$)/); //split from the last "/"
    let filename = `${callerFile[1]}:${callee.getLineNumber()}:`;
    message = filename + message;
    if (logLevels.levels[type] < process.env.LOG_LEVEL) {
        if (process.env.BLOG_ENV === 'PROD') {
            logger.log(type, message, { timestamp: new Date().toISOString() });
            // if (type === 'fatal' || type === 'error') {
            //     sendCriticalNotification(`[${new Date().toISOString()}] ${message}`)
            // }

        }
    }
}


module.exports = { createLog }