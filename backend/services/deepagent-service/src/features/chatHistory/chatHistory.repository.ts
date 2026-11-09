import type { Model } from "mongoose";
import { ChatHistory, ChatHistoryModel } from "./chatHistory.schema.js";

class ChatHistoryRep{
    constructor(private readonly userModel: Model<ChatHistory> = ChatHistoryModel){}
    

}