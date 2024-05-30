import { Request, Response } from "express"

import { insertStyleguides } from "../core/styleguides"
import { insertDataIntoDB } from "../ingestion/ingest"
import { prepareCodebase, prepareNodesEmbeddings } from "../ingestion/prepare"

const DIR = ["./project"]

export async function ingestRoute(_: Request, res: Response) {
	const startTime = Date.now()
	{
		const batchSize = 250
		await prepareCodebase(DIR.at(-1)!, batchSize)
		await prepareNodesEmbeddings("data", batchSize)

		await insertDataIntoDB(batchSize)
		await insertStyleguides()
	}
	const endTime = Date.now()

	res.status(200).send({
		status: 200,
		message: "INGESTION SUCCESSFUL",
		timeTaken: `${(endTime - startTime) / 1000}s`,
	})
}
