const { addKeyword, createProvider, EVENTS } = require('@bot-whatsapp/bot');
const { HOST_SITE, HOST_WPP, PORT_EXPRESS_WPP } = require('../config');
const CronJob = require('node-cron');
const { sentenceRoute } = require('../core/sentence/service');

const MOCKDATA = {};
const cronJobs = {};

const listSentences = async cel => {
	const response = await fetch(`${HOST_SITE}/sentences/list`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ cel: cel }),
	})
		.then(e => {
			return e.json();
		})
		.catch(e => {
			return { status: 400, message: 'error' };
		});
	return response;
};

const deleteSentence = async (id, cel) => {
	const response = await fetch(`${HOST_SITE}/sentences/delete`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ id: id, cel: cel }),
	});
	console.table(response);
	return await response.json();
};

async function getCronJobConfig(cel, interval = null) {
	const response = await fetch(`${HOST_SITE}/sentences/cron`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ cel: cel, interval: interval }),
	});
	return await response.json();
}

async function sendMessages(cel) {
	const resData = await sentenceRoute(cel);
	const message = `${resData.english}\n${resData.spanish}`;
	const response = await fetch(`http://localhost:${PORT_EXPRESS_WPP}/sendMessage`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ cel: cel, message: message }),
	});
}

async function createOrUpdateTaskUser(cel, interval) {
	if (cronJobs[cel]) {
		// Detén la tarea programada anterior
		cronJobs[cel].stop();
	}
	cronJobs[cel] = CronJob.schedule(interval, () => sendMessages(cel), {
		scheduled: false,
	});
	cronJobs[cel].start();
}
async function scheduleCronJob(cel, interval) {
	const { data, status } = await getCronJobConfig(cel, interval);
	if (status == 200 && data.interval) {
		createOrUpdateTaskUser(cel, data.interval);
	}
	// return config;
}

const initCronJobs = async () => {
	let verifyConnection = setInterval(async () => {
		const response = await fetch(`${HOST_SITE}/users`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(e => {
				return e.json();
			})
			.catch(err => {
				return { status: 400, message: 'error internal' };
			});
		console.log({ response });
		if (response.length > 0) {
			clearInterval(verifyConnection);
			response.map(e => {
				if (e.interval) {
					cronJobs[e.cel] = CronJob.schedule(e.interval, () => sendMessages(e.cel), {
						scheduled: false,
					});
					cronJobs[e.cel].start();
				}
			});
		}
	}, 1000);
};
initCronJobs();

//////

const flowListMaze = addKeyword('list').addAnswer('Consultando tu lista...', null, async (ctx, { flowDynamic, endFlow }) => {
	let data = await listSentences(ctx.from);
	if (data.status == 400) {
		return await flowDynamic([{ body: 'Estamos teniendo problemas con el servidor, intentelo más tarde' }]);
	} else {
		let response = '';
		for (let i = 0; i < data.length; i++) {
			response += `${data[i].id}. ${data[i].english}\n`;
		}
		return await flowDynamic([{ body: response ? response : 'No hay datos' }]);
	}
});

const flowMazeInterval = addKeyword('interval').addAnswer('ingresar el tiempo en minutos, tiempo minimo: 20', { capture: true }, async (ctx, { flowDynamic, fallBack }) => {
	let minutes = parseInt(ctx.body);
	if (minutes < 20) {
		fallBack();
	} else {
		let data = await scheduleCronJob(ctx.from, minutes);
		return await flowDynamic([{ body: 'intervalo agregado' }]);
	}
});

const flowMazeDelete = addKeyword('delete').addAnswer('ingresa el id de la oración a eliminar', { capture: true }, async (ctx, { flowDynamic }) => {
	const response = await deleteSentence(ctx.body, ctx.from);
	if (response.status == 200) {
		flowDynamic([{ body: 'oración eliminada' }]);
	} else {
		flowDynamic([{ body: 'ID invalido' }]);
	}
});

const flowMazeAdd = addKeyword(['add'])
	.addAnswer(
		'Estoy esperando la oración en español',
		{
			capture: true,
		},
		async (ctx, { fallBack }) => {
			MOCKDATA[ctx.from] = { spanish: ctx.body, english: '' };
		}
	)
	.addAnswer('Estoy esperando la oración en ingles', { capture: true }, async (ctx, { flowDynamic }) => {
		// await fakeHTTP();
		MOCKDATA[ctx.from].english = ctx.body;
		const response = await fetch(`${HOST_SITE}/sentences`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ data: [MOCKDATA[ctx.from]], cel: ctx.from }),
		});
		const data = await response.json();
		console.log(data);
		if (data.status == 200) {
			flowDynamic([{ body: 'datos guardados' }]);
		} else {
			fallBack();
		}
	});
const flowExample = addKeyword(['ex']).addAnswer('numero', { capture: true }, async (ctx, { flowDynamic }) => {});
const flowHelpMaze = addKeyword(['ayuda'], { sensitive: true })
	.addAnswer([
		'Hola, estos son los comandos',
		'*add*: Agregar una oración',
		'*list*: Consultar tu lista de oraciones',
		'*interval*: Configurar el cronjob',
		'*delete*:eliminar una oración',
	])
	.addAnswer(['Elige una *opción*'], null, null, [flowListMaze, flowMazeAdd, flowMazeInterval, flowMazeDelete]);

const flowFriend = addKeyword('chamito').addAnswer(['Hola, chamita preciosa hermosa', ':💘']);
var flowInitialMaze = {
	flowFriend,
	flowHelpMaze,
	flowMazeAdd,
	flowExample,
};

module.exports = flowInitialMaze;
