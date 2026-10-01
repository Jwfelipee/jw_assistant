## Requirements

### Requirement: User can register participants

The system SHALL allow creating participants with name, optional phone, sex, privilege, role preference, and optional qualified flag. Participants MUST NOT have platform login credentials.

#### Scenario: Create participant
- **WHEN** the user submits a valid participant form
- **THEN** the participant is stored and appears in the participants list

#### Scenario: Phone is optional
- **WHEN** the user creates a participant without a phone number
- **THEN** the system accepts the record

### Requirement: Privileges are constrained by sex

The system SHALL allow privileges as follows:
- Male: Ancião, Servo Ministerial, Pioneiro Regular, Batizado, Publicador
- Female: Pioneira Regular, Batizado, Publicador

#### Scenario: Reject invalid privilege for sex
- **WHEN** the user assigns Ancião to a female participant
- **THEN** the system rejects the change

#### Scenario: Accept shared privilege
- **WHEN** the user assigns Publicador to either sex
- **THEN** the system accepts the change

### Requirement: Role preference restricts suggested and selectable roles

The system SHALL support role preferences such that a participant may prefer only assistant-type roles (e.g. AJUDANTE) or allow any eligible role.

#### Scenario: Assistant-only preference
- **WHEN** a participant preference is assistant-only
- **THEN** suggestion and default selection for TITULAR/DIRIGENTE exclude that participant unless the user overrides with an explicit warning path defined by the schedule capability

### Requirement: Participant pair associations suppress mixed-pair alerts

The system SHALL allow defining associations between participants with a reason. Associated pairs MUST NOT trigger the mixed-sex pair alert when assigned together.

#### Scenario: Create association
- **WHEN** the user links participant A with participant B and provides a reason
- **THEN** the association is stored and available on both participant records

### Requirement: Counters are maintained per role and separate ministry practice bucket

The system SHALL maintain counters per participant for TITULAR, AJUDANTE, DIRIGENTE, and LEITOR, plus a separate ministry-practice counter that includes Faça Seu Melhor assignments and Leitura da Bíblia.

#### Scenario: Single-participant part increments TITULAR
- **WHEN** a participant is assigned to a one-person part
- **THEN** the participant TITULAR counter increments by one

#### Scenario: Bible reading increments separate counter
- **WHEN** a participant is assigned to Leitura da Bíblia
- **THEN** both the role counter and the separate ministry-practice counter increment

### Requirement: Participant detail shows assignment history

The system SHALL show a participant’s full assignment history on the participant detail view.

#### Scenario: View history on participant
- **WHEN** the user opens a participant detail
- **THEN** the system lists past and future assignments for that participant

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
