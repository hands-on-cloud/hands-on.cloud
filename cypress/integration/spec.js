/// <reference types="Cypress" />

describe('Cypress E2E test', function() {
    beforeEach(() => {
        // actual url is "baseUrl" in "cypress.json"
        cy.visit('/')
    })
    
    it('Test main page', function() {
      cy.visit('/')

      cy.contains('AWS')
      cy.contains('GCP')
      cy.contains('DEVOPS')
      cy.contains('MACHINE-LEARNING')
    })
})