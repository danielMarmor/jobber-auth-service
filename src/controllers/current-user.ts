import { getUserByEmail, getUserById, updateVerifyEmailField } from "@auth/services/auth.service";
import { BadRequestError, IAuthDocument, IEmailMessageDetails } from "@danielmarmor/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { lowerCase } from "lodash";
import crypto from 'crypto';
import { config } from "@auth/config";
import { authChannel } from "@auth/server";
import { publishDirectMessage } from "@auth/queues/auth.producer";

export const read = async (req: Request, res: Response) => {
    let user = null;
    const existingUser: IAuthDocument = await getUserById(req.currentUser?.id!);
    if (Object.keys(existingUser).length) {
        user = existingUser;
    }
    res.status(StatusCodes.OK).json({ message: "Authenticated user", user: user })
}

export const resendEmail = async (req: Request, res: Response) => {
    const { email, userId } = req.body;
    const existingUser: IAuthDocument = await getUserByEmail(lowerCase(email));
    if (!existingUser) {
        throw new BadRequestError("Email is invalid", "Current User resendEmail() method error")
    }
    //GENERATE RANDOM VERIFT EMAIL TOKEN
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharachters: string = randomBytes.toString('hex');
    const verificationLink = `${config.CLIENT_URL}/confirm_email/v_token=${randomCharachters}`
    await updateVerifyEmailField(parseInt(userId), randomCharachters, 0);
    const messageDetails: IEmailMessageDetails = {
        receiverEmail: email,
        verifyLink: verificationLink,
        template: 'verifyEmail'
    }
    await publishDirectMessage(
        authChannel,
        'jobber-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Verify email message has been sent to auth notification service'
    );
    const updatedUser: IAuthDocument = await getUserById(parseInt(userId));
    res.status(StatusCodes.CREATED).json({ message: "email verification sent", user: updatedUser })
}