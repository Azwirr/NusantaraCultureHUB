import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// CLAUDE.md: user-entered text is rendered as plain text, never as HTML.
const rawHtmlMessage =
  "Writes raw HTML into the DOM. Render text through React instead (CLAUDE.md: never render user text as HTML).";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The only allowed exception is the constant theme bootstrap in
      // src/components/theme-script.tsx, disabled inline with a reason.
      "react/no-danger": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "AssignmentExpression > MemberExpression.left[property.name=/^(innerHTML|outerHTML)$/]",
          message: rawHtmlMessage,
        },
        {
          selector:
            "AssignmentExpression > MemberExpression.left[computed=true][property.value=/^(innerHTML|outerHTML)$/]",
          message: rawHtmlMessage,
        },
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: rawHtmlMessage,
        },
        {
          selector: "CallExpression[callee.object.name='document'][callee.property.name=/^(write|writeln)$/]",
          message: rawHtmlMessage,
        },
      ],
      "no-restricted-properties": [
        "error",
        { object: "document", property: "write", message: rawHtmlMessage },
        { object: "document", property: "writeln", message: rawHtmlMessage },
        { property: "insertAdjacentHTML", message: rawHtmlMessage },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude Code skills and settings: tooling, not app code.
    ".claude/**",
  ]),
]);

export default eslintConfig;
