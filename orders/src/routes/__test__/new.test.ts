import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if ticket does not exist', async()=>{
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
    .post('/app/orders')
    .set('Cookie',global.signin())
    .send({ticketId: ticketId})
    .expect(404);
});

it('returns an error if ticket is reserved', async()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:20
    });

    await ticket.save();

    const order = Order.build({
        userId: 'asdfs',
        status: OrderStatus.Created,
        ticket:ticket,
        expiresAt: new Date()
    });

    order.save();

    await request(app)
    .post('/api/orders')
    .set('Cookie',global.signin())
    .send({ticket:ticket.id})
    .expect(400);
});

it('reserves a ticket', async()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:20
    });

    await ticket.save();

    await request(app)
    .post('/api/orders')
    .set('Cookie',global.signin())
    .send({ticketId:ticket.id})
    .expect(201);

});

it('Emits a order created event', async ()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:20
    });

    await ticket.save();

    await request(app)
    .post('/api/orders')
    .set('Cookie',global.signin())
    .send({ticketId:ticket.id})
    .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});