import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://192.168.1.101",
        setupNodeEvents(_on, _config) {
            // implement node event listeners here
        },
        supportFile: "cypress/support/e2e.ts",
        specPattern: "cypress/e2e/**/*.cy.ts",
    },
    viewportWidth: 1280,
    viewportHeight: 720,
});
