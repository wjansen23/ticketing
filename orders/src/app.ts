import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError,currentUser } from '@wjgittix/common';

import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes/index';
import { deleteOrderRouter } from './routes/delete';


//EXPRESS
const app = express();
//Allows engineX/ingress https traffic
app.set('trust proxy',true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: false,
}));
app.use(currentUser);

//Add routes
app.use(newOrderRouter); 
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

//Authentication routers

//ROUTES
app.all('*', async (req,res)=>{
    throw new NotFoundError();
});

//Error Handler
app.use(errorHandler);

export {app};