import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { env } from '../config.js';
import { getProtoAddress } from '@infrastructure/protoAddress.js';

export const PROTO_PATH = getProtoAddress('auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs:String,
    enums:String,
    defaults:true,
    oneofs:true
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;
const auth = proto.auth;

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