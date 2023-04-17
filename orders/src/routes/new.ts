import express,{Request, Response} from 'express'
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@wjgittix/common';
import { body} from 'express-validator'
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_WINDOWS_SECONDS = 60 //15*60;

router.post('/api/orders',requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input:string)=> mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be valid')
], validateRequest, async (req:Request, res: Response)=>{
    const {ticketId} = req.body;

    //Find ticket the user is trying to order
    const ticket = await Ticket.findById(ticketId);

    if (!ticket){
        throw new NotFoundError();
    }
    //Make sure ticket is not already reserved. Status that is not canceled
    const isReserved = await ticket.isReserved();

    if (isReserved){
        throw new BadRequestError('Ticket is already reserved');
    }

    //Calculate an expiration date for order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds()+EXPIRATION_WINDOWS_SECONDS);

    //Build the order and save to DB
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket
    });

    await order.save();

    //Publish an event that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket:{
            id: ticket.id,
            price: ticket.price
        }
    })

    res.status(201).send(order);
});

export {router as newOrderRouter};