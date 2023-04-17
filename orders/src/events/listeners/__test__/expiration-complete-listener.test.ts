import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { OrderStatus, ExpirationCompleteEvent } from "@wjgittix/common";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/order";

const setup = async()=>{
    //create an instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    //create and save a tickets
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 15
    });

    await ticket.save();

    const order = Order.build({
        userId: '1234',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket
    })

    await order.save();

    const data: ExpirationCompleteEvent['data']={
        orderId: order.id
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };    

    return {listener, data, msg, ticket, order};
}

it('updates the order status to cancell', async ()=>{
    const {listener, order, ticket, msg, data} = await setup();
    await listener.onMessage(data,msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emit an order cancel event', async ()=>{
    const {listener, order, ticket, msg, data} = await setup();
    await listener.onMessage(data,msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
})

it('ack the message', async ()=>{
    const {listener, order, ticket, msg, data} = await setup();
    await listener.onMessage(data,msg);

    expect(msg.ack).toHaveBeenCalled(); 
})