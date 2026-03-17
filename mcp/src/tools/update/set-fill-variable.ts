import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { TaskManager } from "../../task-manager.js";
import { safeToolProcessor } from "../safe-tool-processor.js";
import { SetFillVariableParamsSchema, type SetFillVariableParams } from "../../shared/types/index.js";

export function setFillVariable(server: McpServer, taskManager: TaskManager) {
    server.tool(
        "set-fill-variable",
        "Bind a Figma COLOR variable to a node's fill. Pass the variable name exactly as returned by get-local-variables, e.g. 'color/brand/primary'.",
        SetFillVariableParamsSchema.shape,
        async (params: SetFillVariableParams) => {
            return await safeToolProcessor<SetFillVariableParams>(
                taskManager.runTask("set-fill-variable", params)
            );
        }
    );
}
