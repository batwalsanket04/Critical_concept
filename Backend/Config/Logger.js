const winston=require('winston')
const logger=winston.createLogger({
    level:"info",

    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),

    transports:[
        // store  all logs
        new winston.transports.File({

            filename:"Logs/combined.log"

        }),

          // Store only errors

        new winston.transports.File({

            filename:"Logs/error.log",

            level:"error"

        }),

         // Show in terminal

        new winston.transports.Console()
    ]
})

module.exports=logger;
