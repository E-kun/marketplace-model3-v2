const Joi = require('joi');

module.exports.resourceSchema = Joi.object({
    resource: Joi.object({
        name: Joi.string().alphanum().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        subject: Joi.string().alphanum().required(),
        description: Joi.string().alphanum().required()
    }).required()
});

