import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, printf } = format;

const logFormat = printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`;
});

const commonFormat = combine(
      label({ label: "Learnova Server Services" }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      logFormat
);

const Logger = createLogger({
      level: "info",
      format: commonFormat,
      transports: [
            new transports.Console(),
            new transports.File({
                  filename: "logs/info.log",
                  level: "info",
            })
      ],
});

export default Logger;