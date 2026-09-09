## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Month-repeat alerts are configurable by privilege
The system SHALL warn when assigning a participant who already has an assignment in the same month for privileges configured in AlertConfig. Additionally, female participants SHALL always receive a month-repeat alert on second and subsequent assignments in the month regardless of AlertConfig.

#### Scenario: Alert for configured privilege
- **WHEN** repeat-month alert is enabled for Batizado and a Batizado is assigned twice in the same month
- **THEN** the system returns a warning alert while still allowing confirmation

#### Scenario: Female always alerted on month repeat
- **WHEN** a female participant is assigned a second time in the same month
- **THEN** the system emits FEMALE_REPEAT_MONTH even if her privilege has alerts disabled

### Requirement: Part privilege and sex rules are enforced
The system SHALL only allow participants matching the part type's allowed sexes and privileges, including the qualified baptized rule for prayers and book reader. The assignment UI SHALL pre-filter the picker accordingly.

#### Scenario: Non-elder assigned to Tesouros rejected
- **WHEN** a Publicador male is assigned to Tesouros
- **THEN** the system rejects the assignment

#### Scenario: Unqualified batizado not shown for prayer
- **WHEN** the user opens the picker for oração final
- **THEN** unqualified baptized participants are not listed

### Requirement: Two-participant FSM parts support TITULAR and AJUDANTE
The system SHALL support FSM parts with one participant (role TITULAR) or two participants (TITULAR and AJUDANTE). Suggestions SHALL use the new count categories for sorting.

#### Scenario: Suggest least-used ministry titular for male FSM
- **WHEN** the user requests a suggestion for TITULAR on an FSM part for a male participant pool
- **THEN** the system suggests the eligible participant with the lowest Ministério count

### Requirement: Congregation Bible study uses DIRIGENTE and LEITOR
The system SHALL require Estudo bíblico de congregação to use DIRIGENTE and LEITOR roles. LEITOR assignments SHALL increment Titular counter; DIRIGENTE SHALL increment Dirigente counter.

#### Scenario: Assign conductor and reader
- **WHEN** the user assigns DIRIGENTE and LEITOR on the study part
- **THEN** Dirigente and Titular counters increment respectively

### Requirement: Female participants have at most one assignment per week
The system SHALL prevent assigning a female participant to more than one part in the same week. Multiple assignments across different weeks in the same month SHALL be allowed after confirmation.

#### Scenario: Second female assignment in week blocked
- **WHEN** a female participant already has an assignment in a week
- **THEN** assigning her to another part in that week is rejected

#### Scenario: Second female assignment in month allowed after confirm
- **WHEN** a female has one assignment in week A and is assigned in week B of the same month
- **THEN** the system shows confirmation and allows the assignment on confirm
