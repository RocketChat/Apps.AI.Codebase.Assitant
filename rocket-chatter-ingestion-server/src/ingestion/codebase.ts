import { mkdirSync, rmSync, writeFileSync } from "fs"
import { Project } from "ts-morph"
import { DBNode } from "../core/dbNode"
import { SourceFile } from "./sourceFile"
import { ISourceFile } from "./sourceFile.types"

export class Codebase {
	public _path: string
	private _dataPath: string
	private _batchSize: number
	private _files: ISourceFile[] = []
	private _batches: number[][] = []

	constructor(path: string, batchSize = 50) {
		// If path ends with any number of /, remove them
		if (path.endsWith("/")) path = path.replace(/\/+$/, "")

		this._path = path
		this._dataPath = ""
		this._batchSize = batchSize

		this.initializeDataDirectory()
		this.prepareFilesMetadata()
		this.makeFilesBatches()
	}

	public get path() {
		return this._path
	}

	public get batchSize() {
		return this._batchSize
	}

	private makePath(path: string): string {
		return `${this._path}/${path}`
	}

	private initializeDataDirectory(removeExisting = false): void {
		this._dataPath = "data"

		const path = this.makePath(this._dataPath)
		if (removeExisting) rmSync(path, { recursive: true })
		mkdirSync(path)
	}

	private prepareFilesMetadata() {
		const project = new Project()
		project.addSourceFilesAtPaths(this.makePath("**/*.ts")) // glob patterns

		this._files = project
			.getSourceFiles()
			.map((x) => SourceFile.fromTSMorphSourceFile(x))
	}

	private makeFilesBatches() {
		const batches: number[][] = []
		for (let i = 0; i < this._files.length; i += this._batchSize)
			batches.push([i, i + this._batchSize])

		this._batches = batches
	}

	private writeNodesRangeToFile(
		nodes: Record<string, DBNode>,
		fileName: string,
		start: number,
		end: number
	) {
		const entries = Object.entries(nodes).slice(start, end)
		if (entries.length === 0) return 0
		const batch = Object.fromEntries(entries)
		writeFileSync(
			this.makePath(`${this._dataPath}/${fileName}`),
			JSON.stringify(batch, null, 2)
		)

		return entries.length
	}

	/**
	 * The main function to process the files in the codebase. The function works in the following
	 * steps:
	 *
	 * 1. Process the files in parallel of size `batchSize` and gather all the nodes in the `nodes` object.
	 * 2. After gathering all the nodes from the files, it's not guranteed that they can't be more than
	 *    `batchSize` nodes. So, we need to split the nodes into batches of `batchSize` nodes separately.
	 * 3. Repeat Step 1 and Step 2 for all the files.
	 *
	 * @returns Promise<void>
	 */
	async process(): Promise<void> {
		console.log("🕒 Preparing Nodes")

		let nodesProcessed = 0
		for (const [index, batch] of this._batches.entries()) {
			const [startFrom, endAt] = batch
			const files = this._files.slice(startFrom, endAt)

			console.log(`🕒 Processing ${startFrom}-${endAt} files`)
			{
				let nodes: Record<string, DBNode> = {}

				/* Step 1 */
				try {
					const jobs = files.map((x) => x.process(nodes))
					await Promise.all(jobs)
				} catch {
					console.error(`Error in processing ${startFrom}-${endAt} files`)
				}

				/* Step 2 */
				for (let i = 0; i < Object.keys(nodes).length; i += this._batchSize) {
					const [start, end] = [i, i + this._batchSize]
					this.writeNodesRangeToFile(nodes, `batch-${index}.json`, start, end)
				}

				nodesProcessed += Object.keys(nodes).length
			}
			console.log(`✅ Processed ${startFrom}-${endAt} files\n`)
		}

		console.log(`✅ Prepared ${nodesProcessed} nodes`)
	}

	processFilesBatch(files: SourceFile[]) {}
}
