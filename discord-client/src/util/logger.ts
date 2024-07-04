import winston from "winston";

const format = winston.format((info) => {
  return {
    ...info,
    severity: info.level,
  };
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        format(),
        winston.format.json()
      ),
    }),
  ],
});

export default logger;