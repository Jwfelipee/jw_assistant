## ADDED Requirements

### Requirement: Schedule hierarchy is bimester, month, and week
The system SHALL organize assignments as Bimester → Month → Week. A week belongs to the civil month in which the week starts.

#### Scenario: Week starting in September belongs to September
- **WHEN** a week starts on 2026-09-28 and the meeting day is Thursday 2026-10-01
- **THEN** the week is stored under month 2026-09

### Requirement: Weeks are generated for a month from calendar
The system SHALL generate all weeks whose start date falls within a target month, each with default parts from the catalog/templates and a `meetingDate` from congregation weekday settings.

#### Scenario: Generate next month
- **WHEN** the user opens the next month that has no schedule yet
- **THEN** the system creates the month structure and its weeks with default parts

### Requirement: Female participants have at most one assignment per week
The system SHALL prevent assigning a female participant to more than one part in the same week.

#### Scenario: Second female assignment in week blocked
- **WHEN** a female participant already has an assignment in a week
- **THEN** assigning her to another part in that week is rejected

### Requirement: Part privilege and sex rules are enforced
The system SHALL only allow participants matching the part type’s allowed sexes and privileges.

#### Scenario: Non-elder assigned to Tesouros rejected
- **WHEN** a Publicador male is assigned to Tesouros
- **THEN** the system rejects the assignment

### Requirement: Month-repeat alerts are configurable by privilege
The system SHALL warn when assigning a participant who already has an assignment in the same month, and the user MUST be able to configure which privileges trigger this alert.

#### Scenario: Alert for configured privilege
- **WHEN** repeat-month alert is enabled for Batizado and a Batizado is assigned twice in the same month
- **THEN** the system returns a warning alert while still allowing confirmation

#### Scenario: No alert when privilege disabled
- **WHEN** repeat-month alert is disabled for Ancião and an Ancião is assigned twice in the same month
- **THEN** the system does not emit the repeat-month alert

### Requirement: Two-participant FSM parts support TITULAR and AJUDANTE
The system SHALL support FSM parts with one participant (role TITULAR) or two participants (TITULAR and AJUDANTE).

#### Scenario: Suggest least-used TITULAR
- **WHEN** the user requests a suggestion for TITULAR on an FSM part
- **THEN** the system suggests the eligible active participant with the lowest TITULAR count

#### Scenario: Suggest least-used AJUDANTE
- **WHEN** the user requests a suggestion for AJUDANTE on an FSM part
- **THEN** the system suggests the eligible active participant with the lowest AJUDANTE count

### Requirement: Mixed-sex pair alert with association exception
The system SHALL alert when two participants of different sexes are assigned to the same two-person part, unless a participant association exists between them.

#### Scenario: Mixed pair without association warns
- **WHEN** male and female without association are assigned together
- **THEN** the system emits a mixed-pair alert

#### Scenario: Associated mixed pair does not warn
- **WHEN** male and female with an association are assigned together
- **THEN** the system does not emit the mixed-pair alert

### Requirement: Congregation Bible study uses DIRIGENTE and LEITOR
The system SHALL require Estudo bíblico de congregação to use DIRIGENTE and LEITOR roles and count those roles accordingly.

#### Scenario: Assign conductor and reader
- **WHEN** the user assigns DIRIGENTE and LEITOR on the study part
- **THEN** the corresponding counters increment

### Requirement: Assignment history is searchable from the assignments area
The system SHALL provide an assignments history view with filters and search across participants, dates, topics, and roles.

#### Scenario: Filter history by participant name
- **WHEN** the user searches history by participant name
- **THEN** only matching assignments are returned

### Requirement: Dashboard prioritizes next unscheduled month
The system SHALL facilitate entry into the next month that still needs assignments.

#### Scenario: Shortcut to next month
- **WHEN** the user opens the home dashboard while the following month lacks a complete schedule
- **THEN** the system highlights a clear action to open that month for assignment
