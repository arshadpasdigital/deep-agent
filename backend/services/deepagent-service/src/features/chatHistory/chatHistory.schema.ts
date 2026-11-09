import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export type MessageRole = "user" | "assistant" | "system" | "tool";
export type HitlStatus = "pending" | "approved" | "rejected" | "edited";
export type ChatStatus = "active" | "archived";

export interface IHitlAction {
  id?: string;
  interruptedId?: string;
  toolName?: string;
  toolDescription?: string;
  args?: Record<string, unknown>;
}

export interface IHitl {
  status: HitlStatus;
  action?: IHitlAction;
}

export interface IMessage {
  messageId: string;
  role: MessageRole;
  content: string;
  thinking?: string;
  error?: string;
  hitl?: IHitl;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatHistory {
  _id: string;
  userId: string;
  agentId: string;
  title?: string;
  status: ChatStatus;
  messages: IMessage[];
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const hitlActionSchema = new Schema<IHitlAction>(
  {
    id: { type: String },
    interruptedId: { type: String },
    toolName: { type: String },
    toolDescription: { type: String },
    args: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const hitlSchema = new Schema<IHitl>(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "edited"] satisfies HitlStatus[],
      required: true,
      default: "pending",
    },
    action: { type: hitlActionSchema },
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    messageId: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "assistant", "system", "tool"] satisfies MessageRole[],
      required: true,
    },
    content: { type: String, required: true },
    thinking: { type: String },
    error: { type: String },
    hitl: { type: hitlSchema },
  },
  { _id: false, timestamps: true },
);

const chatHistorySchema = new Schema<IChatHistory>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    agentId: { type: String, required: true },
    title: { type: String, trim: true, maxlength: 200 },
    status: {
      type: String,
      enum: ["active", "archived"] satisfies ChatStatus[],
      required: true,
      default: "active",
    },
    messages: { type: [messageSchema], default: [] },
    messageCount: { type: Number, default: 0, min: 0 },
    lastMessageAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, collection: "chat_histories", versionKey: false },
);

chatHistorySchema.index({ userId: 1, agentId: 1, lastMessageAt: -1 });
chatHistorySchema.index({ userId: 1, status: 1, updatedAt: -1 });

export type ChatHistory = IChatHistory;
export type ChatMessage = IMessage;
export type ChatHistoryDocument = HydratedDocument<IChatHistory>;

export const ChatHistoryModel: Model<IChatHistory> =
  (mongoose.models.ChatHistory as Model<IChatHistory> | undefined) ??
  mongoose.model<IChatHistory>("ChatHistory", chatHistorySchema);
