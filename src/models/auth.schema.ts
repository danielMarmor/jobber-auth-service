import { sequelize } from "@auth/database";
import { IAuthDocument } from "@danielmarmor/jobber-shared";
import { compare, hash } from "bcryptjs";
import { DataTypes, Model, ModelDefined, Optional } from "sequelize";


const SALT_ROUNDS = 10;

type comparePassword = (passord: string, compPassword: string) => Promise<boolean>

type AuthModelExtended = IAuthDocument & comparePassword;

type AuthUserCreationAttributes = Optional<AuthModelExtended, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>

const AuthModel: ModelDefined<AuthModelExtended, AuthUserCreationAttributes> = sequelize.define('auth',
    {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profilePublicId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: false
        },
        emailVerificationToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Date.now
        },
        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        passwordResetExpires: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Date.now
        },

    }, {
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['username']
        },
        {
            unique: true,
            fields: ['emailVerificationToken']
        }
    ]
}
);
AuthModel.addHook('beforeCreate', async (auth: Model) => {
    const hashedPassword = await hash(auth.dataValues.password, SALT_ROUNDS);
    auth.dataValues.password = hashedPassword;
});


async function comparePassword(passord: string, compPassword: string): Promise<boolean> {
    return await compare(passord, compPassword);

}

async function hashPassword(password: string): Promise<string> {
    const hashedPassword = await hash(password, SALT_ROUNDS);
    return hashedPassword;

}

if (process.env.NODE_ENV !== "test") {
    AuthModel.sync({});
}


export { AuthModel, comparePassword, hashPassword }

