## ADDED Requirements

### Requirement: System part types exist for fixed S-140 structure
The system SHALL provide system part types for: Presidente, Oração inicial, Oração final, Tesouros, Joias espirituais, Leitura da Bíblia, and Estudo bíblico de congregação, with immutable core rules.

#### Scenario: Seed system types
- **WHEN** the database is seeded
- **THEN** the fixed system part types exist and cannot be deleted

### Requirement: Tesouros topic rules
The system SHALL define Tesouros da Palavra de Deus with exactly three parts: Tesouros and Joias espirituais (male Ancião or Servo Ministerial only, one participant each) and Leitura da Bíblia (male only, one participant).

#### Scenario: Week template includes three Tesouros parts
- **WHEN** a week is created from template
- **THEN** the three Tesouros parts are created automatically

### Requirement: Faça Seu Melhor catalog is user-configurable
The system SHALL allow creating, editing, and deleting catalog entries for Faça Seu Melhor no Ministério parts, each defining allowed sex(es) and whether the part uses 1 or 2 participants (TITULAR+AJUDANTE when 2).

#### Scenario: Create FSM catalog type
- **WHEN** the user creates an FSM type allowing both sexes with 2 participants
- **THEN** weeks can instantiate that type with TITULAR and AJUDANTE slots

#### Scenario: Default FSM types on seed
- **WHEN** the database is seeded
- **THEN** at least three default FSM catalog types exist

### Requirement: Nossa Vida Cristã catalog supports add/remove with fixed final study
The system SHALL allow adding and removing Nossa Vida Cristã parts except the final Estudo bíblico de congregação, which MUST remain last and require DIRIGENTE and LEITOR. All NVC parts MUST be male-only.

#### Scenario: Cannot remove congregation Bible study
- **WHEN** the user attempts to remove Estudo bíblico de congregação from a week
- **THEN** the system rejects the removal

#### Scenario: Default NVC parts on week create
- **WHEN** a week is created from template
- **THEN** two default NVC parts plus Estudo bíblico de congregação are created

### Requirement: Out-of-topic parts are male-only single participant
The system SHALL require Presidente, Oração inicial, and Oração final to be male-only with exactly one participant each.

#### Scenario: Female candidate filtered for president
- **WHEN** listing candidates for Presidente
- **THEN** female participants are not included
