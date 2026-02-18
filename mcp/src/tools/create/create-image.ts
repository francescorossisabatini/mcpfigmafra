import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { TaskManager } from "../../task-manager.js";
import { safeToolProcessor } from "../safe-tool-processor.js";
import { CreateImageParamsSchema, type CreateImageParams } from "../../shared/types/index.js";

export function createImage(server: McpServer, taskManager: TaskManager) {
    server.tool(
        "create-image",
        "Create a image.",
        CreateImageParamsSchema.shape,
        async (params: CreateImageParams) => {
            // Fetch image in Node.js (no CORS restrictions)
            const response = await fetch(params.url);
            if (!response.ok) {
                return {
                    content: [{ type: "text" as const, text: `Failed to fetch image: HTTP ${response.status}` }],
                    isError: true,
                };
            }
            const arrayBuffer = await response.arrayBuffer();
            const imageData = Array.from(new Uint8Array(arrayBuffer));

            // Send imageData to plugin instead of URL
            const pluginParams = {
                ...params,
                imageData,
            };

            return await safeToolProcessor<typeof pluginParams>(
                taskManager.runTask("create-image", pluginParams)
            );
        }
    );
}