## MODIFIED Requirements

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
