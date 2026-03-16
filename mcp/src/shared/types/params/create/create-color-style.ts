import z from "zod";

export const CreateColorStyleParamsSchema = z.object({
    name: z.string().describe("Style name, supports group notation e.g. 'Brand/Primary'"),
    r: z.number().min(0).max(1).describe("Red channel (0-1)"),
    g: z.number().min(0).max(1).describe("Green channel (0-1)"),
    b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
    a: z.number().min(0).max(1).optional().default(1).describe("Alpha channel (0-1)"),
    description: z.string().optional().default("").describe("Optional description for the style"),
});

export type CreateColorStyleParams = z.infer<typeof CreateColorStyleParamsSchema>;
