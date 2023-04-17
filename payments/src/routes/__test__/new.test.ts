import request from "supertest";
import { app } from "../../app";
import mongoose, { mongo } from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@wjgittix/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payments";

jest.mock('../../stripe');

it('returns a 404 when purchashing an order that does not exists', async()=>{
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token:'asdf',
        orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);

})

it('returns a 401 when purchashing an order that doesnt belong to the user', async()=>{
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version:0,
        price: 20,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token:'asdf',
        orderId: order.id
    })
    .expect(401);
})

it('returns a 400 when purchashing an order that has been cancelled', async()=>{
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version:0,
        price: 20,
        status: OrderStatus.Cancelled
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        orderId: order.id,
        token: 'adsf'
    })
    .expect(400);

})

it('returns a 400 when purchashing an order that has been cancelled', async()=>{
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version:0,
        price: 20,
        status: OrderStatus.Cancelled
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        orderId: order.id,
        token: 'adsf'
    })
    .expect(400);

})

it('returns a 204 with valid inputs', async()=>{
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version:0,
        price: 5,
        status: OrderStatus.Created
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'tok_visa',
        orderId: order.id})
    .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(5*100);
    expect(chargeOptions.currency).toEqual('usd');

    const payment = await Payment.findOne({orderId: order.id, stripeId: chargeOptions.id });
    expect(payment).not.toBeNull;
})