import { z } from "zod";

export const SetFillVariableParamsSchema = z.object({
    id: z.string().describe("Node id"),
    variableName: z.string().describe("Variable name as it appears in Figma, e.g. 'color/brand/primary'"),
});

export type SetFillVariableParams = z.infer<typeof SetFillVariableParamsSchema>;
