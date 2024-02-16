import { createAuthUser, getUserByUsernameOrEmail } from "@auth/services/auth.service";
import { BadRequestError, IAuthDocument, firstLetterUppercase } from "@danielmarmor/jobber-shared";
import { faker } from "@faker-js/faker";
import { Request, Response } from "express";
import { generateUsername } from "unique-username-generator";
import crypto from 'crypto';
import { sample } from "lodash";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidV4 } from 'uuid';

export const seed = async (req: Request, res: Response) => {
    const { count } = req.params;
    const usernames: string[] = [];
    for (let i = 0; i < parseInt(count, 10); i++) {
        const username: string = generateUsername('', 0, 12);
        usernames.push(firstLetterUppercase(username));
}

    for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i];
        const email = faker.internet.email();
        const password = "querty";
        const country = faker.location.country();
        const profilePicture = faker.image.urlPicsumPhotos();

        const checkIfUserExists = await getUserByUsernameOrEmail(email, username);
        if (checkIfUserExists) {
            throw new BadRequestError("Invalid credentials", "create seed() method");
        }
        const publicProfileId = uuidV4();
        //GENERATE RANDOM VERIFT EMAIL TOKEN
        const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
        const randomCharachters: string = randomBytes.toString('hex');
        //AUTH DOC
        const authDoc: IAuthDocument = {
            username: username,
            email: email,
            password: password,
            country: country,
            profilePicture: profilePicture,
            profilePublicId: publicProfileId,
            emailVerificationToken: randomCharachters,
            emailVerified: sample([0, 1])
        } as IAuthDocument;

        await createAuthUser(authDoc);

    }
    res.status(StatusCodes.OK).json({ message: 'seed user created succesfuly' });
}


