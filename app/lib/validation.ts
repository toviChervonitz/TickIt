import Joi from "joi";

const passwordPattern =
/^(?=.*[A-Za-z])(?=.*\d).{6,}$/


export const registerSchema = Joi.object({
  provider: Joi.string()
    .valid("credentials", "google")
    .required()
    .messages({
      "any.only": "Provider must be 'credentials' or 'google'.",
      "string.empty": "Provider is required.",
    }),

  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 2 characters long.",
    "string.max": "Name cannot exceed 50 characters.",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address.",
  }),

  tel: Joi.string().optional().min(9).max(20).allow("").messages({
    "string.base": "Phone number must be a text string.",
  }),

  password: Joi.string()
    .pattern(passwordPattern)
    .when("provider", {
      is: "credentials",
      then: Joi.required().messages({
        "string.empty": "Password is required for manual users.",
        "string.pattern.base":
          "Password must be at least 6 characters long and include an letter and a number.",
      }),
      otherwise: Joi.forbidden(), // disallow password for google users
    }),

  image: Joi.string().uri().optional().allow(""),
}).unknown(false);

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required.",
        "string.email": "Please enter a valid email address.",
    }),

    password: Joi.string().required().messages({
        "string.empty": "Password is required.",
    }),
});

export const projectSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Project name is required.",
        "string.min": "Project name must be at least 2 characters long.",
        "string.max": "Project name cannot exceed 100 characters.",
    }),
    description: Joi.string().max(500).optional().allow("").messages({
        "string.max": "Description cannot exceed 500 characters.",
    }),
});

export const taskSchema = Joi.object({
  title: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Task title is required.",
    "string.min": "Task title must be at least 2 characters long.",
    "string.max": "Task title cannot exceed 100 characters.",
  }),
  content: Joi.string().max(1000).optional().allow("").messages({
    "string.max": "Content cannot exceed 1000 characters.",
  }),
  dueDate: Joi.date().iso().required().messages({
    "date.base": "Due date must be a valid date.",
    "any.required": "Due date is required.",
    "date.format": "Due date must be in ISO format (YYYY-MM-DD).",
  }),
}).unknown(true); // ✅ allow extra fields like "status"

// import Joi from "joi";
// import { getTranslation } from "./i18n";

// const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
// const t = getTranslation(); // or useTranslation() if inside React

// export const registerSchema = Joi.object({
//   provider: Joi.string()
//     .valid("credentials", "google")
//     .required()
//     .messages({
//       "any.only": t("provider_only_credentials_or_google"),
//       "string.empty": t("provider_required"),
//     }),

//   name: Joi.string().min(2).max(50).required().messages({
//     "string.empty": t("name_required"),
//     "string.min": t("name_min_2"),
//     "string.max": t("name_max_50"),
//   }),

//   email: Joi.string().email().required().messages({
//     "string.empty": t("email_required"),
//     "string.email": t("email_invalid"),
//   }),

//   tel: Joi.string().optional().min(9).max(20).allow("").messages({
//     "string.base": t("tel_must_be_text"),
//   }),

//   password: Joi.string()
//     .pattern(passwordPattern)
//     .when("provider", {
//       is: "credentials",
//       then: Joi.required().messages({
//         "string.empty": t("password_required_credentials"),
//         "string.pattern.base": t("password_pattern"),
//       }),
//       otherwise: Joi.forbidden(),
//     }),

//   image: Joi.string().uri().optional().allow(""),
// }).unknown(false);

// export const loginSchema = Joi.object({
//   email: Joi.string().email().required().messages({
//     "string.empty": t("email_required"),
//     "string.email": t("email_invalid"),
//   }),

//   password: Joi.string().required().messages({
//     "string.empty": t("password_required"),
//   }),
// });

// export const projectSchema = Joi.object({
//   name: Joi.string().min(2).max(100).required().messages({
//     "string.empty": t("project_name_required"),
//     "string.min": t("project_name_min_2"),
//     "string.max": t("project_name_max_100"),
//   }),
//   description: Joi.string().max(500).optional().allow("").messages({
//     "string.max": t("project_description_max_500"),
//   }),
// });

// export const taskSchema = Joi.object({
//   title: Joi.string().min(2).max(100).required().messages({
//     "string.empty": t("task_title_required"),
//     "string.min": t("task_title_min_2"),
//     "string.max": t("task_title_max_100"),
//   }),
//   content: Joi.string().max(1000).optional().allow("").messages({
//     "string.max": t("task_content_max_1000"),
//   }),
//   dueDate: Joi.date().iso().required().messages({
//     "date.base": t("task_due_date_invalid"),
//     "any.required": t("task_due_date_required"),
//     "date.format": t("task_due_date_iso"),
//   }),
// }).unknown(true);
