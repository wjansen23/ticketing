import { Listener, OrderCancelledEvent, Subjects } from "@wjgittix/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'],msg:Message){
        //Find the ticket associated with the order
        const ticket = await Ticket.findById(data.ticket.id);

        //Throw error if no ticket
        if (!ticket){
            throw new Error('Ticket not found');
        }

        //Unset Order 
        ticket.set({orderId:undefined});

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