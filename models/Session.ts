import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISession extends Document {
  sessionId: string;
  userAccountId: string;
  expiresAt: Date;
  data?: Record<string, any>;
}

const SessionSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userAccountId: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);

export default Session;
