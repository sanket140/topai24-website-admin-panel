import fs from "fs";
import path from "path";

const rootDir = path.resolve("./src");

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Remove *all* React imports (default + namespace)
  const fixed = content.replace(
    /^\s*import\s+(?:\* as )?React(?:,.*)?\s+from\s+['"]react['"];?\s*\n?/gm,
    ""
  );

  if (fixed !== content) {
    console.log(`🧹 Cleaned: ${filePath}`);
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

walkDir(rootDir);
console.log("✅ Finished cleaning React imports across src/");
