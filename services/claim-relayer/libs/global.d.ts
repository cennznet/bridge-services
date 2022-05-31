import { Api } from "@cennznet/api";
import { MockProvider } from "ethereum-waffle";
import { Connection } from "amqplib";

declare global {
	function getCENNZApiForTest(): Api;

	function getEthersProviderForTest(): MockProvider;

	function getRabbitForTest(): Connection;

	function setupMongooseForTest(): void;
}
