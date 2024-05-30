import { writeFileSync } from "fs"

export function writeText(file: string, data: string) {
	writeFileSync(`${file}.data.json`, data)
}

export function writeJSON(file: string, data: any) {
	writeText(file, JSON.stringify(data, null, 2))
}
