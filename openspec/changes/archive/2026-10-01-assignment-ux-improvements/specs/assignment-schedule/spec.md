## ADDED Requirements

### Requirement: Selecting a participant assigns immediately
The system SHALL assign a participant to a slot as soon as the user selects them in the participant picker, without requiring a separate "Designar" action.

#### Scenario: Select eligible participant assigns slot
- **WHEN** the user selects an eligible participant in the slot picker
- **THEN** the system calls assign for that slot and updates the UI with the assignment result

#### Scenario: Soft alerts still require confirmation
- **WHEN** the user selects a participant that triggers soft alerts
- **THEN** the system shows the confirmation panel before persisting the assignment

#### Scenario: Clearing selection does not unassign
- **WHEN** the user clears the picker without using Limpar
- **THEN** the existing assignment (if any) remains unchanged

### Requirement: Suggest assigns immediately and supports another suggestion
The system SHALL assign the suggested participant when the user taps Sugerir, and SHALL allow requesting another suggestion that excludes the current assignee.

#### Scenario: Suggest assigns top candidate
- **WHEN** the user taps Sugerir on an open slot
- **THEN** the system suggests the lowest-counter eligible participant and assigns them immediately

#### Scenario: Suggest again offers next candidate
- **WHEN** the user taps Sugerir again on a slot that already has an assignee
- **THEN** the system suggests the next eligible participant excluding the current assignee

#### Scenario: User can change after suggest
- **WHEN** a participant was assigned via Sugerir
- **THEN** the user can select a different participant in the picker or tap Sugerir again

### Requirement: Eligible participants endpoint per slot
The system SHALL expose `GET /slots/:id/eligible-participants` returning participants eligible for that slot and a visible-disabled list for contextual ineligibility.

#### Scenario: Eligible list respects all hard rules
- **WHEN** the client requests eligible participants for a slot
- **THEN** the response includes only participants passing sex, privilege, role preference, absence, and female week-limit rules

#### Scenario: Sex privilege and preference ineligible are hidden
- **WHEN** a participant is ineligible due to sex, privilege, or role preference
- **THEN** they are omitted from both eligible and visible-disabled lists

#### Scenario: Absence and female week limit shown disabled
- **WHEN** a participant is ineligible due to absence or female week limit
- **THEN** they appear in `ineligibleVisible` with a human-readable reason in pt-BR

### Requirement: Participant picker supports search
The assignment UI SHALL provide a searchable combobox for participant selection that loads eligibility from the dedicated endpoint.

#### Scenario: Type to filter by name
- **WHEN** the user types in the participant picker
- **THEN** the visible options filter by name substring (case-insensitive)

#### Scenario: Ineligible visible entries are not selectable
- **WHEN** the picker shows ineligible visible participants at the bottom
- **THEN** those entries are styled as disabled and cannot be selected

### Requirement: Existing week part themes are editable
The system SHALL allow editing the free-text theme (`title`) of an existing week part.

#### Scenario: Patch part title
- **WHEN** the user saves a new title for an existing week part
- **THEN** `PATCH /schedule/parts/:partId` persists the title (max 300 characters)

#### Scenario: Inline edit on week screen
- **WHEN** the user edits a part theme on the week detail screen
- **THEN** the updated title is shown without a full page reload

## MODIFIED Requirements

### Requirement: Two-participant FSM parts support TITULAR and AJUDANTE
The system SHALL support FSM parts with one participant (role TITULAR) or two participants (TITULAR and AJUDANTE). Suggestions SHALL assign immediately when invoked from the week UI.

#### Scenario: Suggest least-used TITULAR
- **WHEN** the user requests a suggestion for TITULAR on an FSM part
- **THEN** the system suggests the eligible active participant with the lowest TITULAR count and assigns them

#### Scenario: Suggest least-used AJUDANTE
- **WHEN** the user requests a suggestion for AJUDANTE on an FSM part
- **THEN** the system suggests the eligible active participant with the lowest AJUDANTE count and assigns them

### Requirement: Part privilege and sex rules are enforced
The system SHALL only allow participants matching the part type's allowed sexes and privileges. The assignment UI SHALL pre-filter the picker so ineligible participants by sex or privilege are not shown.

#### Scenario: Non-elder assigned to Tesouros rejected
- **WHEN** a Publicador male is assigned to Tesouros
- **THEN** the system rejects the assignment

#### Scenario: Non-elder not shown in Tesouros picker
- **WHEN** the user opens the participant picker for a Tesouros slot
- **THEN** participants without the required privilege are not listed
