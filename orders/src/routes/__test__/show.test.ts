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

it('Returns an order for a user', async()=>{
    const ticket = await buildTicket('Concert',20);
    const user = global.signin();

    const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie',user)
    .send({ticketId: ticket.id})
    .expect(201);

    const {body: fetchedOrder} = await request (app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie',user)
    .send()
    .expect(200);

    expect(fetchedOrder.id).toEqual(order.id); 
});

it('Errors when a user tries to access another users order', async()=>{
    const ticket = await buildTicket('Concert',20);
    const user = global.signin();
    const userTwo = global.signin();

    const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie',user)
    .send({ticketId: ticket.id})
    .expect(201);

    await request (app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie',userTwo)
    .send()
    .expect(401);
});