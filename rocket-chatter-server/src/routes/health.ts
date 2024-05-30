import { Request, Response } from "express"

export async function healthRoute(_: Request, res: Response) {
	res.sendStatus(200)
}
