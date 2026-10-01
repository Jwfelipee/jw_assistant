## ADDED Requirements

### Requirement: Public link toggles are stored in congregation settings
The system SHALL persist four boolean settings on the singleton congregation settings row: `publicLinkCurrentWeekEnabled`, `publicLinkNextWeekEnabled`, `publicLinkCurrentMonthEnabled`, and `publicLinkNextMonthEnabled`, each defaulting to `true`.

#### Scenario: New installation defaults
- **WHEN** congregation settings are first created
- **THEN** all four public link toggles are enabled

### Requirement: Authenticated user can read and update public link toggles
The system SHALL include the four public link enabled flags in `GET /settings` and accept them in `PATCH /settings` for the authenticated operator.

#### Scenario: Disable next month link
- **WHEN** the operator sets `publicLinkNextMonthEnabled` to false and saves settings
- **THEN** subsequent `GET /settings` returns the updated flag and `/proximo-mes` no longer exposes data

#### Scenario: Re-enable link
- **WHEN** the operator sets a previously disabled flag back to true
- **THEN** the corresponding public URL becomes accessible again
