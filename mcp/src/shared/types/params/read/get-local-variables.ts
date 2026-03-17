import { z } from "zod";

export const GetLocalVariablesParamsSchema = z.object({
    resolvedType: z.enum(["COLOR", "FLOAT", "STRING", "BOOLEAN"]).optional()
        .describe("Filter by resolved type. Omit to return all variable types."),
});

export type GetLocalVariablesParams = z.infer<typeof GetLocalVariablesParamsSchema>;
