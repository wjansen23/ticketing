import { useEffect } from "react";
import useRequest from "../../hooks/use-request"
import Router from 'next/router'

const signOut = ()=>{

    const {doRequest} = useRequest({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: ()=> Router.push('/')
    });

    useEffect(()=>{doRequest(),[]});

    return <div>Signing you out...</div>
};

export default signOut;