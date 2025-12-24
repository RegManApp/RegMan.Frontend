import fs from "node:fs";
const b = fs.readFileSync(
  new URL("../public/regman-logo.png", import.meta.url)
);
console.log(b.slice(0, 16).toString("hex"));
