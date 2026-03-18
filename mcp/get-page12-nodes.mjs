const SID = "6375167a-1147-45af-a5f9-e4af6c814ff5";
const res = await fetch("http://localhost:38450/mcp", {
  method: "POST",
  headers: {"Content-Type":"application/json","Accept":"application/json, text/event-stream","mcp-session-id": SID},
  body: JSON.stringify({jsonrpc:"2.0",id:20,method:"tools/call",params:{name:"get-pages",arguments:{}}})
});
const text = await res.text();
const dataLine = text.split("\n").find(l => l.startsWith("data:"));
const j = JSON.parse(dataLine.slice(5));
const raw = j.result.content[0].text;
const p1 = JSON.parse(raw);
const pages = typeof p1 === "string" ? JSON.parse(p1) : p1;
const pg = pages.find(p => p.id === "1:2");
if (pg) pg.nodes.forEach(n => console.log(n.id, n.name));
