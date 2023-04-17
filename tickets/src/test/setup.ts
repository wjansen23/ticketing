import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app} from '../app';
import request from 'supertest'

declare global {
    var signin: () => string[];
}

let mongo: any;

jest.mock('../nats-wrapper');

beforeAll(async ()=>{
    process.env.JWT_KEY = 'asdf';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    
    await mongoose.connect(mongoUri,{});
});

beforeEach(async ()=>{
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections){
        await collection.deleteMany({});
    }
});

afterAll(async() =>{
    if(mongo){
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signin = ()=>{
    //Build JWT Payload {id,email,}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    //Create JSON webtoken
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    
    //Build up session object {jwt: MY_JWT}
    const session = {jwt: token};

    //Turn session in to JSON
    const sessionJSON = JSON.stringify(session);

    //Encode JSON to base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    //Return string that is the cookie with encoded data
    return [`session=${base64}`];
};