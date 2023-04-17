import request from "supertest";
import { app} from "../../app";
import mongoose from "mongoose";

const createTicket = ()=>{
    return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: 'Concert',
        price: 20
    });
}


it('Can fetch a list of tickets', async()=>{
    await createTicket();
    await createTicket();
    await createTicket();

    const response = request(app)
    .get('/api/tickets')
    .send()
    .expect(200);

    expect((await response).body.length).toEqual(3);
})