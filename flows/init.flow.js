const { addKeyword, addAnswer } = require('@bot-whatsapp/bot');
const { HOST_SITE, HOST_WPP } = require('../config');

const delay = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
};
const fakeHTTP = async sentence => {
	const response = await fetch(`${HOST_SITE}/sentences`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: sentence,
	});
	return await data.json();
};

const flowPeluches = addKeyword('1').addAnswer('Estamos consultado los productos de peluche', null, async (_, { flowDynamic }) => {
	await fakeHTTP();
	return await flowDynamic([{ body: 'Peluche Oso Yogi', media: `${HOST_WPP}/uploads/oso_yogi_faef5765ab.jpg` }]);
});

const flowFlores = addKeyword('2').addAnswer('Estamos consultado los productos sobre las flores', null, async (_, { flowDynamic }) => {
	await fakeHTTP();
	return await flowDynamic([
		{
			body: 'Arreglo floral de 20 flores \n *precio: s/ 120.00*',
			media: `${HOST_WPP}/uploads/oso_yogi_faef5765ab.jpg`,
		},
	]);
});

const flowDesayunos = addKeyword('3').addAnswer('Estamos consultado los productos de desayunos', null, async (_, { flowDynamic }) => {
	await fakeHTTP();
	return await flowDynamic([
		{
			body: 'Desayuno Lazo',
			media: `${HOST_WPP}/uploads/oso_yogi_faef5765ab.jpg`,
		},
	]);
});

const flowCustomGifts = addKeyword('4').addAnswer('Estamos consultado los productos de regalos', null, async (_, { flowDynamic }) => {
	await fakeHTTP();
	return await flowDynamic([
		{
			body: 'Regalo personalizado \n *precio: s/ 120.00*',
			media: `${HOST_WPP}/uploads/oso_yogi_faef5765ab.jpg`,
		},
	]);
});

const flowExperience = addKeyword('5').addAnswer('Estamos consultado los productos de regalos', null, async (_, { flowDynamic }) => {
	await fakeHTTP();
	return await flowDynamic([
		{
			body: 'Experiencia romántica \n *precio: s/ 120.00*',
			media: `${HOST_WPP}/uploads/oso_yogi_faef5765ab.jpg`,
		},
	]);
});

const flowSpecialDetail = addKeyword('5').addAnswer(' Detalles para celebraciones especiales');

const flowInit = addKeyword(['Hola', 'hola', 'ola', 'hola', 'Hola'])
	.addAnswer([
		'Hola, *🎀Lazo Detalles* te da la bienvenida a nuestro chat',
		' ',
		'Que tipo de detalles estas buscando 😁?',
		' ',
		'*1 :* Peluches y regalos románticos',
		'*2 :* Flores y arreglos florales',
		'*3 :* Desayunos y cestas sorpresa',
		'*4 :* Regalos personalizados para parejas',
		'*5 :* Experiencias románticas',
		'*6 :* Detalles para celebraciones especiales:',
	])
	.addAnswer(['Elija un número '], null, null, [flowPeluches, flowFlores, flowDesayunos, flowCustomGifts, flowExperience, flowSpecialDetail]);

var flowInitial = {
	flowInit,
};

module.exports = flowInitial;
