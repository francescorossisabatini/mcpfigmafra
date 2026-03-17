import { SetFillVariableParams } from "@shared/types";
import { ToolResult } from "../tool-result";

export async function setFillVariable(args: SetFillVariableParams): Promise<ToolResult> {
    const node = figma.getNodeById(args.id);
    if (!node) {
        return { isError: true, content: "Node not found: " + args.id };
    }
    if (!("fills" in node)) {
        return { isError: true, content: "Node does not support fills: " + args.id };
    }

    const variables = await figma.variables.getLocalVariablesAsync("COLOR");
    const variable = variables.find(function(v) { return v.name === args.variableName; });
    if (!variable) {
        return { isError: true, content: "Variable not found: " + args.variableName };
    }

    const fill: SolidPaint = {
        type: "SOLID",
        color: { r: 0, g: 0, b: 0 },
        boundVariables: {
            color: figma.variables.createVariableAlias(variable),
        },
    };
    (node as GeometryMixin).fills = [fill];

    return {
        isError: false,
        content: JSON.stringify({ id: args.id, variableName: args.variableName, variableId: variable.id }),
    };
}
