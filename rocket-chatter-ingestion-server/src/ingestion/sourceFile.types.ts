import { DBNode } from "../core/dbNode"

export interface ISourceFile {
	process(nodesRef: Record<string, DBNode>): Promise<void>
}
