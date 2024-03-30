const Yup = require('yup');

const messageSchema = Yup.object().shape({
	cel: Yup.number().required(),
	message: Yup.string().required(),
});

module.exports = messageSchema;
