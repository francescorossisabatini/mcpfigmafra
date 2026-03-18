import http from "http";

const HOST = "127.0.0.1";
const PORT = 38450;
const PATH = "/mcp";

function postMCP(sessionId, body) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "Content-Length": Buffer.byteLength(payload),
        };
        if (sessionId) headers["mcp-session-id"] = sessionId;

        const req = http.request({ host: HOST, port: PORT, path: PATH, method: "POST", headers }, (res) => {
            const sid = res.headers["mcp-session-id"] || sessionId;
            let buffer = "";
            const done = (data) => { res.destroy(); resolve({ sessionId: sid, data }); };

            res.on("data", (chunk) => {
                buffer += chunk.toString();
                for (const line of buffer.split("\n")) {
                    if (line.trim().startsWith("data: ")) {
                        try { done(JSON.parse(line.trim().slice(6))); return; } catch {}
                    }
                }
            });
            res.on("end", () => {
                try { done(JSON.parse(buffer)); } catch { done(buffer); }
            });
            res.on("error", reject);
            setTimeout(() => {
                for (const line of buffer.split("\n")) {
                    if (line.trim().startsWith("data: ")) {
                        try { done(JSON.parse(line.trim().slice(6))); return; } catch {}
                    }
                }
                done({ timeout: true, raw: buffer.slice(0, 200) });
            }, 35000);
        });
        req.on("error", reject);
        req.write(payload);
        req.end();
    });
}

function parseContent(content) {
    if (typeof content !== "string") return content;
    try {
        const first = JSON.parse(content);
        if (typeof first === "string") return JSON.parse(first);
        return first;
    } catch { return content; }
}

async function callTool(sessionId, name, args) {
    const res = await postMCP(sessionId, {
        jsonrpc: "2.0", id: Math.floor(Math.random() * 99999),
        method: "tools/call", params: { name, arguments: args }
    });
    if (res.data?.timeout) { console.warn(`  [TIMEOUT] ${name}`); return null; }
    const text = res.data?.result?.content?.[0]?.text;
    if (text !== undefined) return parseContent(text);
    if (res.data?.error) { console.warn(`  [ERR] ${name}:`, res.data.error.message || JSON.stringify(res.data.error)); return null; }
    return res.data;
}

// Convert 0-1 float components to #RRGGBBAA hex
function toHex(r, g, b, a = 1) {
    const h = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
    return `#${h(r)}${h(g)}${h(b)}${h(a)}`;
}

async function main() {
    // Initialize
    const initRes = await postMCP(null, {
        jsonrpc: "2.0", id: 1, method: "initialize",
        params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "badge", version: "1" } }
    });
    const sid = initRes.sessionId;
    console.log("Session:", sid);
    if (!sid) { console.error("No session ID"); process.exit(1); }
    postMCP(sid, { jsonrpc: "2.0", method: "notifications/initialized", params: {} }).catch(() => {});
    await new Promise(r => setTimeout(r, 300));

    const pageId = "1:2";

    // Badge specs
    const variants = [
        { name: "Default",    bgVar: "button/primary/background", strokeVar: null,              text: "Default",     tc: { r:1,     g:1,     b:1     } },
        { name: "Secondary",  bgVar: "card/background",           strokeVar: null,              text: "Secondary",   tc: { r:0.15,  g:0.19,  b:0.38  } },
        { name: "Outline",    bgVar: null,                        strokeVar: "colors/gray/200", text: "Outline",     tc: { r:0.15,  g:0.19,  b:0.38  } },
        { name: "Vegan",      bgVar: "colors/green/100",          strokeVar: null,              text: "Vegan",       tc: { r:0.086, g:0.396, b:0.204 } },
        { name: "GlutenFree", bgVar: "colors/orange/100",         strokeVar: null,              text: "Gluten-Free", tc: { r:0.573, g:0.251, b:0.055 } },
        { name: "Bio",        bgVar: "colors/teal/100",           strokeVar: null,              text: "Bio",         tc: { r:0.024, g:0.373, b:0.275 } },
    ];

    const wMap = { "Default":80, "Secondary":96, "Outline":76, "Vegan":70, "Gluten-Free":104, "Bio":52 };
    const badgeH = 22, gap = 10, padH = 24;
    const totalW = variants.reduce((a, v) => a + (wMap[v.text]||80), 0) + gap*(variants.length-1) + padH*2;

    // Create container
    console.log("Creating Tag / Badge frame...");
    const container = await callTool(sid, "create-frame", {
        parentId: pageId, name: "Tag / Badge",
        x: 100, y: 600, width: totalW, height: badgeH + padH*2,
    });
    const containerId = container?.id || container?.nodeId;
    console.log("Container ID:", containerId);
    if (!containerId) { console.error("Container failed:", JSON.stringify(container)); process.exit(1); }

    await callTool(sid, "set-fill-color", { id: containerId, color: "#F8F6F1FF" });

    // Create each badge variant
    let x = padH;
    for (const v of variants) {
        const w = wMap[v.text] || 80;
        console.log(`\nBadge: ${v.name}`);

        const badge = await callTool(sid, "create-frame", {
            parentId: containerId,
            name: `Badge / ${v.name}`,
            x, y: padH, width: w, height: badgeH,
        });
        const bid = badge?.id || badge?.nodeId;
        if (!bid) { console.error(`  Failed:`, badge); x += w + gap; continue; }
        console.log(`  ID: ${bid}`);

        // Pill border radius
        await callTool(sid, "set-corner-radius", { id: bid, cornerRadius: 9999 });

        // Fill
        if (v.bgVar) {
            const r = await callTool(sid, "set-fill-variable", { id: bid, variableName: v.bgVar });
            console.log(`  fill-var:`, JSON.stringify(r).slice(0, 80));
        } else {
            await callTool(sid, "set-fill-color", { id: bid, color: "#FFFFFF00" });
        }

        // Stroke for outline
        if (v.strokeVar) {
            const r = await callTool(sid, "set-stroke-variable", { id: bid, variableName: v.strokeVar });
            console.log(`  stroke-var:`, JSON.stringify(r).slice(0, 80));
        }

        // Auto-layout: hug content, padding 2/10
        await callTool(sid, "set-layout", {
            id: bid,
            mode: "HORIZONTAL",
            paddingTop: 2, paddingBottom: 2,
            paddingLeft: 10, paddingRight: 10,
            itemSpacing: 0,
            primaryAxisAlignItems: "CENTER",
            counterAxisAlignItems: "CENTER",
            layoutSizingHorizontal: "HUG",
            layoutSizingVertical: "HUG",
        });

        // Text
        const txt = await callTool(sid, "create-text", {
            parentId: bid,
            text: v.text,
            x: 0, y: 0,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "Work Sans",
            fontColor: toHex(v.tc.r, v.tc.g, v.tc.b),
        });
        console.log(`  text =>`, JSON.stringify(txt).slice(0, 80));

        x += w + gap;
    }

    console.log("\nDone! Tag / Badge created on page 1:2.");
    process.exit(0);
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
