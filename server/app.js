import express from "express"
import cors from "cors"
import {getTableContext, establishConnection } from './index.js';

const app = express();
app.use(cors());

app.use(express.json());
app.use(logger);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

let connection = null;
const dbName = 'MAI';

app.get("/table-data",(request, response)=> {
    getTableContext(connection,dbName).then(res => {
        response.send(res);
    })
    .catch(err => {
        console.log('Error in fetching data!');
        response.status(400).send({
            description: err
        });
    })
})

function logger(req,res,next){
    req.obj = { api_requested_by: "Shiva"};
    next();
}
const port = 5000;

app.listen(port,()=>{
    establishConnection().then(res => {
        console.log(`listening at port ${port}`);
        connection = res;
    }).catch(err => {
        console.log(err, 'Failed to establish connection');
    })
})
