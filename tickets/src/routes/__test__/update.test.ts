import request from "supertest";
import { app} from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it('Returns 404 if provided id does not exist', async ()=>{
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie',global.signin())
    .send({
        title: 'asdf',
        price: 20
    })
    .expect(404);
});

it('Returns 401 if user not authenticate', async ()=>{
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
    .put(`/api/tickets/${id}`)
    .send({
        title: 'asdf',
        price: 20
    })
    .expect(401);
});

it('Returns 401 if user does not own ticket', async ()=>{
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title:'asdf',
        price:20
    })

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
        title:"1234",
        price:1111
    })
    .expect(401);
});

it('Returns 400 if no title and/or price is provided', async ()=>{
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title:'asdf',
        price:20
    })

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'',
        price:20
    })
    .expect(400);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'dfre',
        price:-20
    })
    .expect(400);

});

it('It updates the ticket provided valid inputs', async ()=>{
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title:'asdf',
        price:20
    })

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'Updated Title',
        price:100
    })
    .expect(200);

    const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

    expect(ticketResponse.body.title).toEqual('Updated Title');
    expect(ticketResponse.body.price).toEqual(100);
});

it('publishes an event', async ()=>{
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title:'asdf',
        price:20
    })

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'Updated Title',
        price:100
    })
    .expect(200);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Rejects updates if ticket is reserved', async ()=>{
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title:'asdf',
        price:20
    })

    const fetchedTicket = await Ticket.findById(response.body.id);
    fetchedTicket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});

    await fetchedTicket!.save();

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'Updated Title',
        price:100
    })
    .expect(400);    
})