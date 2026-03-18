import http from "http";

const HOST = "127.0.0.1", PORT = 38450, PATH = "/mcp";

function postMCP(sessionId, body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const headers = { "Content-Type": "application/json", "Accept": "application/json, text/event-stream", "Content-Length": Buffer.byteLength(payload) };
        if (sessionId) headers["mcp-session-id"] = sessionId;
        const req = http.request({ host: HOST, port: PORT, path: PATH, method: "POST", headers }, (res) => {
            const sid = res.headers["mcp-session-id"] || sessionId;
            let buf = "";
            const done = (data) => { res.destroy(); resolve({ sessionId: sid, data }); };
            res.on("data", (chunk) => {
                buf += chunk.toString();
                for (const line of buf.split("\n")) {
                    if (line.trim().startsWith("data: ")) { try { done(JSON.parse(line.trim().slice(6))); return; } catch {} }
                }
            });
            res.on("end", () => { try { done(JSON.parse(buf)); } catch { done(buf); } });
            res.on("error", reject);
            setTimeout(() => { done({ timeout: true }); }, 35000);
        });
        req.on("error", reject);
        req.write(payload); req.end();
    });
}

function parseContent(c) {
    if (typeof c !== "string") return c;
    try { const f = JSON.parse(c); if (typeof f === "string") return JSON.parse(f); return f; } catch { return c; }
}

async function callTool(sid, name, args) {
    const res = await postMCP(sid, { jsonrpc: "2.0", id: Math.floor(Math.random()*99999), method: "tools/call", params: { name, arguments: args } });
    if (res.data?.timeout) { console.warn(`[TIMEOUT] ${name}`); return null; }
    const text = res.data?.result?.content?.[0]?.text;
    if (text !== undefined) return parseContent(text);
    if (res.data?.error) { console.warn(`[ERR] ${name}:`, res.data.error.message); return null; }
    return res.data;
}

async function main() {
    const init = await postMCP(null, { jsonrpc:"2.0", id:1, method:"initialize", params:{ protocolVersion:"2024-11-05", capabilities:{}, clientInfo:{ name:"cleanup", version:"1" } } });
    const sid = init.sessionId;
    console.log("Session:", sid);
    postMCP(sid, { jsonrpc:"2.0", method:"notifications/initialized", params:{} }).catch(()=>{});
    await new Promise(r => setTimeout(r, 300));

    // Use get-node-info on the page to get its children
    const pageInfo = await callTool(sid, "get-node-info", { id: "1:2" });
    console.log("Page info:", JSON.stringify(pageInfo).slice(0, 500));

    let list = pageInfo?.children;
    if (!Array.isArray(list)) {
        console.log("No children array found. Raw:", JSON.stringify(pageInfo).slice(0, 300));
        process.exit(1);
    }

    console.log(`\nFound ${list.length} nodes on page 1:2:`);
    for (const c of list) console.log(` - ${c.id}: "${c.name}" (${c.type})`);

    // Keep only "Tag / Badge"
    for (const c of list) {
        if (c.name === "Tag / Badge") { console.log(`\nKeeping: ${c.id} "${c.name}"`); continue; }
        console.log(`\nDeleting: ${c.id} "${c.name}"`);
        const r = await callTool(sid, "delete-node", { id: c.id });
        console.log(`  => ${JSON.stringify(r).slice(0,60)}`);
    }

    console.log("\nDone.");
    process.exit(0);
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
