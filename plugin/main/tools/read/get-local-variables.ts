import { GetLocalVariablesParams } from "@shared/types";
import { ToolResult } from "../tool-result";

export async function getLocalVariables(args: GetLocalVariablesParams): Promise<ToolResult> {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const collectionMap: Record<string, string> = {};
    for (const col of collections) {
        collectionMap[col.id] = col.name;
    }

    const allVars: Variable[] = args.resolvedType !== undefined
        ? await figma.variables.getLocalVariablesAsync(args.resolvedType)
        : await figma.variables.getLocalVariablesAsync();

    const result = allVars.map(function(v: Variable) {
        return {
            id: v.id,
            name: v.name,
            resolvedType: v.resolvedType,
            collection: collectionMap[v.variableCollectionId] !== undefined
                ? collectionMap[v.variableCollectionId]
                : v.variableCollectionId,
        };
    });

    return {
        isError: false,
        content: JSON.stringify(result),
    };
}
