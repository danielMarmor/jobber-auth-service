import Joi, { ObjectSchema } from "joi";

export const signupSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().min(4).max(12).required()
        .messages({
            'string.base': 'username must be of type string',
            'string.min': 'invalid username',
            'string.max': 'invalid username',
            'string.empty': 'Username is reuqired field',
        }),
    password: Joi.string().min(4).max(12).required()
        .messages({
            'string.base': 'password must be of type string',
            'string.min': 'invalid password',
            'string.max': 'invalid password',
            'string.empty': 'Password is reuqired field',
        }),
    country: Joi.string().required()
        .messages({
            'string.base': 'country must be of type string',
            'string.empty': 'Country is reuqired field',
        }),
    email: Joi.string().email().required()
        .messages({
            'string.base': 'email must be of type string',
            'string.email': 'invalid email',
            'string.empty': 'email is reuqired field',
        }),
    profilePicture: Joi.string().required()
        .messages({
            'string.base': 'please attack profile pictrue',
            'string.empty': 'Profile pictrue is reuqired',
        })
})