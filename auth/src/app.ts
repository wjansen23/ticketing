import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler, NotFoundError } from '@wjgittix/common';

//EXPRESS
const app = express();
//Allows engineX/ingress https traffic
app.set('trust proxy',true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: false,
}));

//Authentication routers
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

//ROUTES
app.all('*', async (req,res)=>{
    throw new NotFoundError();
});

//Error Handler
app.use(errorHandler);

export {app};