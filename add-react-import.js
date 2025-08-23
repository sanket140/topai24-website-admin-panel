export default function transformer(fileInfo, api) {
  const j = api.jscodeshift
  const root = j(fileInfo.source)

  // Skip if already has React import
  const hasReactImport = root.find(j.ImportDeclaration, {
    source: { value: "react" }
  }).size() > 0

  if (!hasReactImport) {
    // Insert at top
    root.get().node.program.body.unshift(
      j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier("React"))],
        j.literal("react")
      )
    )
  }

  return root.toSource({ quote: "double" })
}
