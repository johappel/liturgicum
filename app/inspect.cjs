const fs = require("fs");
const t = fs.readFileSync("src/dashboard/RoomSettings.tsx", "utf8");
function dump(label, anchor, n){
  const i = t.indexOf(anchor);
  if(i<0){ return label+": NOT FOUND"; }
  const seg = t.slice(i, i+n);
  let out = "";
  for(const ch of seg){ const c = ch.codePointAt(0); out += (c<32||c>126)?("<U+"+c.toString(16).toUpperCase()+">"):ch; }
  return label+": "+out;
}
const res = [
  dump("arrow","Gespeichert ",18),
  dump("klaenge","Ambiente-Kl",16),
  dump("dirty","status dirty\">",12),
  dump("warn","status err\">",10)
].join("\n");
fs.writeFileSync("inspect-out.txt", res, "utf8");
