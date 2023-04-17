import { Listener, Subjects } from "@wjgittix/common";
import { OrderCreatedEvent } from "@wjgittix/common/build/events/order-created-event";
import { queueGroupName } from "./queue-group-name";
import {Message} from 'node-nats-streaming'
import { expirationQueue } from "../../queues/expiration-queues";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName =queueGroupName;
    
    async onMessage(data:OrderCreatedEvent['data'], msg:Message){
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log('Waiting this many ms to process the job:', delay);


        await expirationQueue.add({
            orderId: data.id
        },{
            delay: delay,
        });

        msg.ack();

    }
}