import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import mongoose, { mongo } from 'mongoose';

it('Cancels an order', async()=>{
    const user = global.signin();

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:20
    });

    await ticket.save();

    const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie',user)
    .send({ticketId: ticket.id})
    .expect(201);

    await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie',user)
    .send()
    .expect(204);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Cant cancel an order you dont own', async()=>{
    const user = global.signin();
    const userTwo = global.signin();

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:20
    });

    await ticket.save();

    const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie',user)
    .send({ticketId: ticket.id})
    .expect(201);

    await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie',userTwo)
    .send()
    .expect(401);
});

it('It emites an order cancel event', async ()=>{
    const user = global.signin();

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price:20
    });

    await ticket.save();

    const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie',user)
    .send({ticketId: ticket.id})
    .expect(201);

    await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie',user)
    .send()
    .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
