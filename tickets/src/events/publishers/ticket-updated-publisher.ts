import { Publisher, Subjects, TicketUpdatedEvent } from "@wjgittix/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;    
}