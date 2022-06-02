import { ethers } from "ethers";

export async function fetchWithdrawalEvents(peg: ethers.Contract) {
	const allEvents = await peg.queryFilter({});
	return allEvents.filter((event) => event.event === "Withdraw");
}
