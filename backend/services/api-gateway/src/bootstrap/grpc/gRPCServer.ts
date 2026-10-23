import * as grpc from '@grpc/grpc-js'
import { env } from '../config.js';

export const startTaskServers = ()=>{
    const server = new grpc.Server();
    

    server.bindAsync(`0.0.0.0:${env.PORT}`,grpc.ServerCredentials.createInsecure(),
    (error,port)=>{
        if(error){
            console.error(`Server failed to bind: ${error.message}`);
            return;
        }
        console.log(`Task Service running on port : ${port}`)
    }
    )
}