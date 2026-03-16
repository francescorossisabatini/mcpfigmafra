import { CreateColorStyleParams } from "@shared/types";
import { ToolResult } from "../tool-result";

export async function createColorStyle(args: CreateColorStyleParams): Promise<ToolResult> {
    const style = figma.createPaintStyle();
    style.name = args.name;
    style.description = args.description !== undefined ? args.description : "";
    style.paints = [
        {
            type: "SOLID",
            color: { r: args.r, g: args.g, b: args.b },
            opacity: args.a !== undefined ? args.a : 1,
        },
    ];

    return {
        isError: false,
        content: JSON.stringify({
            id: style.id,
            name: style.name,
            description: style.description,
            r: args.r,
            g: args.g,
            b: args.b,
            a: args.a !== undefined ? args.a : 1,
        }),
    };
}
