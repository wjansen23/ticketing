import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@wjgittix/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdateListener extends Listener<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data:TicketUpdatedEvent['data'],msg:Message){
        const ticket = await Ticket.findByEvent(data);
        const {title,price} = data;

        if (!ticket){
            throw new Error('Ticket not Found');
        }

        ticket.set({title,price});
        await ticket.save();

        msg.ack();
    }
}