import fs from "fs";
import path from "path";

const targetDir = path.resolve("./src/components/ui");

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Match both "import React from 'react'" and "import * as React from 'react'"
  const reactImports = content.match(/import\s+(?:\* as )?React\s+from\s+['"]react['"];?/g);

  if (reactImports && reactImports.length > 1) {
    console.log(`Fixing duplicates in: ${filePath}`);

    // Keep the first import, remove all others
    const fixed = content.replace(
      /(?:import\s+(?:\* as )?React\s+from\s+['"]react['"];?\s*)+/,
      reactImports[0] + "\n"
    );

    fs.writeFileSync(filePath, fixed, "utf8");
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      fixFile(fullPath);
    }
  }
}

walkDir(targetDir);
console.log("✅ Finished cleaning duplicate React imports.");
