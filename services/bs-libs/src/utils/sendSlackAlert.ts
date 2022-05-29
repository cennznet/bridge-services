import { getLogger } from "@bs-libs/utils/getLogger";
import { IncomingWebhook } from "@slack/webhook";
import { SLACK_SECRET } from "@bs-libs/constants";

const logger = getLogger("SlackAlert");

const webhook: IncomingWebhook = new IncomingWebhook(
	`https://hooks.slack.com/services/${SLACK_SECRET}`
);

export async function sendSlackAlert(message: string): Promise<void> {
	const response = await webhook.send({
		text: message,
	});
	logger.info(`Slack notification sent, response: ${JSON.stringify(response)}`);
}
