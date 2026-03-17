import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { TaskManager } from "../../task-manager.js";
import { safeToolProcessor } from "../safe-tool-processor.js";
import { GetLocalVariablesParamsSchema, type GetLocalVariablesParams } from "../../shared/types/index.js";

export function getLocalVariables(server: McpServer, taskManager: TaskManager) {
    server.tool(
        "get-local-variables",
        "List all local Figma variables in the current file. Returns variable id, name, resolvedType, and collection name. Use variableName values with set-fill-variable / set-stroke-variable.",
        GetLocalVariablesParamsSchema.shape,
        async (params: GetLocalVariablesParams) => {
            return await safeToolProcessor<GetLocalVariablesParams>(
                taskManager.runTask("get-local-variables", params)
            );
        }
    );
}
