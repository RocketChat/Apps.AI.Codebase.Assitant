import { Codebase } from "./process/prepare/codebase"
import { FileProcessor } from "./process/prepare/processor/file"

async function main() {
	const codebase = new Codebase("./project", new FileProcessor(), 1)
	await codebase.process()
	// await codebase.embed()

	// insertDataIntoDB(codebase.embeddingsDirPath, 1)
}

main()
