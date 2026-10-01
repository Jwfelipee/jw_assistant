## ADDED Requirements

### Requirement: Participant qualified flag for baptized publishers
The system SHALL store a boolean `qualified` on each participant, defaulting to `false`. The qualified flag SHALL only apply when the participant privilege is Batizado.

#### Scenario: Create participant with qualified false by default
- **WHEN** the user creates a new participant
- **THEN** `qualified` is stored as `false` unless explicitly checked

#### Scenario: Qualified checkbox visible only for Batizado
- **WHEN** the user edits a participant whose privilege is not Batizado
- **THEN** the qualified checkbox is hidden or disabled and ignored for eligibility

#### Scenario: Qualified batizado is eligible for prayer and book reader
- **WHEN** a baptized participant is marked qualified
- **THEN** they MAY be assigned to oração inicial, oração final, or leitor do livro per schedule rules

### Requirement: Default privilege on new participant is Batizado
The system SHALL default the privilege field to Batizado when creating a new participant.

#### Scenario: New participant form default
- **WHEN** the user opens the create participant form
- **THEN** the privilege field defaults to Batizado for the selected sex

## MODIFIED Requirements

### Requirement: User can register participants
The system SHALL allow creating participants with name, optional phone, sex, privilege, role preference, and optional qualified flag. Participants MUST NOT have platform login credentials.

#### Scenario: Create participant
- **WHEN** the user submits a valid participant form
- **THEN** the participant is stored and appears in the participants list

#### Scenario: Phone is optional
- **WHEN** the user creates a participant without a phone number
- **THEN** the system accepts the record

### Requirement: Counters are maintained per assignment category
The system SHALL maintain counters per participant for Presidente, Oração (initial and final prayers combined), Titular, Dirigente, Ajudante, and Ministério (Bible reading and FSM parts for male participants only). Book reader (leitor do livro) SHALL increment Titular, not a separate leitor counter.

#### Scenario: President and prayer counted separately
- **WHEN** a participant is assigned as Presidente or to a prayer part
- **THEN** the corresponding Presidente or Oração counter increments

#### Scenario: Book reader increments titular
- **WHEN** a male participant is assigned as leitor do livro on congregation Bible study
- **THEN** the Titular counter increments

#### Scenario: Bible reading increments ministry for males
- **WHEN** a male participant is assigned to Leitura da Bíblia
- **THEN** the Ministério counter increments and Titular does not

#### Scenario: FSM increments ministry for males only
- **WHEN** a male participant is assigned to an FSM part as titular or ajudante
- **THEN** Ministério or Ajudante counters increment per rules; female FSM assignments do not increment Ministério

#### Scenario: Historical counters recalculated
- **WHEN** the system is migrated to the new counting model
- **THEN** all participant counters are recomputed from assignment history
