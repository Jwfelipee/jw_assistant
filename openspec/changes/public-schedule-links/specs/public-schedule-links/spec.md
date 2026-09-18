## ADDED Requirements

### Requirement: Public readable URLs expose read-only schedule views
The system SHALL provide four unauthenticated web routes at fixed paths: `/esta-semana`, `/proxima-semana`, `/este-mes`, and `/proximo-mes`. Each route SHALL display assignment information in read-only form without login.

#### Scenario: Visitor opens current week link
- **WHEN** a visitor navigates to `/esta-semana` and the link is enabled
- **THEN** the page shows the congregation name and assignments for the current ISO civil week without requiring authentication

#### Scenario: Visitor opens current month link
- **WHEN** a visitor navigates to `/este-mes` and the link is enabled
- **THEN** the page shows all weeks and assignments for the current civil month

### Requirement: Current week uses ISO civil week containing today
The system SHALL resolve "esta semana" as the schedule week whose `meetingDate` falls within the ISO week (Monday through Sunday) that contains the current date, even if the meeting day has already passed.

#### Scenario: After meeting day in the same ISO week
- **WHEN** today is Friday and the meeting was Thursday in the same ISO week
- **THEN** `/esta-semana` still shows that week's assignments

#### Scenario: Next ISO week
- **WHEN** today is in ISO week W
- **THEN** `/proxima-semana` shows the schedule week whose `meetingDate` falls in ISO week W+1

### Requirement: Month scopes use civil calendar months
The system SHALL resolve `/este-mes` to the current civil month and `/proximo-mes` to the next civil month using the same month model as the internal schedule (`YYYY-MM`).

#### Scenario: Next civil month in December
- **WHEN** today is December 2026
- **THEN** `/proximo-mes` shows January 2027 assignments if they exist

### Requirement: Public responses omit sensitive fields
Public schedule responses SHALL include participant names for assigned slots only. They MUST NOT include phone numbers, internal participant IDs, or mutation endpoints.

#### Scenario: Assigned slot shows name
- **WHEN** a slot has a participant assigned
- **THEN** the public view shows the participant display name

#### Scenario: Empty slot shows dash
- **WHEN** a slot has no participant assigned
- **THEN** the public view shows `—` for that slot

### Requirement: Each public link can be disabled independently
The system SHALL allow the authenticated operator to enable or disable each of the four public links independently. When a link is disabled, unauthenticated access to that scope MUST NOT expose assignment data.

#### Scenario: Disabled current week link
- **WHEN** `publicLinkCurrentWeekEnabled` is false and a visitor opens `/esta-semana`
- **THEN** the system responds with a disabled-link state and does not return assignment data

#### Scenario: Other links remain active
- **WHEN** only the current week link is disabled
- **THEN** `/proxima-semana`, `/este-mes`, and `/proximo-mes` continue to work when enabled

### Requirement: Operator can copy public URLs from settings
The authenticated settings screen SHALL list all four public URLs with a copy action for each link.

#### Scenario: Copy esta-semana URL
- **WHEN** the operator taps copy for "Esta semana"
- **THEN** the full URL (origin + `/esta-semana`) is copied to the clipboard

### Requirement: Public views support list and print modes
Each public page SHALL default to a mobile-friendly list layout and SHALL offer a print mode that presents content in an S-140-like tabular layout suitable for printing.

#### Scenario: Switch to print mode
- **WHEN** the visitor taps "Modo impressão" on a public page
- **THEN** the layout changes to the S-140-like view while remaining read-only

#### Scenario: Print from browser
- **WHEN** the visitor uses the print action in print mode
- **THEN** the browser print dialog opens with print-oriented CSS applied

### Requirement: Public API endpoints are unauthenticated
The system SHALL expose `GET /public/schedule/esta-semana`, `GET /public/schedule/proxima-semana`, `GET /public/schedule/este-mes`, and `GET /public/schedule/proximo-mes` marked as public (no session required).

#### Scenario: API without session
- **WHEN** a client calls `GET /public/schedule/este-mes` without a cookie
- **THEN** the API returns 200 with public schedule data when the link is enabled

#### Scenario: Disabled link returns not found
- **WHEN** a client calls a public schedule endpoint for a disabled link
- **THEN** the API returns 404
