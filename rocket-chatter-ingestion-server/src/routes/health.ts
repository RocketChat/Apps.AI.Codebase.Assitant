import { Request, Response } from "express"

export async function healthRoute(_: Request, res: Response) {
	res.status(200).send("OK")
}
