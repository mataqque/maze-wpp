const { HOST_SITE } = require('../../config');

const sentenceRoute = async cel => {
	const data = await fetch(`${HOST_SITE}/sentences/list`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ cel: cel }),
	});
	const response = await data.json();
	return response;
};

module.exports = { sentenceRoute };
