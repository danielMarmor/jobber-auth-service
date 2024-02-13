import { Request, Response } from "express";
import { loginSchema } from "../schemes/signin";
import { BadRequestError, IAuthDocument, IEmailMessageDetails, isEmail } from "@danielmarmor/jobber-shared";
import { getUserByEmail, getUserByPasswordToken, getUserByUsername, signToken, updatePassword, updatePasswordNumber } from "../services/auth.service";
import { comparePassword, hashPassword } from "../models/auth.schema";
import { StatusCodes } from "http-status-codes";
import { changePasswordSchema, emailSchema, passwordSchema } from "@auth/schemes/password";
import crypto from 'crypto';
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { config } from "@auth/config";

export const forgotPassword = async (req: Request, res: Response) => {
    //VALIDATE
    const { error } = await Promise.resolve(emailSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError("invalid credentials", "auth forgotPassword validate() method");
    }
    const { email } = req.body;
    //GET USER
    const existUser = await getUserByEmail(email);
    if (!existUser) {
        throw new BadRequestError("invalid credentials", "auth forgotPassword getUserByEmail() method");
    }
    //GENERATE PASSWORD TOKEN
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharachters: string = randomBytes.toString('hex');
    //CREATE TOKEN EXPIRATION TIME
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);
    //UPDATE USER  WITH PASS TOEKN
    await updatePasswordNumber(existUser.id!, randomCharachters, expireTime);
    //SEND VERIFICATION EMAIL
    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharachters}`;

    const messageDetails: IEmailMessageDetails = {
        receiverEmail: existUser.email!,
        username: existUser.username,
        resetLink: resetLink,
        template: 'forgotPassword'

    }
    publishDirectMessage(
        authChannel,
        'jobber-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'forgot passord email message is sent to notifcation service'
    )
    //RESPONSE
    res.status(StatusCodes.OK).json("password reset email is sent");

}

export const resetPassword = async (req: Request, res: Response) => {
    //VALIDATE
    const { error } = await Promise.resolve(passwordSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError("invalid credentials", "auth resetPassword validate() method");
    }
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    //GET USER BY TOKEN
    const existUser: IAuthDocument = await getUserByPasswordToken(token);
    if (!existUser) {
        throw new BadRequestError("invalid token - reset password user not found!", "auth resetPassword getUserByPasswordToken() method");
    }
    //CHECK PASSWORDS
    if (password !== comparePassword) {
        throw new BadRequestError("password don't match!", "auth resetPassword compare passwords method()");
    }
    //HASH
    const hashedPassword = await hashPassword(password);
    //UPDATE PASSWORD
    await updatePassword(existUser.id!, hashedPassword);
    //SEND VERIFICATION MAIL
    const messageDetails: IEmailMessageDetails = {
        username: existUser.username,
        template: 'resetPasswordSuccess'

    }
    publishDirectMessage(
        authChannel,
        'jobber-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'password reset succecfully message is sent to notifcation service'
    );
    res.status(StatusCodes.OK).json("password reset succecfully sent by email");


}

export const changePassword = async (req: Request, res: Response) => {
    //VALIDATE
    const { error } = await Promise.resolve(changePasswordSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError("invalid credentials", "auth changePassword validate() method");
    }
    const { currentPassword, newPassword } = req.body;
    const { token } = req.params;

    //CHECK PASSWORDS
    if (currentPassword === newPassword) {
        throw new BadRequestError("passwords identical!", "auth changePassword compare passwords method()");
    }
    //GET USER BY REQ.CURRENTUSER
    const username = req.currentUser?.username!;
    const existUser: IAuthDocument = await getUserByUsername(username);
    if (!existUser) {
        throw new BadRequestError("invalid usename - user not found!", "auth changePassword getUserByUsername() method");
    }
    //HASH
    const hashedPassword = await hashPassword(newPassword);
    //UPDATE PASSWORD
    await updatePassword(existUser.id!, hashedPassword);
    //SEND VERIFICATION MAIL
    const messageDetails: IEmailMessageDetails = {
        username: existUser.username,
        template: 'resetPasswordSuccess'

    }
    publishDirectMessage(
        authChannel,
        'jobber-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'password changed succecfully message is sent to notifcation service'
    );
    res.status(StatusCodes.OK).json("password change succecfully sent by email");


}