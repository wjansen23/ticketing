import { Subjects, Publisher, OrderCreatedEvent } from "@wjgittix/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

