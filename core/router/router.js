import { Request, Response } from 'express';

const { Router } = require('express');
const routerPublic = Router();

routerPublic.use('/sentence', sentenceRoute);

export default routerPublic;
