# Source guide

All source trees are local under `libraries/`, at the commits recorded in `catalog/*.json`. They are source snapshots, not packaged releases. Inspect package manifests and the actual component implementation before use.

| Source | What is actually included | Best use | Caution |
| --- | --- | --- | --- |
| awesome-react-components | Link directory | Discover alternatives by component category | Listed projects are not bundled and retain their own licenses. |
| awesome-fastapi | Link directory | Discover backend examples | Listed projects are not bundled and retain their own licenses. |
| mantine | Full monorepo | Consistent React UI system, hooks, forms, charts, dates | Choose as a system; check package peer dependencies and styles. |
| mantine-ui | Full site source and more than 120 example components | Adapt page sections and component compositions | README asserts MIT, but this snapshot has no root LICENSE file; verify terms before redistribution. |
| full-stack-fastapi-template | Full template | Study FastAPI, SQLModel, Alembic, React, Docker structure | Use as architectural reference, not a drop-in replacement for an existing app. |
| shadcn-ui | Full monorepo and component registry | Adapt component source into a chosen UI system | Registry variants use workspace aliases such as `@/registry` and `cn`; resolve them to target-project files. Extra packages vary by component. |
| tanstack-table | Full monorepo with React examples | Table state, sorting, filtering, pagination | Headless logic; styling and accessible markup remain the app's responsibility. |
| react-aria | Full React Spectrum monorepo | Accessible interaction primitives and components | Large source tree; select specific package and check required styles. |
| radix-primitives | Full primitives monorepo | Accessible dialogs, menus, popovers, form controls | Unstyled primitives; app must provide visual design. |
| react-hook-form | Full source and examples | Form state and validation integration | Validation schema is a separate choice. |
| material-ui | Full MUI monorepo, Material components and documentation demos | Large set of production UI components and varied usage examples | Demos may include surrounding site utilities; install public packages rather than copying internals. |
| ant-design | Full Ant Design monorepo with component demos | Enterprise forms, tables, navigation and data display | Demos are examples, not standalone packages; inspect locale and styling setup. |
| primereact | Full PrimeReact source | Broad packaged components including rich-text editor | Editor uses Quill; inspect generated HTML and sanitize on the server. |
| tiptap | Full Tiptap monorepo and React demos | Extensible rich-text editor and individual extensions | Choose only needed extensions and define saved document format. |
| xyflow | Full XYFlow source and React examples | Flow diagrams and interactive node editors | Examples are patterns; data model, persistence and accessibility need project design. |
| chakra-ui | Full Chakra UI monorepo | Themed React components and layout primitives | Adopt as a coherent UI system rather than mixing indiscriminately with others. |

## Choice rules

For a consistent UI redesign, compare Mantine against shadcn/ui before mixing systems. For unstyled accessible interactions, compare React Aria and Radix on the exact component and keyboard behavior. TanStack Table complements a UI system for complex table logic. React Hook Form complements a UI system for complex form state. Do not propose a catalog directory as directly reusable component code.

Tags generated from names are for discovery. They do not establish runtime compatibility, accessibility conformance, or maintainability. Verify these in the target application when proposing a concrete choice.
