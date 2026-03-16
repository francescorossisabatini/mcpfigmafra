import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { TaskManager } from "../../task-manager.js";
import { safeToolProcessor } from "../safe-tool-processor.js";
import { CreateColorStyleParamsSchema, type CreateColorStyleParams } from "../../shared/types/index.js";

export function createColorStyle(server: McpServer, taskManager: TaskManager) {
    server.tool(
        "create-color-style",
        "Create a Figma paint (color) style with a given name and solid color. Supports group notation e.g. 'Brand/Primary'.",
        CreateColorStyleParamsSchema.shape,
        async (params: CreateColorStyleParams) => {
            return await safeToolProcessor<CreateColorStyleParams>(
                taskManager.runTask("create-color-style", params)
            );
        }
    )
}
