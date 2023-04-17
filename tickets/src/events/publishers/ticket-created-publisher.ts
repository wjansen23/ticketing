import { Publisher, Subjects, TicketCreatedEvent } from "@wjgittix/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;

    
}