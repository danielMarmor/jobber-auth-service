import { getUserByUsername, signToken } from "@auth/services/auth.service";
import { BadRequestError } from "@danielmarmor/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const token = async (req: Request, res: Response) => {
    const existingUser = await getUserByUsername(req.params.username);
    if (!existingUser) {
        throw new BadRequestError("invalid credentials", "auth token getUserByUsername() method");
    }
    const userJwt: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!)
    res.status(StatusCodes.OK).json({ message: "token refreshed", user: existingUser, token: userJwt })
}