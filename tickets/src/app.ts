import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError,currentUser } from '@wjgittix/common';

import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';


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
app.use(createTicketRouter); 
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

//Authentication routers

//ROUTES
app.all('*', async (req,res)=>{
    throw new NotFoundError();
});

//Error Handler
app.use(errorHandler);

export {app};