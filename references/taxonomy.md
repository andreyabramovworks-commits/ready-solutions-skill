# Tag facets

Each solution must have at least one tag from `task`, `domain`, `layer`, `kind`, `property`, `adoption`, `cost`, and `license`. `rtm_area` is optional and must never be used as the only domain description.

- task: the user need, such as `forms`, `data-table`, `permissions`, `editor`, `analytics`, `auth`.
- domain: reusable product context. Use `general-purpose` when the code itself does not justify a narrower domain; do not infer `education` or `enterprise` merely from a possible example use.
- rtm_area: optional RTM-specific context.
- layer: applicable technologies, not a claim of compatibility with every version.
- kind: `library`, `component`, `pattern`, `template`, `example`, `tool`.
- property: behavior such as `accessible`, `keyboard`, `responsive`, `server-side`.
- adoption: `dependency`, `copy-and-adapt`, `reference-only`.
- cost: relative integration or runtime weight; verify in the target project.
- license: source license identifier, independently verified before reuse.

Search Russian synonyms in the query layer; store canonical English tags. Do not label a solution as compatible with a target app before inspecting that app.

`entry_role` is a separate classification, not a tag: component source, copyable example, public API, public primitive, working example, architecture example, support package, library internals, or link directory. Link directories are not locally bundled implementations of the projects they list.
