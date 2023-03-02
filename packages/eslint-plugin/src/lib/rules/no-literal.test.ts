import { RuleTester } from "eslint";

import rule from "./no-literal";

const tester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

tester.run("no-literal", rule, {
  valid: [{ code: `let x` }],
  invalid: [
    {
      code: `const x = 1;`,
      errors: [{ message: "😿" }],
    },
  ],
});
