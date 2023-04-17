import { Subjects, Publisher, OrderCancelledEvent } from "@wjgittix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}

