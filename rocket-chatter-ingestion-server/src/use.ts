import { Codebase } from "./process/prepare/codebase"
import { FileProcessor } from "./process/prepare/fileProcessor"

const DIR = [
	//
	"./Rocket.Chat", // clone the repo first
	"./florence-backend",
	"long",
	"rippledb",
	"./project",
]

async function main() {
	const startTime = Date.now()
	{
		/**
		 * Keep it 1 for low memory usage and hence no crashes.
		 * Higher batch size might cause the program to get stuck and eventually crash.
		 */
		const codebase = new Codebase(DIR.at(-1)!, new FileProcessor(), 1)
		codebase.process()

		// await prepareNodesEmbeddings("data", batchSize)
		// await insertDataIntoDB(batchSize)
		// await insertStyleguides()
	}
	const endTime = Date.now()

	console.log("🕒 Done in", (endTime - startTime) / 1000, "seconds")
}

main()
