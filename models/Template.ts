import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITemplate extends Document {
  userAccountId: string;
  name: string;
  projectKey: string;
  issueType: string;
  assigneeId?: string;
  targetStatus?: string;
  tasks: Array<{
    summary: string;
    description?: string;
  }>;
}

const TemplateSchema: Schema = new Schema(
  {
    userAccountId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    projectKey: { type: String, required: true },
    issueType: { type: String, required: true, default: "Task" },
    assigneeId: { type: String },
    targetStatus: { type: String },
    tasks: [
      {
        summary: { type: String, required: true },
        description: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Template: Model<ITemplate> =
  mongoose.models.Template || mongoose.model<ITemplate>("Template", TemplateSchema);

export default Template;
