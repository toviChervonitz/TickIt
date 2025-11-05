import Joi from "joi";

const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        "string.empty": "Name is required.",
        "string.min": "Name must be at least 2 characters long.",
        "string.max": "Name cannot exceed 50 characters.",
    }),

    email: Joi.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Please enter a valid email address.",
    }),

    tel: Joi.string().optional().min(9).max(10).allow("").messages({
        "string.base": "Phone number must be a text string.",
    }),

    password: Joi.string()
        .pattern(passwordPattern)
        .required()
        .messages({
            "string.empty": "Password is required.",
            "string.pattern.base":
                "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
        }),
    image: Joi.string().uri().optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Please enter a valid email address.",
    }),

    password: Joi.string().required().messages({
        "string.empty": "Password is required.",
    }),
});
