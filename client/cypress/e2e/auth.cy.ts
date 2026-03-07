describe('Authentication Flow', () => {
    it('should load login page', () => {
        cy.visit('/login')
        cy.contains('Selamat Datang Kembali')
        cy.get('input#email').should('be.visible')
    })

    it('should toggle password visibility', () => {
        cy.visit('/login')
        cy.get('input#password').type('password123')
        cy.get('input#password').should('have.attr', 'type', 'password')

        // Click toggle button
        cy.get('button[aria-label="Show password"]').click()
        cy.get('input#password').should('have.attr', 'type', 'text')

        // Click again
        cy.get('button[aria-label="Hide password"]').click()
        cy.get('input#password').should('have.attr', 'type', 'password')
    })

    // Note: We avoid mocking full login as it requires backend, but we can test validation
    it('should show error for empty fields', () => {
        cy.visit('/login')
        cy.get('button[type="submit"]').click()
        // Looking for HTML5 validation or toast
        // The current implementation uses HTML5 'required' attribute
        cy.get('input#email:invalid').should('exist')
    })
})
