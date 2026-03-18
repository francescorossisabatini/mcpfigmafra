import http from "http";

const HOST = "127.0.0.1", PORT = 38450, PATH = "/mcp";

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
            let buf = "";
            const done = (data) => { res.destroy(); resolve({ sessionId: sid, data }); };
            res.on("data", (chunk) => {
                buf += chunk.toString();
                for (const line of buf.split("\n")) {
                    if (line.trim().startsWith("data: ")) {
                        try { done(JSON.parse(line.trim().slice(6))); return; } catch {}
                    }
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
    const res = await postMCP(sid, {
        jsonrpc: "2.0", id: Math.floor(Math.random() * 99999),
        method: "tools/call", params: { name, arguments: args }
    });
    if (res.data?.timeout) { console.warn(`  [TIMEOUT] ${name}`); return null; }
    const text = res.data?.result?.content?.[0]?.text;
    if (text !== undefined) return parseContent(text);
    if (res.data?.error) { console.warn(`  [ERR] ${name}:`, res.data.error.message); return null; }
    return res.data;
}

// ── Specs ──────────────────────────────────────────────────────────────────

const VARIANTS = [
    {
        name: "Default",
        label: "Reserve a Table",
        bgVar: "button/primary/background",  // #243260
        strokeVar: null,
        textColor: "#FFFFFFFF",
        transparentFill: false,
    },
    {
        name: "Secondary",
        label: "Our Menu",
        bgVar: "card/background",
        strokeVar: null,
        textColor: "#243260FF",
        transparentFill: false,
    },
    {
        name: "Outline",
        label: "Learn More",
        bgVar: null,
        strokeVar: "colors/gray/200",        // border.default
        textColor: "#243260FF",
        transparentFill: true,
    },
    {
        name: "Ghost",
        label: "View Details",
        bgVar: null,
        strokeVar: null,
        textColor: "#243260FF",
        transparentFill: true,
    },
];

// padding: first value = left/right, second = top/bottom
const SIZES = [
    { name: "sm", h: 36, pLR: 12, pTB: 8,  font: 14, weight: 500 },
    { name: "md", h: 40, pLR: 16, pTB: 10, font: 14, weight: 500 },
    { name: "lg", h: 44, pLR: 32, pTB: 12, font: 16, weight: 500 },
];

// ── Entry ──────────────────────────────────────────────────────────────────

async function main() {
    const init = await postMCP(null, {
        jsonrpc: "2.0", id: 1, method: "initialize",
        params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "button-builder", version: "1" } }
    });
    const sid = init.sessionId;
    console.log("Session:", sid);
    if (!sid) { console.error("No session"); process.exit(1); }
    postMCP(sid, { jsonrpc: "2.0", method: "notifications/initialized", params: {} }).catch(() => {});
    await new Promise(r => setTimeout(r, 300));

    const PAGE = "1:2";
    const gapVariant = 12;   // horizontal gap between variant columns
    const gapSize = 20;      // vertical gap between size rows
    const containerPad = 32;

    // ── Delete leftover "Button" frames from previous runs ────────────────
    const pageInfo = await callTool(sid, "get-node-info", { id: PAGE });
    const existing = pageInfo?.children || [];
    for (const n of existing) {
        if (n.name === "Button") {
            console.log("Deleting old frame:", n.id, n.name);
            await callTool(sid, "delete-node", { id: n.id });
        }
    }

    // ── Estimate container size ────────────────────────────────────────────
    // For HUG layout, Figma will resize. Create with rough estimate.
    const approxBtnWidths = { "Default": 142, "Secondary": 90, "Outline": 100, "Ghost": 98 };
    const totalW = Object.values(approxBtnWidths).reduce((a, b) => a + b, 0)
        + gapVariant * (VARIANTS.length - 1) + containerPad * 2;
    const totalH = SIZES.reduce((a, s) => a + s.h, 0)
        + gapSize * (SIZES.length - 1) + containerPad * 2;

    // ── Outer container ────────────────────────────────────────────────────
    console.log("\nCreating Button container...");
    const outer = await callTool(sid, "create-frame", {
        parentId: PAGE, name: "Button",
        x: 100, y: 100, width: totalW, height: totalH,
    });
    const outerId = outer?.id || outer?.nodeId;
    console.log("Outer:", outerId);
    if (!outerId) { console.error("Failed outer"); process.exit(1); }

    await callTool(sid, "set-fill-color", { id: outerId, color: "#F8F6F1FF" });
    await callTool(sid, "set-layout", {
        id: outerId,
        mode: "VERTICAL",
        paddingTop: containerPad, paddingBottom: containerPad,
        paddingLeft: containerPad, paddingRight: containerPad,
        itemSpacing: gapSize,
        primaryAxisAlignItems: "MIN",
        counterAxisAlignItems: "MIN",
        layoutSizingHorizontal: "HUG",
        layoutSizingVertical: "HUG",
    });

    // ── Build size rows ────────────────────────────────────────────────────
    for (const size of SIZES) {
        console.log(`\n── Size: ${size.name} ──`);

        // Row frame
        const row = await callTool(sid, "create-frame", {
            parentId: outerId,
            name: `Row / ${size.name}`,
            x: 0, y: 0,
            width: totalW - containerPad * 2,
            height: size.h,
        });
        const rowId = row?.id || row?.nodeId;
        if (!rowId) { console.error("Row failed"); continue; }

        await callTool(sid, "set-fill-color", { id: rowId, color: "#00000000" });
        await callTool(sid, "set-layout", {
            id: rowId,
            mode: "HORIZONTAL",
            paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0,
            itemSpacing: gapVariant,
            primaryAxisAlignItems: "MIN",
            counterAxisAlignItems: "CENTER",
            layoutSizingHorizontal: "HUG",
            layoutSizingVertical: "HUG",
        });

        // ── Variant buttons ────────────────────────────────────────────────
        for (const v of VARIANTS) {
            console.log(`  Button: ${v.name}/${size.name}`);

            // Estimate width based on label length + padding
            const approxTextW = v.label.length * (size.font * 0.55);
            const approxW = Math.ceil(approxTextW) + size.pLR * 2;

            const btn = await callTool(sid, "create-frame", {
                parentId: rowId,
                name: `Button / ${v.name} / ${size.name}`,
                x: 0, y: 0,
                width: approxW,
                height: size.h,
            });
            const btnId = btn?.id || btn?.nodeId;
            if (!btnId) { console.error(`  Failed btn ${v.name}/${size.name}`); continue; }

            // Border radius: radius.lg = 8px
            await callTool(sid, "set-corner-radius", { id: btnId, cornerRadius: 8 });

            // Fill
            if (v.bgVar) {
                await callTool(sid, "set-fill-variable", { id: btnId, variableName: v.bgVar });
            } else {
                await callTool(sid, "set-fill-color", { id: btnId, color: "#00000000" });
            }

            // Stroke
            if (v.strokeVar) {
                await callTool(sid, "set-stroke-variable", { id: btnId, variableName: v.strokeVar });
            }

            // Auto-layout: horizontal, centered, HUG both
            await callTool(sid, "set-layout", {
                id: btnId,
                mode: "HORIZONTAL",
                paddingTop: size.pTB, paddingBottom: size.pTB,
                paddingLeft: size.pLR, paddingRight: size.pLR,
                itemSpacing: 0,
                primaryAxisAlignItems: "CENTER",
                counterAxisAlignItems: "CENTER",
                layoutSizingHorizontal: "HUG",
                layoutSizingVertical: "HUG",
            });

            // Label
            const txt = await callTool(sid, "create-text", {
                parentId: btnId,
                text: v.label,
                x: 0, y: 0,
                fontSize: size.font,
                fontWeight: size.weight,
                fontFamily: "Work Sans",
                fontColor: v.textColor,
            });
            console.log(`    text: ${txt?.id || "err"}`);
        }
    }

    console.log("\nDone! Button component created on page 1:2.");
    process.exit(0);
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
