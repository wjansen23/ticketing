import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

const buildTicket = async (t:string, p:number)=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: t,
        price: p
    });

    await ticket.save();

    return ticket;
}

it('Returns a list of orderd for a user', async ()=>{

    //create 3 tickets
    const ticketOne = await buildTicket('Concert',20);
    const ticketTwo = await buildTicket('Game',50);
    const ticketThree = await buildTicket('Event',10);

    const userOne = global.signin();
    const userTwo = global.signin();

    //create one order as user number one
    await request(app)
    .post('/api/orders')
    .set('Cookie',userOne)
    .send({ticketId:ticketOne.id})
    .expect(201);

    //create two orders for user number two
    const {body:orderOne} = await request(app)
    .post('/api/orders')
    .set('Cookie',userTwo)
    .send({ticketId:ticketTwo.id})
    .expect(201);

    const {body:orderTwo} = await request(app)
    .post('/api/orders')
    .set('Cookie',userTwo)
    .send({ticketId:ticketThree.id})
    .expect(201);

    //Make a request for user number two
    const response = await request(app)
    .get('/api/orders')
    .set('Cookie',userTwo)
    .expect(200);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticketId).toEqual(orderOne.ticketId);
    expect(response.body[1].ticketId).toEqual(orderTwo.ticketId);
})