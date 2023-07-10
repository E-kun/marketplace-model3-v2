const Joi = require('joi');

module.exports.resourceSchema = Joi.object({
    resource: Joi.object({
        name: Joi.string().required().regex(/[$\(\)<>!;]/, { invert: true }),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        subject: Joi.string().required().regex(/[$\(\)<>!;]/, { invert: true }),
        description: Joi.string().required().regex(/[$\(\)<>!]/, { invert: true })
    }).required()
});

