describe('Advanced Outlet Features E2E', () => {
  beforeEach(() => {
    cy.login({ email: 'admin@test.com', password: 'password123' });
    cy.visit('/outlets');
  });

  describe('Bulk Operations', () => {
    it('should perform bulk update', () => {
      cy.get('[data-cy=outlet-checkbox]:first').click();
      cy.get('[data-cy=outlet-checkbox]:nth(1)').click();
      cy.get('[data-cy=bulk-update-btn]').click();
      cy.get('[data-cy=update-modal]').should('be.visible');
      cy.get('[data-cy=update-name]').type('Updated Name');
      cy.get('[data-cy=submit-btn]').click();
      cy.get('[data-cy=success-toast]').should('contain', 'Berhasil');
    });

    it('should perform bulk delete', () => {
      cy.get('[data-cy=outlet-checkbox]:first').click();
      cy.get('[data-cy=bulk-delete-btn]').click();
      cy.get('[data-cy=confirm-delete]').click();
      cy.get('[data-cy=success-toast]').should('contain', 'Terhapus');
    });

    it('should show error on bulk operation limit exceeded', () => {
      for (let i = 0; i < 101; i++) {
        cy.get(`[data-cy=outlet-checkbox-${i}]`).click({ force: true });
      }
      cy.get('[data-cy=bulk-update-btn]').click();
      cy.get('[data-cy=error-toast]').should('contain', 'maksimal 100');
    });
  });

  describe('Search & Filter', () => {
    it('should filter by name', () => {
      cy.get('[data-cy=search-input]').type('Restaurant A');
      cy.get('[data-cy=search-btn]').click();
      cy.get('[data-cy=outlet-list]').should('contain', 'Restaurant A');
    });

    it('should filter by status', () => {
      cy.get('[data-cy=status-filter]').select('Active');
      cy.get('[data-cy=search-btn]').click();
      cy.get('[data-cy=outlet-item]').each(item => {
        cy.wrap(item).should('contain', 'Active');
      });
    });

    it('should show statistics', () => {
      cy.get('[data-cy=statistics-btn]').click();
      cy.get('[data-cy=total-outlets]').should('be.visible');
      cy.get('[data-cy=active-outlets]').should('be.visible');
      cy.get('[data-cy=inactive-outlets]').should('be.visible');
    });

    it('should provide autocomplete', () => {
      cy.get('[data-cy=search-input]').type('rest');
      cy.get('[data-cy=autocomplete-list]').should('be.visible');
      cy.get('[data-cy=autocomplete-item]:first').click();
      cy.get('[data-cy=search-input]').should('have.value', 'Restaurant');
    });
  });

  describe('Import/Export', () => {
    it('should export as CSV', () => {
      cy.get('[data-cy=export-btn]').click();
      cy.get('[data-cy=export-csv]').click();
      cy.readFile('cypress/downloads/outlets-*.csv').should('exist');
    });

    it('should export as JSON', () => {
      cy.get('[data-cy=export-btn]').click();
      cy.get('[data-cy=export-json]').click();
      cy.readFile('cypress/downloads/outlets-*.json').should('exist');
    });

    it('should import CSV', () => {
      cy.get('[data-cy=import-btn]').click();
      cy.get('[data-cy=file-input]').attachFile('outlets.csv');
      cy.get('[data-cy=submit-btn]').click();
      cy.get('[data-cy=import-results]').should('contain', 'berhasil');
    });
  });

  describe('Security', () => {
    it('should prevent XSS injection', () => {
      cy.get('[data-cy=create-outlet-btn]').click();
      cy.get('[data-cy=name-input]').type('<script>alert("xss")</script>');
      cy.get('[data-cy=submit-btn]').click();
      cy.get('[data-cy=error-toast]').should('be.visible');
    });

    it('should rate limit rapid requests', () => {
      for (let i = 0; i < 50; i++) {
        cy.get('[data-cy=search-btn]').click({ force: true });
      }
      cy.get('[data-cy=rate-limit-error]').should('contain', 'Terlalu banyak');
    });
  });

  describe('Monitoring', () => {
    it('should display metrics dashboard', () => {
      cy.get('[data-cy=metrics-btn]').click();
      cy.get('[data-cy=requests-count]').should('be.visible');
      cy.get('[data-cy=error-rate]').should('be.visible');
      cy.get('[data-cy=response-time]').should('be.visible');
    });

    it('should track action performance', () => {
      const start = Date.now();
      cy.get('[data-cy=search-btn]').click();
      cy.get('[data-cy=outlet-list]').should('be.visible');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Performance', () => {
    it('should load large datasets quickly', () => {
      cy.get('[data-cy=load-test-btn]').click();
      cy.get('[data-cy=status]').should('contain', 'Loading 1000 items...');
      cy.get('[data-cy=outlet-list]').should('contain', '1000 outlets', { timeout: 5000 });
    });

    it('should paginate efficiently', () => {
      cy.get('[data-cy=pagination-next]').click();
      cy.get('[data-cy=page-indicator]').should('contain', '2');
      cy.get('[data-cy=outlet-list]').should('be.visible');
    });
  });
});
