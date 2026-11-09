import * as grpc from '@grpc/grpc-js'
import { getEnv } from '../config.js';

export const startTaskServers = ()=>{
    const env = getEnv();
    const server = new grpc.Server();
    

    server.bindAsync(`0.0.0.0:${env.GRPC_NOTIFICATION_PORT}`,grpc.ServerCredentials.createInsecure(),
    (error,port)=>{
        if(error){
            console.error(`Server failed to bind: ${error.message}`);
            return;
        }
        console.log(`notification Service running on port : ${port}`)
    }
    )
}