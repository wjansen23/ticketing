import { Subjects, Publisher, PaymentCreatedEvent } from "@wjgittix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;    
}