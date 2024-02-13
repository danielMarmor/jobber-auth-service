import { config } from "@auth/config";
import { sequelize } from "@auth/database";
import { AuthModel } from "@auth/models/auth.schema";
import { publishDirectMessage } from "@auth/queues/auth.producer";
import { authChannel } from "@auth/server";
import { IAuthBuyerMessageDetails, IAuthDocument, firstLetterUppercase } from "@danielmarmor/jobber-shared";
import { sign } from "jsonwebtoken";
import { omit, upperCase } from "lodash";
import { Model, Op } from "sequelize";



export const createAuthUser = async (authUser: IAuthDocument): Promise<IAuthDocument> => {
    const result = await AuthModel.create(authUser);
    const authDetailsMessage: IAuthBuyerMessageDetails = {
        username: result.dataValues.username,
        email: result.dataValues.email,
        profilePicture: result.dataValues.profilePicture,
        country: result.dataValues.country,
        createdAt: result.dataValues.createdAt,
    }
    await publishDirectMessage(
        authChannel,
        'jobber-buyer-update',
        'user-buyer',
        JSON.stringify(authDetailsMessage),
        'Buyer details sent to buyer-service'
    );
    const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument;
    return userData;
}
export const getUserById = async (authId: number): Promise<IAuthDocument> => {
    const user: Model = await AuthModel.findOne({
        where: { id: authId },
        attributes: {
            exclude: ['password']
        }
    }) as Model;
    return user?.dataValues;
}
export const getUserByUsernameOrEmail = async (email: string, username: string): Promise<IAuthDocument> => {
    const user: Model = await AuthModel.findOne({
        where: {
            [Op.or]: [{ username: firstLetterUppercase(username) }, { email: upperCase(email) }]
        },
    }) as Model;
    return user?.dataValues;
}

export const getUserByUsername = async (username: string): Promise<IAuthDocument> => {
    const user: Model = await AuthModel.findOne({
        where: { username: firstLetterUppercase(username) },
    }) as Model;
    return user?.dataValues;
}

export const getUserByEmail = async (email: string): Promise<IAuthDocument> => {
    const user: Model = await AuthModel.findOne({
        where: { email: upperCase(email) },
    }) as Model;
    return user?.dataValues;
}

export const getUserByVerificationToken = async (verificationToken: string): Promise<IAuthDocument> => {
    const user: Model = await AuthModel.findOne({
        where: { emailVerificationToken: verificationToken },
    }) as Model;
    return user?.dataValues;
}

export const getUserByPasswordToken = async (passwordToken: string): Promise<IAuthDocument> => {
    const user: Model = await AuthModel.findOne({
        where: {
            [Op.and]: [{ passwordResetToken: passwordToken }, { passwordResetExpires: { [Op.gt]: new Date() } }]
        },
    }) as Model;
    return user?.dataValues;
}

export const updateVerifyEmailField = async (authId: number, emailVerificationToken: string, emailVerified: number) => {
    await AuthModel.update({
        emailVerificationToken: emailVerificationToken,
        emailVerified: emailVerified
    }, {
        where: { id: authId }
    })
}


export const updatePasswordNumber = async (authId: number, passwordResetToken: string, passwordExpirationDate: Date) => {
    await AuthModel.update({
        passwordResetToken: passwordResetToken,
        passwordResetExpires: passwordExpirationDate
    }, {
        where: { id: authId }
    })
}

export const updatePassword = async (authId: number, password: string) => {
    await AuthModel.update({
        password: password,
        passwordResetToken: '',
        passwordResetExpires: new Date()
    }, {
        where: { id: authId }
    })
}

export const signToken = (id: number, email: string, username: string) => {
    return sign({
        id: id,
        email: email,
        username: username
    },
        config.JWT_TOKEN!

    )
}
