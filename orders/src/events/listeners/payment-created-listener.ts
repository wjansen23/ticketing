import { PaymentCreatedEvent, Listener, Subjects, OrderStatus } from "@wjgittix/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
    queueGroupName = queueGroupName;
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

    async onMessage(data: PaymentCreatedEvent['data'], msg:Message){
        const order = await Order.findById(data.orderId);

        if (!order){ 
            throw new Error('Order not found');
        }

        order.set({status: OrderStatus.Complete});
        await order.save();

        msg.ack();
    }
}