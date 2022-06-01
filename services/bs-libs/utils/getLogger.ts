import { createLogger, format, transports, Logger } from "winston";
import * as chalk from "chalk";

type LoggerService = "ClaimSubscriber" | "ClaimPublisher" | "SlackAlert";
const instances = {} as Record<LoggerService, Logger>;

const labels = {
	ClaimSubscriber: chalk.blue("ClaimSubscriber"),
	ClaimPublisher: chalk.green("ClaimPublisher"),
	SlackAlert: chalk.cyan("SlackAlert"),
};

export function getLogger(service: LoggerService): Logger {
	if (instances[service]) return instances[service];

	return (instances[service] = createLogger({
		level: "info",
		format: format.combine(
			format.label({
				label: labels[service],
				message: true,
			}),
			format.timestamp({
				format: "YYYY-MM-DD HH:mm:ss",
			}),
			format.errors({ stack: true }),
			format.splat(),
			format.json()
		),
		transports: [
			new transports.File({
				filename: `logs/app.log`,
				maxsize: 2048000, // 2 MB
				maxFiles: 10,
			}),

			new transports.Console({
				format: format.combine(
					format.colorize(),
					format.printf(({ level, message, timestamp }) => {
						return `${timestamp} ${level}: ${message}`;
					})
				),
			}),
		],
	}));
}
