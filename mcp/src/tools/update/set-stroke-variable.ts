import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { TaskManager } from "../../task-manager.js";
import { safeToolProcessor } from "../safe-tool-processor.js";
import { SetStrokeVariableParamsSchema, type SetStrokeVariableParams } from "../../shared/types/index.js";

export function setStrokeVariable(server: McpServer, taskManager: TaskManager) {
    server.tool(
        "set-stroke-variable",
        "Bind a Figma COLOR variable to a node's stroke. Pass the variable name exactly as returned by get-local-variables, e.g. 'color/border/default'.",
        SetStrokeVariableParamsSchema.shape,
        async (params: SetStrokeVariableParams) => {
            return await safeToolProcessor<SetStrokeVariableParams>(
                taskManager.runTask("set-stroke-variable", params)
            );
        }
    );
}
