## ADDED Requirements

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
