import { getUserById, getUserByVerificationToken, updateVerifyEmailField } from "@auth/services/auth.service";
import { BadRequestError, IAuthDocument } from "@danielmarmor/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const VERIFIED: number = 1;
const EMPTY = "";

export const update = async (req: Request, res: Response) :Promise<void>=> {
    const { token } = req.body;
    //TOKEN
    if (!token) {
        throw new BadRequestError("invalid credential", "verif-email update() method");
    }
    //USER BY TOKEN
    const authUser: IAuthDocument = await getUserByVerificationToken(token);
    if (!authUser) {
        throw new BadRequestError("verification token not exists of already in use", "verif-email update() method");
    }
    //UPDATE VERIFIED, DELETE VERIED TOKEN
    await updateVerifyEmailField(authUser.id!, EMPTY, VERIFIED);
    //FETCH VERIFIED USER
    const updatedUser: IAuthDocument = await getUserById(authUser.id!);

    res.status(StatusCodes.OK).json({ message: "Email verified succesfully", user: updatedUser })


}