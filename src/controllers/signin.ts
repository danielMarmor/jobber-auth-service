import { Request, Response } from "express";
import { loginSchema } from "../schemes/signin";
import { BadRequestError, IAuthDocument, isEmail } from "@danielmarmor/jobber-shared";
import { getUserByEmail, getUserByUsername, signToken } from "../services/auth.service";
import { comparePassword } from "../models/auth.schema";
import { StatusCodes } from "http-status-codes";
import { omit } from "lodash";

export const read = async (req: Request, res: Response) => {
    //SCHEMA
    const { error } = await Promise.resolve(loginSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError(error.details[0].message, "signin read() method");
    }
    const { username, email, password } = req.body;
    //GET USER
    const isValidEmail = isEmail(email);
    const authUser: IAuthDocument = isValidEmail ? await getUserByEmail(email) : await getUserByUsername(username);
    if (!authUser) {
        throw new BadRequestError("invalid credentials", "signin read() method");
    }
    //CHECK PASSWORD
    const isPassword = comparePassword(password, authUser.password!);
    if (!isPassword) {
        throw new BadRequestError("invalid credentials", "signin read() method");
    }
    //SIGN TOKEN
    const jwtToken = signToken(authUser.id!, authUser.email!, authUser.username!);
    //OMMIT PASSWROD
    const userData = omit(authUser, ["password"])
   
    res.status(StatusCodes.CREATED).json({ message: "user login succesfully", user: userData, token: jwtToken });
}   