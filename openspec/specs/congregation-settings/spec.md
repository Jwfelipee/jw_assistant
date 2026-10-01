## Requirements

### Requirement: Congregation name is configurable

The system SHALL store a configurable congregation name used in the UI and in S-140 exports.

#### Scenario: Update congregation name
- **WHEN** the user saves a new congregation name
- **THEN** subsequent screens and PDF exports display the updated name

### Requirement: Meeting weekday drives S-140 dates

The system SHALL store a configurable weekday used as the meeting day. For each week, the system MUST compute `meetingDate` as the calendar date of that weekday within the week.

#### Scenario: Thursday meeting day
- **WHEN** the meeting weekday is Thursday and a week starts on Monday 2026-09-07
- **THEN** the week `meetingDate` is 2026-09-10

#### Scenario: Change weekday recomputes future dates
- **WHEN** the user changes the meeting weekday
- **THEN** weeks without locked overrides update their `meetingDate` accordingly

### Requirement: Settings are readable by authenticated user

The system SHALL expose current congregation settings to the authenticated user.

#### Scenario: Read settings
- **WHEN** the authenticated user requests settings
- **THEN** the system returns congregation name and meeting weekday

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
