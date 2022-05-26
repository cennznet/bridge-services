import { getLogger } from "@/libs/utils";
import { IncomingWebhook } from "@slack/webhook";
import { SLACK_SECRET } from "@/libs/constants";

const logger = getLogger("RequestProcessor");

const webhook: IncomingWebhook = new IncomingWebhook(
	`https://hooks.slack.com/services/${SLACK_SECRET}`
);

export async function sendSlackAlert(message: string): Promise<void> {
	const response = await webhook.send({
		text: message,
	});
	logger.info(`Slack notification sent, response: ${JSON.stringify(response)}`);
}
