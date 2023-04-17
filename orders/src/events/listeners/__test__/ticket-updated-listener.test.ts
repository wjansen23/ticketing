import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@wjgittix/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdateListener } from "../ticket-updated-listener";
import { Ticket } from "../../../models/ticket";

const setup = async()=>{
    //create an instance of the listener
    const listener = new TicketUpdateListener(natsWrapper.client);

    //create and save a tickets
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 15
    });

    await ticket.save();

    //create fake data event
    const data:TicketUpdatedEvent['data'] = {
        version: ticket.version+1,
        id: ticket.id,
        title: 'New concert',
        price: 10,
        userId: '1234'
    };

    //create a fake message object
    // @ts-ignore
    const msg:Message = {
        ack: jest.fn()
    };

    return {listener, data, msg, ticket};
}

it('finds, updates and saves a ticket', async()=>{
    const {listener, data, msg, ticket } = await setup();

    await listener.onMessage(data,msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async()=>{
    const {listener, data, msg,ticket } = await setup();

    await listener.onMessage(data,msg);

    expect(msg.ack).toHaveBeenCalled();

});

it('does not call ack if event has skipped a version number', async()=>{
    const {listener, data, ticket, msg} = await setup();
    
    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    }catch (err){

    }

    expect(msg.ack).not.toHaveBeenCalled();
})