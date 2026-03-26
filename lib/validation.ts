import { z } from "zod";

export const IssueSchema = z.object({
  fields: z.object({
    project: z.object({
      key: z.string().min(2).max(10),
    }),
    summary: z.string().min(1).max(255),
    description: z.any().optional(),
    issuetype: z.object({
      name: z.string().min(1),
    }),
    assignee: z.object({
      accountId: z.string(),
    }).optional(),
  }),
});

export const BulkCreateSchema = z.array(IssueSchema);

export const TemplateSchema = z.object({
  name: z.string().min(1).max(100),
  templateId: z.string().optional(),
  projectKey: z.string().min(1),
  issueType: z.string().min(1),
  assigneeId: z.string().optional(),
  targetStatus: z.string().optional(),
  tasks: z.array(z.object({
    summary: z.string().min(1).max(255),
    description: z.string().optional(),
  })),
});
