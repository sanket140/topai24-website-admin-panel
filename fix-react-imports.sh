#!/bin/bash

# Scan all .tsx files inside src/components/ui and fix duplicate React imports
find src/components/ui -type f -name "*.tsx" | while read -r file; do
  echo "Fixing $file"

  # 1. Remove ALL React imports
  sed -i '/import React from "react"/d' "$file"
  sed -i '/import \* as React from "react"/d' "$file"

  # 2. Add the correct one at the very top (if not already there)
  # Check if file already starts with it
  if ! grep -q '^import \* as React from "react"' "$file"; then
    sed -i '1s;^;import * as React from "react"\n;' "$file"
  fi
done

echo "✅ All React imports normalized to: import * as React from \"react\""
