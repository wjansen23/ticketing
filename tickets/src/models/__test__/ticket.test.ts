import { Ticket } from "../ticket";

it('Implements Optimistic Currency Control', async ()=>{
    //Create a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        userId: '123'
    });

    //Save ticket to DB
    await ticket.save();

    //Fetch ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    //Make two seperate changes
    firstInstance!.set({price:10});
    secondInstance!.set({price:15});

    //Save first ticket
    await firstInstance!.save();

    //Save second fetch ticket
    try{
        await secondInstance!.save();
    } catch (err){
        return;
    }
    
    throw new Error('Should not reach this point');
});

it('Increments version number of multiple saves', async()=>{
    //Create a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 20,
        userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);


})