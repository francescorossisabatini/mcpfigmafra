import { z } from "zod";

export const SetStrokeVariableParamsSchema = z.object({
    id: z.string().describe("Node id"),
    variableName: z.string().describe("Variable name as it appears in Figma, e.g. 'color/border/default'"),
});

export type SetStrokeVariableParams = z.infer<typeof SetStrokeVariableParamsSchema>;
