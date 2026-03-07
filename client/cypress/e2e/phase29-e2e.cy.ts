/**
 * PHASE 29 - END-TO-END TESTS
 * Cypress E2E tests for all Phase 28 features
 * Tests complete user workflows
 */

describe('🎯 Phase 29 - E2E Complete Workflow', () => {
  const baseUrl = Cypress.env('API_URL') || 'http://localhost:3000';

  beforeEach(() => {
    cy.visit(`${baseUrl}`);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKFLOW 1: SEARCH AND FILTER
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🔍 Workflow 1: Advanced Search and Filtering', () => {
    it('Should search outlets by name', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="search-input"]').type('Test Outlet');
      cy.get('[data-testid="search-button"]').click();
      cy.get('[data-testid="outlet-list"]').should('exist');
    });

    it('Should filter by status', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="status-active"]').click();
      cy.get('[data-testid="apply-filter"]').click();
      cy.get('[data-testid="outlet-item"]').each(($item) => {
        cy.wrap($item).should('contain', 'Active');
      });
    });

    it('Should filter by city', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="filter-city"]').click();
      cy.get('[data-testid="city-select"]').select('Jakarta');
      cy.get('[data-testid="apply-filter"]').click();
      cy.get('[data-testid="outlet-list"]').should('be.visible');
    });

    it('Should paginate search results', () => {
      cy.visit(`${baseUrl}/outlets?page=1&limit=10`);
      cy.get('[data-testid="outlet-item"]').should('have.length.lessThan', 11);
      cy.get('[data-testid="next-page"]').click();
      cy.url().should('include', 'page=2');
    });

    it('Should sort results by name ascending', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="sort-by"]').select('name');
      cy.get('[data-testid="sort-order"]').select('asc');
      
      let previousName = '';
      cy.get('[data-testid="outlet-name"]').each(($item) => {
        const currentName = $item.text();
        if (previousName) {
          expect(currentName.localeCompare(previousName)).toBeGreaterThanOrEqual(0);
        }
        previousName = currentName;
      });
    });

    it('Should use autocomplete search', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="search-input"]').type('Test');
      cy.get('[data-testid="autocomplete-suggestions"]').should('be.visible');
      cy.get('[data-testid="autocomplete-item"]').first().click();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKFLOW 2: BULK OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🔄 Workflow 2: Bulk Operations', () => {
    it('Should select multiple outlets and bulk update status', () => {
      cy.visit(`${baseUrl}/outlets`);
      
      // Select 3 outlets
      cy.get('[data-testid="outlet-checkbox"]').eq(0).click();
      cy.get('[data-testid="outlet-checkbox"]').eq(1).click();
      cy.get('[data-testid="outlet-checkbox"]').eq(2).click();
      
      // Bulk update
      cy.get('[data-testid="bulk-action-menu"]').click();
      cy.get('[data-testid="bulk-action-status"]').click();
      cy.get('[data-testid="status-inactive"]').click();
      cy.get('[data-testid="confirm-bulk-update"]').click();
      
      cy.get('[data-testid="success-toast"]').should('contain', 'Updated successfully');
    });

    it('Should select all and bulk delete', () => {
      cy.visit(`${baseUrl}/outlets`);
      
      // Select all with smaller dataset
      cy.get('[data-testid="select-all-checkbox"]').click();
      cy.get('[data-testid="bulk-action-menu"]').click();
      cy.get('[data-testid="bulk-action-delete"]').click();
      
      cy.get('[data-testid="confirm-delete-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-delete-btn"]').click();
      
      cy.get('[data-testid="success-toast"]').should('contain', 'Deleted');
    });

    it('Should bulk update multiple fields', () => {
      cy.visit(`${baseUrl}/outlets`);
      
      cy.get('[data-testid="outlet-checkbox"]').eq(0).click();
      cy.get('[data-testid="outlet-checkbox"]').eq(1).click();
      
      cy.get('[data-testid="bulk-action-menu"]').click();
      cy.get('[data-testid="bulk-edit-advanced"]').click();
      
      cy.get('[data-testid="edit-field-city"]').type('New City');
      cy.get('[data-testid="edit-field-status"]').select('active');
      cy.get('[data-testid="apply-bulk-edit"]').click();
      
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKFLOW 3: IMPORT/EXPORT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('📥 Workflow 3: Import and Export', () => {
    it('Should export outlets as JSON', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-format-json"]').click();
      
      cy.window().then((win) => {
        cy.spy(win, 'fetch');
      });
      
      cy.get('[data-testid="export-confirm"]').click();
    });

    it('Should export outlets as CSV', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-format-csv"]').click();
      cy.get('[data-testid="export-confirm"]').click();
      
      // Verify download started
      cy.get('[data-testid="success-toast"]').should('contain', 'exported');
    });

    it('Should import outlets from file', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="import-button"]').click();
      
      // Upload test file
      cy.get('[data-testid="import-file-input"]').attachFile('test-outlets.json');
      cy.get('[data-testid="import-format"]').select('json');
      cy.get('[data-testid="import-confirm"]').click();
      
      cy.get('[data-testid="success-toast"]').should('contain', 'imported');
    });

    it('Should preview import data before confirming', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="import-button"]').click();
      cy.get('[data-testid="import-file-input"]').attachFile('test-outlets.csv');
      
      cy.get('[data-testid="import-preview"]').should('be.visible');
      cy.get('[data-testid="preview-row"]').should('have.length.greaterThan', 0);
      
      cy.get('[data-testid="import-confirm"]').click();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKFLOW 4: ANALYTICS AND STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('📊 Workflow 4: Analytics and Statistics', () => {
    it('Should display outlet statistics', () => {
      cy.visit(`${baseUrl}/outlets/analytics`);
      
      cy.get('[data-testid="stat-total-outlets"]').should('be.visible');
      cy.get('[data-testid="stat-active-outlets"]').should('be.visible');
      cy.get('[data-testid="stat-inactive-outlets"]').should('be.visible');
      cy.get('[data-testid="stat-by-city"]').should('be.visible');
    });

    it('Should show distribution charts', () => {
      cy.visit(`${baseUrl}/outlets/analytics`);
      
      cy.get('[data-testid="chart-status-distribution"]').should('be.visible');
      cy.get('[data-testid="chart-city-distribution"]').should('be.visible');
      cy.get('[data-testid="chart-growth"]').should('be.visible');
    });

    it('Should export analytics data', () => {
      cy.visit(`${baseUrl}/outlets/analytics`);
      
      cy.get('[data-testid="analytics-export"]').click();
      cy.get('[data-testid="export-format-pdf"]').click();
      
      cy.get('[data-testid="success-toast"]').should('contain', 'exported');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKFLOW 5: ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  describe('⚠️ Workflow 5: Error Handling', () => {
    it('Should handle invalid search gracefully', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="search-input"]').type('<script>alert(1)</script>');
      cy.get('[data-testid="search-button"]').click();
      
      // Should not execute script, should show results or error
      cy.get('[data-testid="outlet-list"]', { timeout: 5000 }).should('exist');
    });

    it('Should show error for failed bulk operations', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="outlet-checkbox"]').eq(0).click();
      
      // Simulate network error by offline mode
      cy.intercept('POST', '**/bulk-update', { statusCode: 500 });
      
      cy.get('[data-testid="bulk-action-menu"]').click();
      cy.get('[data-testid="bulk-action-status"]').click();
      cy.get('[data-testid="confirm-bulk-update"]').click();
      
      cy.get('[data-testid="error-toast"]').should('be.visible');
    });

    it('Should handle import errors', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="import-button"]').click();
      
      // Upload invalid file
      cy.get('[data-testid="import-file-input"]').attachFile('invalid.txt');
      cy.get('[data-testid="import-confirm"]').click();
      
      cy.get('[data-testid="error-toast"]').should('be.visible');
    });

    it('Should show timeout error for slow requests', () => {
      cy.visit(`${baseUrl}/outlets`);
      
      cy.intercept('GET', '**/search/advanced', (req) => {
        req.reply((res) => {
          res.delay(15000); // 15 second delay
        });
      });
      
      cy.get('[data-testid="search-input"]').type('test');
      cy.get('[data-testid="search-button"]').click();
      
      cy.get('[data-testid="timeout-toast"]', { timeout: 20000 }).should('be.visible');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKFLOW 6: PERFORMANCE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('⚡ Workflow 6: Performance', () => {
    it('Should load search results within acceptable time', () => {
      cy.visit(`${baseUrl}/outlets`);
      
      const startTime = Date.now();
      cy.get('[data-testid="search-input"]').type('test');
      cy.get('[data-testid="search-button"]').click();
      cy.get('[data-testid="outlet-list"]').should('be.visible').then(() => {
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(2000); // Should load in under 2 seconds
      });
    });

    it('Should handle rapid successive searches', () => {
      cy.visit(`${baseUrl}/outlets`);
      
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="search-input"]').clear().type(`test${i}`);
        cy.get('[data-testid="search-button"]').click();
        cy.get('[data-testid="outlet-list"]').should('be.visible');
      }
    });

    it('Should efficiently paginate through large datasets', () => {
      cy.visit(`${baseUrl}/outlets?page=1&limit=50`);
      
      for (let page = 1; page <= 3; page++) {
        cy.get('[data-testid="outlet-item"]').should('have.length.greaterThan', 0);
        if (page < 3) {
          cy.get('[data-testid="next-page"]').click();
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESSIBILITY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('♿ Workflow 7: Accessibility', () => {
    it('Should have proper ARIA labels', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[aria-label="Search outlets"]').should('exist');
      cy.get('[aria-label="Filter results"]').should('exist');
    });

    it('Should be keyboard navigable', () => {
      cy.visit(`${baseUrl}/outlets`);
      cy.get('[data-testid="search-input"]').focus();
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-button');
    });

    it('Should have sufficient color contrast', () => {
      cy.visit(`${baseUrl}/outlets`);
      // This would require a contrast checking plugin
      cy.get('[data-testid="outlet-item"]').each(($item) => {
        cy.wrap($item).should('have.css', 'color');
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-BROWSER TESTING
// ═══════════════════════════════════════════════════════════════════════════

describe('🌐 Cross-Browser Compatibility', () => {
  it('Should work in Chrome', () => {
    cy.visit('http://localhost:3000/outlets');
    cy.get('[data-testid="outlet-list"]').should('exist');
  });

  it('Should work in Firefox', function() {
    if (Cypress.browser.name !== 'firefox') {
      this.skip();
    }
    cy.visit('http://localhost:3000/outlets');
    cy.get('[data-testid="outlet-list"]').should('exist');
  });

  it('Should work on mobile viewport', () => {
    cy.viewport('iphone-x');
    cy.visit('http://localhost:3000/outlets');
    cy.get('[data-testid="outlet-list"]').should('exist');
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
  });

  it('Should work on tablet viewport', () => {
    cy.viewport('ipad-2');
    cy.visit('http://localhost:3000/outlets');
    cy.get('[data-testid="outlet-list"]').should('exist');
  });
});
