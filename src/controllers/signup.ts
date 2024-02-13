import { signupSchema } from "@auth/schemes/signup";
import { createAuthUser, getUserByUsernameOrEmail, signToken } from "@auth/services/auth.service";
import { BadRequestError, IAuthDocument, IEmailMessageDetails, upload } from "@danielmarmor/jobber-shared";
import { Request, Response } from "express";
import { v4 as uuidV4 } from 'uuid';
import cloudinary, { UploadApiResponse } from "cloudinary";
import crypto from 'crypto'
import { config } from "@auth/config";
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { StatusCodes } from "http-status-codes";

export const create = async (req: Request, res: Response) => {
    //VALIDATE
    const { error } = await Promise.resolve(signupSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError("Invalid credentials", "create() method");
    }
    const { username, password, email, country, profilePicture } = req.body;
    //CHECK IF EMAIL/USERNAME EXISTS
    const checkIfUserExists = await getUserByUsernameOrEmail(email, username);
    if (checkIfUserExists) {
        throw new BadRequestError("Invalid credentials", "create getUserByUsernameOrEmail() method");
    }
    //CREATE PUBLIC PROFILE ID
    const publicProfileId = uuidV4();
    let uploadResponse: UploadApiResponse;
    try {
        uploadResponse = await cloudinary.v2.uploader.upload(profilePicture, {
            public_id: publicProfileId,
            overwrite: true,
            invalidate: true
        });
    }
    catch (error) {
        console.log(error);
        throw error;
    }
    if (!uploadResponse.public_id) {
        throw new BadRequestError("File upload error. try again", "create upload() method");
    }
    //GENERATE RANDOM VERIFT EMAIL TOKEN
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharachters: string = randomBytes.toString('hex');
    //AUTH DOC
    const authDoc: IAuthDocument = {
        username: username,
        email: email,
        password: password,
        country: country,
        profilePicture: uploadResponse!.secure_url,
        profilePublicId: uploadResponse!.public_id,
        emailVerificationToken: randomCharachters,
    } as IAuthDocument;
    //ADD TO MYSQL DB
    const result = await createAuthUser(authDoc);
    const verificationLink = `${config.CLIENT_URL}/confirm_email/v_token=${authDoc.emailVerificationToken}`
    const messageDetails: IEmailMessageDetails = {
        receiverEmail: result.email,
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
    //CREAE JWT TOKEN
    const jwtToken = signToken(result.id!, result.email!, result.username!);
    res.status(StatusCodes.CREATED).json({ message: 'User created succesfuly', user: result, token: jwtToken })
}