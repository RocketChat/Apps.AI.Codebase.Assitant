export namespace Commons {
	let projectPath = ""

	export function setProjectPath(path: string) {
		projectPath = path
	}

	export function getProjectPath() {
		return projectPath
	}
}
