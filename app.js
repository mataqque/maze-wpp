const { sentenceRoute } = require('./core/sentence/service');
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');

const express = require('express');
const app = express();
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MySQLAdapter = require('@bot-whatsapp/database/mysql');
const { flowInit } = require('./flows/init.flow');
const { flowMazeAdd, flowHelpMaze, flowExample, flowFriend } = require('./flows/flow.maze');
const messageSchema = require('./schema/messageSchema');
const { pick } = require('lodash');
const { PORT_EXPRESS_WPP, HOST_SITE } = require('./config');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = 'mysql-maze';
const MYSQL_DB_USER = 'wpp_user';
const MYSQL_DB_PASSWORD = 'BqPHKVCEkrn9NO1bl5TdO5r8gjrf36VAERfmg92I3ksCIkmh3a';
const MYSQL_DB_NAME = 'maze';
const MYSQL_DB_PORT = '3306';

const adapterDB = new MySQLAdapter({
	host: MYSQL_DB_HOST,
	user: MYSQL_DB_USER,
	database: MYSQL_DB_NAME,
	password: MYSQL_DB_PASSWORD,
	port: MYSQL_DB_PORT,
});

const adapterProvider = createProvider(BaileysProvider);
const sendMessagesApi = async (req, res) => {
	try {
		const validate = messageSchema.validateSync(req.body);
		const { cel, message } = pick(validate, Object.keys(messageSchema.fields));
		await adapterProvider.sendText(`${cel}@c.us`, message);
		return res.send('ok');
	} catch (err) {
		return res.status(400).send(err.message);
	}
};

const adapterFlow = createFlow([flowMazeAdd, flowHelpMaze, flowExample, flowFriend]);

createBot({
	flow: adapterFlow,
	provider: adapterProvider,
	database: adapterDB,
});

app.post('/sendMessage', sendMessagesApi);

// QRPortalWeb();

const PORT = process.env.PORT_EXPRESS_WPP || PORT_EXPRESS_WPP;
app.listen(PORT, () => console.log(`express running on http://localhost:${PORT}`));
