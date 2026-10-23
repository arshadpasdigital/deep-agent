import { AuthService } from './auth.service.js';
import type {Request,Response,NextFunction} from 'express';

export class AuthController{
    constructor(
        private readonly authService:AuthService
    ){
    }

    async getToken(req:Request,res:Response,next:NextFunction){}
    async getUser(req:Request,res:Response,next:NextFunction){}
}