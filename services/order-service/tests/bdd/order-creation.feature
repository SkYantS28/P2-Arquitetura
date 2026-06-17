Feature: Order creation
  As a student ordering from the campus cafeteria
  I want to create an order
  So that the kitchen queue is updated automatically

  Scenario: Create a fast-track order
    Given the order API is available
    When I submit an order for "Clara" with items:
      | Cafe |
      | Bolo |
    Then the response status should be 201
    And the created order priority should be "FAST_TRACK"
