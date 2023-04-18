import axios from 'axios';

 const buildClient = ({req}) => {
    if (typeof window==='undefined'){
        //on server

        return axios.create({
            baseURL: 'http://www.ticketing-app-prod-wj23.xyz/',
            headers: req.headers
        });
    } else {
        //on browser
        return axios.create({
            baseURL: '/'
        });
    }
}

export default buildClient;