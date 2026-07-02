# Agent Instructions

- Always use the `graphify` skill for codebase, architecture, research, dependency, documentation, or cross-file understanding tasks. Prefer existing `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` before broad manual exploration. Rebuild or update the graph with `/graphify` when the graph is missing, stale, or the task needs fresh relationships.
- Always use caveman skills and caveman-style compression by default for reviews, commits, summaries, memory compression, and other tasks where a caveman skill applies. Keep output terse and high-signal unless the user asks for normal prose or says `stop caveman`.
- Do not overwrite or clean up `graphify-out/` artifacts unless the task specifically requires a graph refresh or cleanup.
