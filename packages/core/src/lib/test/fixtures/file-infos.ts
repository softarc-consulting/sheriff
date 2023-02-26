import FileInfo from "../../file-info/file-info";

export const angularCliValid: FileInfo = {
  path: "src/app/app.component",
  imports: [
    {
      path: "src/app/customers/index.ts",
      imports: [
        {
          path: "src/app/customers/customer.component.ts",
          imports: [],
        },
      ],
    },
    {
      path: "src/app/holidays/index.ts",
      imports: [
        {
          path: "src/app/holidays/holiday.component.ts",
          imports: [],
        },
      ],
    },
  ],
};
