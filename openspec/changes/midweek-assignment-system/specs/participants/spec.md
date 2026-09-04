## ADDED Requirements

### Requirement: User can register participants
The system SHALL allow creating participants with name, optional phone, sex, privilege, and role preference. Participants MUST NOT have platform login credentials.

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
