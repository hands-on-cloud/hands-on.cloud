/// <reference types="Cypress" />

describe('Cypress E2E test', function() {
    beforeEach(() => {
        // actual url is "baseUrl" in "cypress.json"
        cy.visit('/')
    })
    
    it('Test main page', function() {
      cy.visit('/')

      cy.get('button[class="mr-2 navbar-toggler"]').click()
      cy.get('ul.navbar-nav>li').should('have.length', 5) // true
      cy.contains('AWS')
      cy.contains('GCP')
      cy.contains('ML')
      cy.contains('Terraform')
      cy.contains('Other')
    })
})