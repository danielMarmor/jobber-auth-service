import Joi, { ObjectSchema } from "joi";
import { join } from "lodash";

const loginSchema: ObjectSchema = Joi.object().keys({
    username: Joi.alternatives().conditional(Joi.string().email(), {
        then: Joi.string().email().required()
            .messages({
                'string.base': 'email must be of type string',
                'string.email': 'invalid email',
                'string.empty': 'email is reuqired field',
            }),
        otherwise: Joi.string().min(4).max(12).required()
            .messages({
                'string.base': 'username must be of type string',
                'string.min': 'invalid username',
                'string.max': 'invalid username',
                'string.empty': 'Username is reuqired field',
            }),
    }),
    password: Joi.string().min(4).max(12).required()
        .messages({
            'string.base': 'password must be of type string',
            'string.min': 'invalid password',
            'string.max': 'invalid password',
            'string.empty': 'Password is reuqired field',
        }),

})

export { loginSchema }