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

const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;

const authProto = grpcObject.auth;



export const grpcAuthClient = new authProto.AuthService(
    `auth-service:${env.GRPC_AUTH_PORT}`,
    grpc.credentials.createInsecure(),
)

