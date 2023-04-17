import express from 'express';

const router = express.Router();

router.post('/api/users/signout',(req,res)=>{
    //Clear the cookie with the JWT
    req.session = null;

    res.send({});
 
});

export {router as signoutRouter}