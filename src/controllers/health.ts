import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const health = async (req: Request, res: Response) => {
    res.status(StatusCodes.OK).send("authentication service is healthy and OK");
}