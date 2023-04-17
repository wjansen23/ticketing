import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent } from "@wjgittix/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async()=>{
    //create listner
    const listener = new OrderCancelledListener(natsWrapper.client);

    //create and save a order and ticket
    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'Concert',
        price: 15,
        userId: '1234'
    });
    ticket.set({orderId});
    await ticket.save();

    //create fake data object
    const data: OrderCancelledEvent['data']={
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    }

    //create fake message object
    //@ts-ignore
    const msg: Message ={
        ack: jest.fn()
    };

    return {listener, ticket, data, msg, orderId};
}

it('Update a ticket and published a message',async()=>{
    const {listener, ticket, data, msg, orderId} =  await setup();
    await listener.onMessage(data,msg);

    //find ticket
    const updatedTicket = await Ticket.findById(ticket.id);
    
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled;
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});