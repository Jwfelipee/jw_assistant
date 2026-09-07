## ADDED Requirements

### Requirement: System maintains a rolling month horizon
The system SHALL automatically ensure blank schedule skeletons exist for the civil current month and the next six months (seven months total), each with weeks and default parts but empty assignment slots.

#### Scenario: Horizon created on first access
- **WHEN** the user opens the Designações area and the horizon has not been provisioned for the current civil month window
- **THEN** the system creates any missing months in the window via the same logic as `ensureMonth`

#### Scenario: Horizon is idempotent
- **WHEN** the horizon endpoint runs again for a month that already exists
- **THEN** no duplicate months or weeks are created

### Requirement: User can list months with completion status
The system SHALL expose `GET /schedule/months` returning all past months that exist in the database plus the current civil month through six months ahead, each with completion metadata.

#### Scenario: Month list includes status
- **WHEN** the client requests the month list
- **THEN** each month includes `yearMonth`, `complete`, `openSlots`, `weekCount`, `isPast`, `isCurrent`, and `isInHorizon`

#### Scenario: Complete month
- **WHEN** every assignment slot in a month has a participant
- **THEN** `complete` is true and `openSlots` is 0

#### Scenario: Pending month
- **WHEN** a month exists with at least one filled slot and at least one empty slot
- **THEN** `complete` is false and `openSlots` reflects the empty count

### Requirement: Designações hub shows month navigation
The Designações entry screen SHALL present a month hub instead of redirecting immediately to a single month, allowing the user to choose which month to edit.

#### Scenario: Open Designações tab
- **WHEN** the user opens the Designações tab
- **THEN** they see the month hub with status indicators for planning months (current + 6 ahead) and past months

#### Scenario: Navigate to month detail
- **WHEN** the user selects a month from the hub
- **THEN** they open the existing month week list at `/schedule/[yearMonth]`

#### Scenario: Past months remain editable
- **WHEN** the user opens a past month from the hub
- **THEN** they can edit assignments the same as for current or future months

### Requirement: User can add FSM or NVC parts from section context
The week detail UI SHALL provide a section-level add action for Faça seu melhor no ministério and Nossa vida cristã that opens a modal with the section pre-selected.

#### Scenario: Add from FSM section
- **WHEN** the user taps add in the FSM section
- **THEN** a modal opens filtered to FSM part types and creates the part on confirm

#### Scenario: Add from NVC section
- **WHEN** the user taps add in the NVC section (not the Bible study)
- **THEN** a modal opens filtered to NVC part types excluding the congregation study

### Requirement: User can reorder FSM and NVC parts by drag
The system SHALL allow reordering deletable FSM and NVC week parts (excluding congregation Bible study) within a week via drag-and-drop in the UI.

#### Scenario: Reorder FSM parts
- **WHEN** the user drags an FSM part to a new position within the FSM list
- **THEN** the system persists the new order and reflects it in the week view and PDF export

#### Scenario: Bible study position is fixed
- **WHEN** the user attempts to reorder the congregation Bible study
- **THEN** it is not included in the draggable list and remains last in NVC

#### Scenario: Reorder API validation
- **WHEN** the client sends `PATCH /schedule/weeks/:weekId/parts/reorder` with only FSM/NVC non-study part IDs in the desired order
- **THEN** the server updates `sortOrder` values without changing treasures, out-of-topic, or study positions

## MODIFIED Requirements

### Requirement: Dashboard prioritizes next unscheduled month
The system SHALL continue to highlight the next incomplete month on the home dashboard while the Designações tab provides full month navigation.

#### Scenario: Shortcut to next month on home
- **WHEN** the user opens the home dashboard while a month in the horizon lacks a complete schedule
- **THEN** the system highlights a clear action to open that month

### Requirement: Assignment history is searchable from the assignments area
The history area SHALL provide sub-views for assignment search and month archive.

#### Scenario: Assignment search sub-tab
- **WHEN** the user opens Histórico with the default assignments view
- **THEN** the existing filterable assignment list is shown

#### Scenario: Month archive sub-tab
- **WHEN** the user switches to the months sub-tab in Histórico
- **THEN** they see past and current months with status and can open any month for consultation, editing, or PDF export
