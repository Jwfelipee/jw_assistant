## Requirements

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

The system SHALL prevent assigning a female participant to more than one part in the same week. Multiple assignments across different weeks in the same month SHALL be allowed after confirmation.

#### Scenario: Second female assignment in week blocked
- **WHEN** a female participant already has an assignment in a week
- **THEN** assigning her to another part in that week is rejected

#### Scenario: Second female assignment in month allowed after confirm
- **WHEN** a female has one assignment in week A and is assigned in week B of the same month
- **THEN** the system shows confirmation and allows the assignment on confirm

### Requirement: Part privilege and sex rules are enforced

The system SHALL only allow participants matching the part type's allowed sexes and privileges. The assignment UI SHALL pre-filter the picker so ineligible participants by sex or privilege are not shown.

#### Scenario: Non-elder assigned to Tesouros rejected
- **WHEN** a Publicador male is assigned to Tesouros
- **THEN** the system rejects the assignment

#### Scenario: Non-elder not shown in Tesouros picker
- **WHEN** the user opens the participant picker for a Tesouros slot
- **THEN** participants without the required privilege are not listed

### Requirement: Month-repeat alerts are configurable by privilege

The system SHALL warn when assigning a participant who already has an assignment in the same month for privileges configured in AlertConfig. Additionally, female participants SHALL always receive a month-repeat alert on second and subsequent assignments in the month regardless of AlertConfig.

#### Scenario: Alert for configured privilege
- **WHEN** repeat-month alert is enabled for Batizado and a Batizado is assigned twice in the same month
- **THEN** the system returns a warning alert while still allowing confirmation

#### Scenario: Female always alerted on month repeat
- **WHEN** a female participant is assigned a second time in the same month
- **THEN** the system emits FEMALE_REPEAT_MONTH even if her privilege has alerts disabled

### Requirement: Two-participant FSM parts support TITULAR and AJUDANTE

The system SHALL support FSM parts with one participant (role TITULAR) or two participants (TITULAR and AJUDANTE). Suggestions SHALL assign immediately when invoked from the week UI.

#### Scenario: Suggest least-used TITULAR
- **WHEN** the user requests a suggestion for TITULAR on an FSM part
- **THEN** the system suggests the eligible active participant with the lowest TITULAR count and assigns them

#### Scenario: Suggest least-used AJUDANTE
- **WHEN** the user requests a suggestion for AJUDANTE on an FSM part
- **THEN** the system suggests the eligible active participant with the lowest AJUDANTE count and assigns them

### Requirement: Mixed-sex pair alert with association exception

The system SHALL alert when two participants of different sexes are assigned to the same two-person part, unless a participant association exists between them.

#### Scenario: Mixed pair without association warns
- **WHEN** male and female without association are assigned together
- **THEN** the system emits a mixed-pair alert

#### Scenario: Associated mixed pair does not warn
- **WHEN** male and female with an association are assigned together
- **THEN** the system does not emit the mixed-pair alert

### Requirement: Congregation Bible study uses DIRIGENTE and LEITOR

The system SHALL require Estudo bíblico de congregação to use DIRIGENTE and LEITOR roles. LEITOR assignments SHALL increment Titular counter; DIRIGENTE SHALL increment Dirigente counter.

#### Scenario: Assign conductor and reader
- **WHEN** the user assigns DIRIGENTE and LEITOR on the study part
- **THEN** Dirigente and Titular counters increment respectively

### Requirement: Assignment history is searchable from the assignments area

The system SHALL provide an assignments history view with filters across participant name, date range, participant sex, catalog part type (designation), assignment role(s), and an optional mode that returns only the most recent matching assignment per participant. The history area SHALL continue to provide sub-views for assignment search and month archive.

#### Scenario: Filter history by participant name
- **WHEN** the user searches history by participant name
- **THEN** only matching assignments are returned

#### Scenario: Filter history by participant sex
- **WHEN** the user filters history by male or female participants
- **THEN** only assignments whose assigned participant has that sex are returned

#### Scenario: Filter history by catalog part type
- **WHEN** the user selects a specific designation (e.g. Presidente, Joias espirituais, a catalog NVC type)
- **THEN** only assignments for week parts of that part type are returned

#### Scenario: All designations option
- **WHEN** the user selects "Todas as designações" (no part type filter)
- **THEN** assignments of any part type that match the other active filters are returned

#### Scenario: Filter Estudo bíblico by conductor role
- **WHEN** the user filters by the Estudo bíblico part type and conductor (Dirigente) role
- **THEN** only DIRIGENTE slots on that part type are returned

#### Scenario: Filter Estudo bíblico by reader role
- **WHEN** the user filters by the Estudo bíblico part type and reader (Leitor) role
- **THEN** only LEITOR slots on that part type are returned

#### Scenario: Filter Estudo bíblico by both study roles
- **WHEN** the user filters by the Estudo bíblico part type and "Dirigente e leitor"
- **THEN** assignments with role DIRIGENTE or LEITOR on that part type are returned

#### Scenario: Last assignment per participant within date range
- **WHEN** the user enables last-per-participant mode and sets a from/to date range
- **THEN** the API returns at most one row per participant: the assignment with the latest meeting date within that range that matches all other filters

#### Scenario: Last assignment per participant without date range
- **WHEN** the user enables last-per-participant mode without a date range
- **THEN** the API returns at most one row per participant: the globally latest matching assignment for that participant

#### Scenario: History list sort order unchanged
- **WHEN** history results are displayed
- **THEN** rows are ordered by meeting date descending (most recent first), including in last-per-participant mode

#### Scenario: Assignment search sub-tab
- **WHEN** the user opens Histórico with the default assignments view
- **THEN** the filterable assignment list includes the new filters and optional last-per-participant mode

#### Scenario: Month archive sub-tab unchanged
- **WHEN** the user switches to the months sub-tab in Histórico
- **THEN** month archive behavior is unchanged

### Requirement: Dashboard prioritizes next unscheduled month

The system SHALL continue to highlight the next incomplete month on the home dashboard while the Designações tab provides full month navigation.

#### Scenario: Shortcut to next month on home
- **WHEN** the user opens the home dashboard while a month in the horizon lacks a complete schedule
- **THEN** the system highlights a clear action to open that month

### Requirement: Prayer and book reader eligibility includes qualified baptized

The system SHALL allow Ancião and Servo Ministerial for oração inicial, oração final, and leitor do livro. Batizado participants SHALL be eligible only when `qualified` is true. Dirigente do livro SHALL remain Ancião and Servo Ministerial only.

#### Scenario: Qualified batizado in prayer picker
- **WHEN** the user opens the picker for oração inicial
- **THEN** qualified baptized males appear as eligible

#### Scenario: Unqualified batizado hidden from prayer
- **WHEN** a baptized male is not qualified
- **THEN** they are omitted from the prayer slot picker

#### Scenario: Book conductor unchanged
- **WHEN** the user opens the picker for dirigente do livro
- **THEN** only Ancião and Servo Ministerial appear

### Requirement: Female month repeat always warns with inline confirmation

The system SHALL emit a soft alert when assigning a female participant who already has an assignment in the same month (any privilege). The user MUST confirm before the assignment persists. The female one-assignment-per-week hard rule SHALL remain.

#### Scenario: Second female assignment in month warns
- **WHEN** a female participant already has an assignment in the month and is selected for another week
- **THEN** the system returns a confirmation-required response with a female month-repeat alert

#### Scenario: Confirmation shown at the slot
- **WHEN** a soft alert blocks assignment
- **THEN** the confirmation UI appears inline on the affected slot, not only at the page top

#### Scenario: Second assignment same week still blocked
- **WHEN** a female already has an assignment in the same week
- **THEN** the assignment is hard-rejected with female week limit

### Requirement: Eligible participants expose month and total count breakdown

The system SHALL return per-participant count maps for the current schedule month and lifetime totals, grouped by assignment category. Only categories with value greater than zero SHALL be included. The category relevant to the open slot SHALL be ordered first in the picker table columns.

#### Scenario: Picker shows compact count table
- **WHEN** the user opens the participant picker
- **THEN** each eligible row shows Este mês and Total rows with category columns

#### Scenario: Zero columns hidden
- **WHEN** a category is zero in both Este mês and Total
- **THEN** that column is not shown

### Requirement: Eligible participants sorted by relevant count and week assignment

The system SHALL sort eligible participants with lowest relevant-category count first among those not yet assigned in the current week. Participants already assigned in the current week SHALL appear after all others.

#### Scenario: Leitor slot sorts by titular count
- **WHEN** the picker is opened for leitor do livro
- **THEN** participants are ordered by titular counts ascending, with week-assigned participants last

### Requirement: WhatsApp share from week assignment slot

The system SHALL show a WhatsApp action next to Sugerir and Limpar when the assigned participant has a phone number. Tapping it SHALL open `wa.me` with normalized phone and a formatted assignment message.

#### Scenario: WhatsApp button visible with phone
- **WHEN** a slot has an assignee with phone
- **THEN** a WhatsApp button appears beside Sugerir and Limpar

#### Scenario: WhatsApp hidden without phone
- **WHEN** the assignee has no phone
- **THEN** no WhatsApp button is shown

#### Scenario: Message highlights assignee role
- **WHEN** the user taps WhatsApp on the ajudante slot
- **THEN** the message bolds the ajudante name and italicizes the titular name when present

### Requirement: Week navigation within month

The system SHALL provide previous and next week navigation at the end of the week assignment page when another week exists in the same month. The last week SHALL NOT offer next navigation or forward swipe. The first week SHALL NOT offer previous navigation or backward swipe. Swipe navigation SHALL be enabled for touch devices only.

#### Scenario: Navigate to previous week
- **WHEN** the user is on the second week of a month and taps Semana anterior
- **THEN** the app navigates to the first week of that month

#### Scenario: No next on last week
- **WHEN** the user is on the last week of the month
- **THEN** no Próxima semana control is shown and forward swipe does nothing

#### Scenario: Touch swipe disabled with picker open
- **WHEN** the participant picker dropdown is open
- **THEN** horizontal swipe does not change weeks

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
