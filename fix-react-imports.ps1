$srcPath = "src"

Get-ChildItem -Path $srcPath -Recurse -Include *.tsx, *.ts | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content

    # If file contains JSX (<Something) or uses React.
    if ($newContent -match "<[A-Z]" -or $newContent -match "React\.") {
        # Check if it already has "import * as React from 'react'"
        if ($newContent -notmatch 'import\s+\*\s+as\s+React\s+from\s+["'']react["'']') {
            $newContent = "import * as React from 'react';`r`n" + $newContent
        }
    }

    if ($newContent -ne $content) {
        Set-Content -Path $_.FullName -Value $newContent -Encoding UTF8
        Write-Output "Fixed imports in: $($_.FullName)"
    }
}
