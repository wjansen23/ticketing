import { Subjects, Publisher, ExpirationCompleteEvent } from "@wjgittix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}