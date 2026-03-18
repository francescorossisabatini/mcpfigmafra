/**
 * Secret Garden — Design System Components Generator v2
 * Uses Figma variables from the file (get-local-variables) instead of hardcoded hex.
 * Color fills/strokes use set-fill-variable / set-stroke-variable.
 * Text fontColor uses token hex values from secret-garden-tokens.json (source of truth).
 */

const BASE = "http://localhost:38450/mcp";
const PAGE_ID = "1:2";

// ─── Session ────────────────────────────────────────────────────────────────
async function initSession() {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "sg-builder", version: "2.0" } } }),
  });
  const sessionId = res.headers.get("mcp-session-id");
  await res.text();
  await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream", "mcp-session-id": sessionId },
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }),
  });
  console.log("Session:", sessionId);
  return sessionId;
}

let _msgId = 10;
async function call(sessionId, toolName, args) {
  const id = _msgId++;
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream", "mcp-session-id": sessionId },
    body: JSON.stringify({ jsonrpc: "2.0", id, method: "tools/call", params: { name: toolName, arguments: args } }),
  });
  const text = await res.text();
  const dataLine = text.split("\n").find(l => l.startsWith("data:"));
  if (!dataLine) { console.error("No data line for", toolName, text.slice(0, 200)); return null; }
  const json = JSON.parse(dataLine.slice(5));
  if (json.error) { console.error("RPC error calling", toolName, JSON.stringify(json.error)); return null; }
  const content = json.result?.content?.[0]?.text;
  if (!content) return null;
  try {
    const first = JSON.parse(content);
    if (typeof first === "string") return JSON.parse(first);
    return first;
  } catch { return content; }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
async function frame(s, name, x, y, w, h, parentId) {
  const args = { name, x, y, width: w, height: h };
  if (parentId) args.parentId = parentId;
  const r = await call(s, "create-frame", args);
  return r?.id;
}

async function rect(s, name, x, y, w, h, parentId) {
  const args = { name, x, y, width: w, height: h };
  if (parentId) args.parentId = parentId;
  const r = await call(s, "create-rectangle", args);
  return r?.id;
}

async function txt(s, text_str, x, y, opts = {}) {
  const args = {
    text: text_str, x, y,
    fontSize: opts.fontSize || 14,
    fontName: opts.fontName || "Inter",
    fontWeight: opts.fontWeight || 400,
    fontColor: opts.color || "#1A1A1AFF",
    name: opts.name || text_str.slice(0, 30),
  };
  if (opts.parentId) args.parentId = opts.parentId;
  const r = await call(s, "create-text", args);
  return r?.id;
}

// Apply a Figma variable to a node's fill (replaces any hardcoded fill)
async function fillVar(s, id, varName) {
  if (!id) return;
  const r = await call(s, "set-fill-variable", { id, variableName: varName });
  if (!r || r.error) console.warn("  fillVar failed:", varName, "on", id, JSON.stringify(r));
}

// Apply a Figma variable to a node's stroke
async function strokeVar(s, id, varName) {
  if (!id) return;
  const r = await call(s, "set-stroke-variable", { id, variableName: varName });
  if (!r || r.error) console.warn("  strokeVar failed:", varName, "on", id, JSON.stringify(r));
}

// Fallback hex fill (for transparent / no matching variable)
async function fill(s, id, color) { if (id) await call(s, "set-fill-color", { id, color }); }
async function stroke(s, id, color) { if (id) await call(s, "set-stroke-color", { id, color }); }
async function radius(s, id, r) { if (id) await call(s, "set-corner-radius", { id, cornerRadius: r }); }
async function layout(s, id, mode, opts = {}) { if (id) await call(s, "set-layout", { id, mode, ...opts }); }
async function resize(s, id, w, h) { if (id) await call(s, "resize-node", { id, width: w, height: h }); }

// ─── Variable name constants (actual names from get-local-variables) ─────────
const V = {
  // theme collection
  btnPrimaryBg:    "button/primary/background",   // brand primary blue #243260
  btnPrimaryText:  "button/primary/text",          // white
  cardBg:          "card/background",              // card bg #FAF8F4
  cardBorderRadius:"card/borderRadius",            // card radius (FLOAT, cannot use for fill)
  // light collection
  fgDefault:       "fg/default",                   // text primary #1A1A1A
  fgMuted:         "fg/muted",                     // text muted #474747
  fgSubtle:        "fg/subtle",                    // subtle text
  bgDefault:       "bg/default",                   // page bg #F8F6F1
  bgMuted:         "bg/muted",                     // muted bg #F4F1EB
  bgSubtle:        "bg/subtle",                    // subtle bg
  accentDefault:   "accent/default",               // brand accent green #3D661A
  accentBg:        "accent/bg",                    // light accent tint
  // core collection
  white:           "colors/white",
  black:           "colors/black",
  gray200:         "colors/gray/200",              // border / dividers
  gray300:         "colors/gray/300",              // border stronger
  red600:          "colors/red/600",               // destructive
  yellow500:       "colors/yellow/500",            // warning / star
  green100:        "colors/green/100",             // vegan badge bg
  green700:        "colors/green/700",             // vegan text
  teal100:         "colors/teal/100",              // bio badge bg
  teal700:         "colors/teal/700",              // bio text
  orange100:       "colors/orange/100",            // gluten-free badge bg
  orange700:       "colors/orange/700",            // gluten-free text
};

// Text hex colors (from secret-garden-tokens.json — source of truth, not invented)
const T = {
  textPrimary:     "#1A1A1AFF",
  textMuted:       "#474747FF",
  brandPrimary:    "#243260FF",
  brandAccent:     "#3D661AFF",
  white:           "#FFFFFFFF",
  destructive:     "#D31212FF",
  vegan:           "#166534FF",
  glutenFree:      "#92400EFF",
  bio:             "#065F46FF",
  warning:         "#F59F0AFF",
};

// ─── Delete all existing frames on page 1:2 ─────────────────────────────────
async function deleteExistingComponents(s) {
  const pages = await call(s, "get-pages", {});
  let nodes = [];
  if (Array.isArray(pages)) {
    const pg = pages.find(p => p.id === PAGE_ID);
    if (pg) nodes = pg.nodes || [];
  }
  if (nodes.length === 0) { console.log("  No existing nodes to delete."); return; }
  console.log(`  Deleting ${nodes.length} existing nodes...`);
  for (const n of nodes) {
    await call(s, "delete-node", { id: n.id });
  }
  console.log("  Done.");
}

// ─── Component 1: Button ─────────────────────────────────────────────────────
async function createButton(s, startY) {
  const outer = await frame(s, "1. Button", 0, startY, 1000, 260, PAGE_ID);
  await fillVar(s, outer, V.bgDefault);
  await layout(s, outer, "VERTICAL", { paddingLeft: 32, paddingRight: 32, paddingTop: 32, paddingBottom: 32, itemSpacing: 24, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

  await txt(s, "1. Button", 0, 0, { fontSize: 18, fontWeight: 700, color: T.textPrimary, name: "Section title", parentId: outer });

  const row = await frame(s, "Variants", 0, 0, 900, 48, outer);
  await fill(s, row, "#FFFFFF00");
  await layout(s, row, "HORIZONTAL", { itemSpacing: 12, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });

  // Default
  const btnDef = await frame(s, "Button/Default", 0, 0, 160, 40, row);
  await fillVar(s, btnDef, V.btnPrimaryBg);
  await radius(s, btnDef, 6);
  await layout(s, btnDef, "HORIZONTAL", { paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Reserve a Table", 0, 0, { fontSize: 13, fontWeight: 500, color: T.white, parentId: btnDef });

  // Secondary
  const btnSec = await frame(s, "Button/Secondary", 0, 0, 140, 40, row);
  await fillVar(s, btnSec, V.cardBg);
  await radius(s, btnSec, 6);
  await layout(s, btnSec, "HORIZONTAL", { paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Our Menu", 0, 0, { fontSize: 13, fontWeight: 500, color: T.textPrimary, parentId: btnSec });

  // Outline
  const btnOut = await frame(s, "Button/Outline", 0, 0, 140, 40, row);
  await fill(s, btnOut, "#FFFFFF00");
  await strokeVar(s, btnOut, V.gray200);
  await radius(s, btnOut, 6);
  await layout(s, btnOut, "HORIZONTAL", { paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Learn More", 0, 0, { fontSize: 13, fontWeight: 500, color: T.brandPrimary, parentId: btnOut });

  // Ghost
  const btnGhost = await frame(s, "Button/Ghost", 0, 0, 110, 40, row);
  await fill(s, btnGhost, "#FFFFFF00");
  await radius(s, btnGhost, 6);
  await layout(s, btnGhost, "HORIZONTAL", { paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "About Us", 0, 0, { fontSize: 13, fontWeight: 500, color: T.brandPrimary, parentId: btnGhost });

  // Destructive
  const btnDes = await frame(s, "Button/Destructive", 0, 0, 130, 40, row);
  await fillVar(s, btnDes, V.red600);
  await radius(s, btnDes, 6);
  await layout(s, btnDes, "HORIZONTAL", { paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Cancel Order", 0, 0, { fontSize: 13, fontWeight: 500, color: T.white, parentId: btnDes });

  // Link
  const btnLink = await frame(s, "Button/Link", 0, 0, 120, 40, row);
  await fill(s, btnLink, "#FFFFFF00");
  await radius(s, btnLink, 6);
  await layout(s, btnLink, "HORIZONTAL", { paddingLeft: 4, paddingRight: 4, paddingTop: 10, paddingBottom: 10, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "View Details →", 0, 0, { fontSize: 13, fontWeight: 500, color: T.brandPrimary, parentId: btnLink });

  console.log("  ✓ Button");
}

// ─── Component 2: Navigation Bar ─────────────────────────────────────────────
async function createNavBar(s, startY) {
  const outer = await frame(s, "2. Navigation Bar", 0, startY, 1440, 200, PAGE_ID);
  await fillVar(s, outer, V.bgMuted);
  await layout(s, outer, "VERTICAL", { paddingLeft: 0, paddingRight: 0, paddingTop: 32, paddingBottom: 32, itemSpacing: 24, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

  await txt(s, "2. Navigation Bar", 0, 0, { fontSize: 18, fontWeight: 700, color: T.textPrimary, name: "Section title", parentId: outer });

  const nav = await frame(s, "Nav/Desktop", 0, 0, 1440, 64, outer);
  await fillVar(s, nav, V.bgDefault);
  await layout(s, nav, "HORIZONTAL", { paddingLeft: 32, paddingRight: 32, paddingTop: 0, paddingBottom: 0, itemSpacing: 32, counterAxisAlignItems: "CENTER", primaryAxisAlignItems: "MIN", layoutSizingHorizontal: "FIXED", layoutSizingVertical: "FIXED" });

  await txt(s, "My Secret Garden", 0, 0, { fontSize: 20, fontWeight: 700, color: T.brandPrimary, parentId: nav });

  const links = await frame(s, "Nav links", 0, 0, 400, 40, nav);
  await fill(s, links, "#FFFFFF00");
  await layout(s, links, "HORIZONTAL", { itemSpacing: 24, counterAxisAlignItems: "CENTER", paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  for (const lbl of ["Menu", "Story", "Reservations", "Contact"]) {
    await txt(s, lbl, 0, 0, { fontSize: 13, fontWeight: 400, color: T.textPrimary, parentId: links });
  }

  const cta = await frame(s, "CTA", 0, 0, 140, 36, nav);
  await fillVar(s, cta, V.btnPrimaryBg);
  await radius(s, cta, 6);
  await layout(s, cta, "HORIZONTAL", { paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Reserve a Table", 0, 0, { fontSize: 12, fontWeight: 500, color: T.white, parentId: cta });

  console.log("  ✓ Navigation Bar");
}

// ─── Component 3: Badge / Tag ─────────────────────────────────────────────────
async function createBadge(s, startY) {
  const outer = await frame(s, "3. Badge / Tag", 0, startY, 1000, 180, PAGE_ID);
  await fillVar(s, outer, V.bgDefault);
  await layout(s, outer, "VERTICAL", { paddingLeft: 32, paddingRight: 32, paddingTop: 32, paddingBottom: 32, itemSpacing: 20, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

  await txt(s, "3. Badge / Tag", 0, 0, { fontSize: 18, fontWeight: 700, color: T.textPrimary, name: "Section title", parentId: outer });

  const row = await frame(s, "Badge row", 0, 0, 900, 28, outer);
  await fill(s, row, "#FFFFFF00");
  await layout(s, row, "HORIZONTAL", { itemSpacing: 12, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });

  // shadcn variants
  const sDef = await frame(s, "Badge/Default", 0, 0, 70, 24, row);
  await fillVar(s, sDef, V.btnPrimaryBg);
  await radius(s, sDef, 9999);
  await layout(s, sDef, "HORIZONTAL", { paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Default", 0, 0, { fontSize: 11, fontWeight: 600, color: T.white, parentId: sDef });

  const sSec = await frame(s, "Badge/Secondary", 0, 0, 80, 24, row);
  await fillVar(s, sSec, V.cardBg);
  await radius(s, sSec, 9999);
  await layout(s, sSec, "HORIZONTAL", { paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Secondary", 0, 0, { fontSize: 11, fontWeight: 600, color: T.textPrimary, parentId: sSec });

  const sDes = await frame(s, "Badge/Destructive", 0, 0, 80, 24, row);
  await fillVar(s, sDes, V.red600);
  await radius(s, sDes, 9999);
  await layout(s, sDes, "HORIZONTAL", { paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Destructive", 0, 0, { fontSize: 11, fontWeight: 600, color: T.white, parentId: sDes });

  const sOut = await frame(s, "Badge/Outline", 0, 0, 65, 24, row);
  await fill(s, sOut, "#FFFFFF00");
  await strokeVar(s, sOut, V.gray200);
  await radius(s, sOut, 9999);
  await layout(s, sOut, "HORIZONTAL", { paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Outline", 0, 0, { fontSize: 11, fontWeight: 600, color: T.textPrimary, parentId: sOut });

  // Dietary
  const sVegan = await frame(s, "Badge/Vegan", 0, 0, 60, 24, row);
  await fillVar(s, sVegan, V.green100);
  await radius(s, sVegan, 9999);
  await layout(s, sVegan, "HORIZONTAL", { paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Vegan", 0, 0, { fontSize: 11, fontWeight: 600, color: T.vegan, parentId: sVegan });

  const sGluten = await frame(s, "Badge/Gluten-free", 0, 0, 90, 24, row);
  await fillVar(s, sGluten, V.orange100);
  await radius(s, sGluten, 9999);
  await layout(s, sGluten, "HORIZONTAL", { paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Gluten-free", 0, 0, { fontSize: 11, fontWeight: 600, color: T.glutenFree, parentId: sGluten });

  const sBio = await frame(s, "Badge/Bio", 0, 0, 40, 24, row);
  await fillVar(s, sBio, V.teal100);
  await radius(s, sBio, 9999);
  await layout(s, sBio, "HORIZONTAL", { paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Bio", 0, 0, { fontSize: 11, fontWeight: 600, color: T.bio, parentId: sBio });

  console.log("  ✓ Badge/Tag");
}

// ─── Component 4: Today's Dish Card ──────────────────────────────────────────
async function createDishCard(s, startY) {
  const outer = await frame(s, "4. Today's Dish Card", 0, startY, 1000, 360, PAGE_ID);
  await fillVar(s, outer, V.bgDefault);
  await layout(s, outer, "VERTICAL", { paddingLeft: 32, paddingRight: 32, paddingTop: 32, paddingBottom: 32, itemSpacing: 24, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

  await txt(s, "4. Today's Dish Card", 0, 0, { fontSize: 18, fontWeight: 700, color: T.textPrimary, name: "Section title", parentId: outer });

  const card = await frame(s, "DailyMenuCard", 0, 0, 380, 280, outer);
  await fillVar(s, card, V.cardBg);
  await strokeVar(s, card, V.gray200);
  await radius(s, card, 8);
  await layout(s, card, "VERTICAL", { paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, itemSpacing: 16, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

  const deco = await frame(s, "Botanical deco", 0, 0, 48, 48, card);
  await fillVar(s, deco, V.accentBg);
  await radius(s, deco, 24);

  await txt(s, "Piatto del Giorno", 0, 0, { fontSize: 22, fontWeight: 700, color: T.brandPrimary, parentId: card });

  for (const item of ["Risotto ai funghi porcini", "Tagliata di manzo con rucola", "Tiramisù della casa"]) {
    const row = await frame(s, "Item row", 0, 0, 300, 24, card);
    await fill(s, row, "#FFFFFF00");
    await layout(s, row, "HORIZONTAL", { itemSpacing: 8, counterAxisAlignItems: "CENTER", paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
    const bullet = await frame(s, "Bullet", 0, 0, 6, 6, row);
    await fillVar(s, bullet, V.accentDefault);
    await radius(s, bullet, 3);
    await txt(s, item, 0, 0, { fontSize: 14, fontWeight: 400, color: T.textPrimary, parentId: row });
  }

  console.log("  ✓ Today's Dish Card");
}

// ─── Component 5: Classic List Item (Klassiker) ───────────────────────────────
async function createKlassiker(s, startY) {
  const outer = await frame(s, "5. Classic List Item (Klassiker)", 0, startY, 1000, 380, PAGE_ID);
  await fillVar(s, outer, V.bgDefault);
  await layout(s, outer, "VERTICAL", { paddingLeft: 32, paddingRight: 32, paddingTop: 32, paddingBottom: 32, itemSpacing: 24, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

  await txt(s, "5. Classic List Item (Klassiker)", 0, 0, { fontSize: 18, fontWeight: 700, color: T.textPrimary, name: "Section title", parentId: outer });

  const list = await frame(s, "MenuSection/Klassiker", 0, 0, 640, 300, outer);
  await fillVar(s, list, V.cardBg);
  await radius(s, list, 8);
  await layout(s, list, "VERTICAL", { paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 16, itemSpacing: 0, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

  await txt(s, "Antipasti", 0, 0, { fontSize: 15, fontWeight: 700, color: T.brandPrimary, parentId: list });

  const div0 = await rect(s, "Divider", 0, 0, 608, 1, list);
  await fillVar(s, div0, V.gray200);

  const menuItems = [
    { name: "Bruschetta al pomodoro", price: "€ 9,00", badge: "Vegan", bgVar: V.green100, textColor: T.vegan },
    { name: "Tagliere di salumi", price: "€ 14,00", badge: null },
    { name: "Burrata con pesto", price: "€ 12,00", badge: "Bio", bgVar: V.teal100, textColor: T.bio },
  ];

  for (const item of menuItems) {
    const row = await frame(s, "Item: " + item.name, 0, 0, 608, 48, list);
    await fill(s, row, "#FFFFFF00");
    await layout(s, row, "HORIZONTAL", { paddingLeft: 0, paddingRight: 0, paddingTop: 12, paddingBottom: 12, itemSpacing: 8, counterAxisAlignItems: "CENTER", primaryAxisAlignItems: "SPACE_BETWEEN", layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

    await txt(s, item.name, 0, 0, { fontSize: 14, fontWeight: 400, color: T.textPrimary, parentId: row });

    if (item.badge) {
      const badgeF = await frame(s, "Badge/" + item.badge, 0, 0, 50, 20, row);
      await fillVar(s, badgeF, item.bgVar);
      await radius(s, badgeF, 9999);
      await layout(s, badgeF, "HORIZONTAL", { paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
      await txt(s, item.badge, 0, 0, { fontSize: 10, fontWeight: 600, color: item.textColor, parentId: badgeF });
    }

    await txt(s, item.price, 0, 0, { fontSize: 13, fontWeight: 400, color: T.textMuted, parentId: row });

    const div = await rect(s, "Divider", 0, 0, 608, 1, list);
    await fillVar(s, div, V.gray200);
  }

  console.log("  ✓ Classic List Item");
}

// ─── Component 6: Review Card ─────────────────────────────────────────────────
async function createReviewCard(s, startY) {
  const outer = await frame(s, "6. Review Card", 0, startY, 1000, 320, PAGE_ID);
  await fillVar(s, outer, V.bgDefault);
  await layout(s, outer, "VERTICAL", { paddingLeft: 32, paddingRight: 32, paddingTop: 32, paddingBottom: 32, itemSpacing: 24, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

  await txt(s, "6. Review Card", 0, 0, { fontSize: 18, fontWeight: 700, color: T.textPrimary, name: "Section title", parentId: outer });

  const grid = await frame(s, "Review grid", 0, 0, 900, 220, outer);
  await fill(s, grid, "#FFFFFF00");
  await layout(s, grid, "HORIZONTAL", { itemSpacing: 16, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, counterAxisAlignItems: "MIN", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });

  const reviews = [
    { quote: "Un posto magico, cucina autentica e atmosfera straordinaria.", author: "Marco B.", date: "Marzo 2025" },
    { quote: "Il risotto era eccezionale, servizio impeccabile. Torneremo!", author: "Sofia R.", date: "Febbraio 2025" },
    { quote: "Un'esperienza culinaria indimenticabile nel cuore della città.", author: "Luca M.", date: "Gennaio 2025" },
  ];

  for (const r of reviews) {
    const card = await frame(s, "Review Card", 0, 0, 280, 200, grid);
    await fillVar(s, card, V.cardBg);
    await strokeVar(s, card, V.gray200);
    await radius(s, card, 8);
    await layout(s, card, "VERTICAL", { paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, itemSpacing: 12, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG" });

    const stars = await frame(s, "Stars", 0, 0, 100, 16, card);
    await fill(s, stars, "#FFFFFF00");
    await layout(s, stars, "HORIZONTAL", { itemSpacing: 2, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
    for (let i = 0; i < 5; i++) {
      const star = await frame(s, "Star", 0, 0, 14, 14, stars);
      await fillVar(s, star, V.yellow500);
      await radius(s, star, 2);
    }

    await txt(s, '"' + r.quote + '"', 0, 0, { fontSize: 13, fontWeight: 400, color: T.textPrimary, parentId: card });
    await txt(s, r.author, 0, 0, { fontSize: 12, fontWeight: 600, color: T.textPrimary, parentId: card });
    await txt(s, r.date, 0, 0, { fontSize: 11, fontWeight: 400, color: T.textMuted, parentId: card });
  }

  console.log("  ✓ Review Card");
}

// ─── Component 7: Hero Section ────────────────────────────────────────────────
async function createHero(s, startY) {
  const outer = await frame(s, "7. Hero Section", 0, startY, 1440, 520, PAGE_ID);
  await fillVar(s, outer, V.btnPrimaryBg);  // brand primary dark blue as hero bg
  await layout(s, outer, "VERTICAL", { paddingLeft: 80, paddingRight: 80, paddingTop: 120, paddingBottom: 80, itemSpacing: 20, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "FIXED" });

  const statusBadge = await frame(s, "Status Badge — Open", 0, 0, 80, 28, outer);
  await fillVar(s, statusBadge, V.accentDefault);
  await radius(s, statusBadge, 9999);
  await layout(s, statusBadge, "HORIZONTAL", { paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "● Aperto", 0, 0, { fontSize: 12, fontWeight: 600, color: T.white, parentId: statusBadge });

  await txt(s, "My Secret Garden", 0, 0, { fontSize: 64, fontWeight: 700, color: T.white, name: "H1 Title", parentId: outer });
  await txt(s, "Ristorante · Caffè · Giardino segreto", 0, 0, { fontSize: 22, fontWeight: 400, color: "#FFFFFFCC", name: "Subtitle", parentId: outer });

  const ctaRow = await frame(s, "CTA row", 0, 0, 360, 48, outer);
  await fill(s, ctaRow, "#FFFFFF00");
  await layout(s, ctaRow, "HORIZONTAL", { itemSpacing: 12, counterAxisAlignItems: "CENTER", paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });

  const ctaPrimary = await frame(s, "CTA Primary", 0, 0, 180, 48, ctaRow);
  await fillVar(s, ctaPrimary, V.white);
  await radius(s, ctaPrimary, 6);
  await layout(s, ctaPrimary, "HORIZONTAL", { paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Prenota un Tavolo", 0, 0, { fontSize: 14, fontWeight: 600, color: T.brandPrimary, parentId: ctaPrimary });

  const ctaSec = await frame(s, "CTA Secondary", 0, 0, 160, 48, ctaRow);
  await fill(s, ctaSec, "#FFFFFF00");
  await stroke(s, ctaSec, "#FFFFFFAA");
  await radius(s, ctaSec, 6);
  await layout(s, ctaSec, "HORIZONTAL", { paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12, primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER", layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "Scopri il Menu", 0, 0, { fontSize: 14, fontWeight: 500, color: T.white, parentId: ctaSec });

  console.log("  ✓ Hero Section");
}

// ─── Component 8: Generic Section ─────────────────────────────────────────────
async function createGenericSection(s, startY) {
  const outer = await frame(s, "8. Generic Section", 0, startY, 1440, 340, PAGE_ID);
  await fillVar(s, outer, V.bgDefault);
  await layout(s, outer, "VERTICAL", { paddingLeft: 120, paddingRight: 120, paddingTop: 64, paddingBottom: 64, itemSpacing: 16, layoutSizingHorizontal: "FIXED", layoutSizingVertical: "HUG", counterAxisAlignItems: "MIN" });

  await txt(s, "LA NOSTRA STORIA", 0, 0, { fontSize: 11, fontWeight: 500, color: T.textMuted, name: "Section label", parentId: outer });

  const accentLine = await rect(s, "Accent underline", 0, 0, 48, 2, outer);
  await fillVar(s, accentLine, V.accentDefault);

  await txt(s, "Un Giardino Segreto nel Cuore della Città", 0, 0, { fontSize: 36, fontWeight: 700, color: T.textPrimary, name: "H2 Heading", parentId: outer });
  await txt(s, "Benvenuti nel My Secret Garden, un luogo dove la cucina italiana si incontra con la natura. Il nostro ristorante è un rifugio di tranquillità, dove ogni piatto racconta una storia di tradizione e innovazione.", 0, 0, { fontSize: 16, fontWeight: 400, color: T.textMuted, name: "Body text", parentId: outer });

  console.log("  ✓ Generic Section");
}

// ─── Component 9: Footer ──────────────────────────────────────────────────────
async function createFooter(s, startY) {
  const outer = await frame(s, "9. Footer", 0, startY, 1440, 220, PAGE_ID);
  await fillVar(s, outer, V.btnPrimaryBg);
  await layout(s, outer, "HORIZONTAL", { paddingLeft: 80, paddingRight: 80, paddingTop: 48, paddingBottom: 48, itemSpacing: 80, counterAxisAlignItems: "MIN", primaryAxisAlignItems: "SPACE_BETWEEN", layoutSizingHorizontal: "FIXED", layoutSizingVertical: "FIXED" });

  const brand = await frame(s, "Brand block", 0, 0, 240, 120, outer);
  await fill(s, brand, "#FFFFFF00");
  await layout(s, brand, "VERTICAL", { itemSpacing: 8, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  await txt(s, "My Secret Garden", 0, 0, { fontSize: 22, fontWeight: 700, color: T.white, parentId: brand });
  await txt(s, "Ristorante · Caffè · Giardino", 0, 0, { fontSize: 14, fontWeight: 400, color: "#FFFFFFCC", parentId: brand });

  const addr = await frame(s, "Address block", 0, 0, 200, 100, outer);
  await fill(s, addr, "#FFFFFF00");
  await layout(s, addr, "VERTICAL", { itemSpacing: 6, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  for (const line of ["Via della Rosa 12", "20121 Milano", "+39 02 1234 5678"]) {
    await txt(s, line, 0, 0, { fontSize: 13, fontWeight: 400, color: "#FFFFFFB3", parentId: addr });
  }

  const nav = await frame(s, "Footer nav", 0, 0, 200, 100, outer);
  await fill(s, nav, "#FFFFFF00");
  await layout(s, nav, "VERTICAL", { itemSpacing: 8, paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
  for (const lnk of ["Contatti", "Legal", "Privacy", "© 2025 My Secret Garden"]) {
    await txt(s, lnk, 0, 0, { fontSize: 12, fontWeight: 400, color: "#FFFFFFB3", parentId: nav });
  }

  console.log("  ✓ Footer");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Initializing session...");
  const s = await initSession();

  console.log("\nDeleting previous components...");
  await deleteExistingComponents(s);

  const components = [
    { name: "Button",              fn: createButton,         y: 100  },
    { name: "Navigation Bar",      fn: createNavBar,         y: 420  },
    { name: "Badge/Tag",           fn: createBadge,          y: 680  },
    { name: "Today's Dish Card",   fn: createDishCard,       y: 920  },
    { name: "Classic List Item",   fn: createKlassiker,      y: 1360 },
    { name: "Review Card",         fn: createReviewCard,     y: 1820 },
    { name: "Hero Section",        fn: createHero,           y: 2220 },
    { name: "Generic Section",     fn: createGenericSection, y: 2820 },
    { name: "Footer",              fn: createFooter,         y: 3240 },
  ];

  for (const c of components) {
    console.log("\n[" + c.name + "]");
    try { await c.fn(s, c.y); }
    catch (err) { console.error("  ✗ Error:", err.message); }
  }

  console.log("\n✅ All 9 components created with Figma variable bindings on page '1:2'");
}

main().catch(console.error);
