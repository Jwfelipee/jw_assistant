## MODIFIED Requirements

### Requirement: Eligible participants endpoint per slot
The system SHALL expose `GET /slots/:id/eligible-participants` returning participants eligible for that slot and a visible-disabled list for contextual ineligibility. Each eligible participant SHALL include their globally most recent assignment (`lastAssignment`) when they have assignment history, or `null` when they have never been assigned.

#### Scenario: Eligible list respects all hard rules
- **WHEN** the client requests eligible participants for a slot
- **THEN** the response includes only participants passing sex, privilege, role preference, absence, and female week-limit rules

#### Scenario: Sex privilege and preference ineligible are hidden
- **WHEN** a participant is ineligible due to sex, privilege, or role preference
- **THEN** they are omitted from both eligible and visible-disabled lists

#### Scenario: Absence and female week limit shown disabled
- **WHEN** a participant is ineligible due to absence or female week limit
- **THEN** they appear in `ineligibleVisible` with a human-readable reason in pt-BR

#### Scenario: Last assignment on eligible participants
- **WHEN** an eligible participant has at least one past assignment
- **THEN** `lastAssignment` contains the most recent assignment by meeting date across all part types, with role and part type label

#### Scenario: Never assigned participant
- **WHEN** an eligible participant has no assignment history
- **THEN** `lastAssignment` is null

### Requirement: Participant picker supports search
The assignment UI SHALL provide a searchable combobox for participant selection that loads eligibility from the dedicated endpoint. The picker SHALL support optional filters by participant sex, privilege, and the role of each participant's globally last assignment. Filter state SHALL be remembered per slot while the user remains on the week view and SHALL reset when opening a different slot. Reopening the same slot SHALL restore the last filter values for that slot, and the user SHALL be able to clear filters explicitly.

#### Scenario: Type to filter by name
- **WHEN** the user types in the participant picker
- **THEN** the visible options filter by name substring (case-insensitive) among participants already matching active picker filters

#### Scenario: Filter by sex in picker
- **WHEN** the user sets the picker sex filter to female
- **THEN** only eligible female participants are listed

#### Scenario: Filter by privilege in picker
- **WHEN** the user sets the picker privilege filter to a specific privilege
- **THEN** only eligible participants with that privilege are listed

#### Scenario: Filter by last assignment role
- **WHEN** the user sets "última designação" to Ajudante
- **THEN** only eligible participants whose global last assignment role is AJUDANTE are listed

#### Scenario: Filters reset when changing slot
- **WHEN** the user opens the picker for slot A with filters applied, then opens the picker for slot B
- **THEN** slot B shows default filters (no restriction)

#### Scenario: Filters restore for same slot
- **WHEN** the user configured filters on slot A, closed the picker, and opens slot A again
- **THEN** the same filter values are shown

#### Scenario: Clear picker filters
- **WHEN** the user taps clear filters in the picker
- **THEN** sex, privilege, and last-role filters return to "any" for the current slot

#### Scenario: Ineligible visible entries are not selectable
- **WHEN** the picker shows ineligible visible participants at the bottom
- **THEN** those entries are styled as disabled and cannot be selected

#### Scenario: View assignment history in picker without assigning
- **WHEN** the user expands the assignment history control on an eligible row
- **THEN** a fixed-height scrollable panel shows assignment rows in compact one-line form without selecting the participant

#### Scenario: Assignment history panel shows three rows visible
- **WHEN** the assignment history panel is open and the participant has more than three assignments
- **THEN** three rows are visible at once and additional rows are reachable via vertical scroll inside the panel only

#### Scenario: Select participant still assigns immediately
- **WHEN** the user activates the main row area (not the history panel or filter controls)
- **THEN** the participant is assigned as today without an extra Designar step
