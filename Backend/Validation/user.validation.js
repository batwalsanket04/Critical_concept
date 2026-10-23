const Joi = require("joi");


const signupSchema = Joi.object({

    fname: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty":"Name is required",
            "string.min":"Name must be minimum 3 characters"
        }),


    role: Joi.string()
        .required()
        .messages({
            "string.empty":"Role is required"
        }),


    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email":"Enter valid email",
            "string.empty":"Email is required"
        }),


    password: Joi.string()
        .min(8)
        .pattern(
            new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"
            )
        )
        .required()
        .messages({

            "string.pattern.base":
            "Password must contain uppercase, lowercase, number and special character"

        })

});


module.exports={
    signupSchema
};