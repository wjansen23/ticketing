import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListner } from "./events/ticket-created-listener";

console.clear();

const stan = nats.connect('ticketing',randomBytes(4).toString('hex'),{
    url: 'hhtp://localhost:4222'
});

stan.on('connect',()=>{
    console.log('Listener connected to NATS');

    stan.on('close',()=>{
        console.log('NATS Connection closed!');
        process.exit();
    });

    new TicketCreatedListner(stan).listen();
});

process.on('SIGINT',()=>{stan.close()});
process.on('SIGTERM',()=>{stan.close()});



