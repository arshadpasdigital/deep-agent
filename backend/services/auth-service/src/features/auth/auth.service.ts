import { AuthRepo } from "./auth.repository.js";

export class AuthService{
    constructor(
        private readonly authRep:AuthRepo
    ){

    }
}