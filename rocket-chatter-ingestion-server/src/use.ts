import { Codebase } from "./process/prepare/codebase"
import { FileProcessor } from "./process/prepare/processor/file"

async function main() {
	const codebase = new Codebase("./project", new FileProcessor())
	codebase.process()
}

main()
