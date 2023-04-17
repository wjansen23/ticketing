import { Listener, OrderCreatedEvent, Subjects } from "@wjgittix/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated  = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data:OrderCreatedEvent['data'], msg:Message) {
        //Find the ticket associated with the order
        const ticket = await Ticket.findById(data.ticket.id);

        //Throw error if no ticket
        if (!ticket){
            throw new Error('Ticket not found');
        }

        //Mark the ticket as reserved by setting orderId prop
        ticket.set({orderId: data.id});

        //Save the ticket
        await ticket.save();

        //emit event on ticket change
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        });

        //Ack the message
        msg.ack();
    }
}