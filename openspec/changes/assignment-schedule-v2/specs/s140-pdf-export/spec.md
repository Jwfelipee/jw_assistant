## MODIFIED Requirements

### Requirement: User can export S-140 PDF for a month
The system SHALL generate a downloadable PDF of the midweek meeting schedule for a selected month whose visual layout closely matches the official `S-140.docx` reference in the repository.

#### Scenario: Export month PDF
- **WHEN** the user requests S-140 export for a month that has weeks
- **THEN** the system returns a PDF file with one page per week

#### Scenario: PDF week header format
- **WHEN** a week is rendered in the PDF
- **THEN** the header shows the meeting date in `dd/MM/yyyy` format followed by `| LEITURA SEMANAL DA BÍBLIA`

#### Scenario: PDF includes S-140 structural elements
- **WHEN** a week is rendered in the PDF
- **THEN** it includes presidente, oração inicial, cântico placeholder, comentários iniciais (1 min), section headers with Salão principal where applicable, numbered parts with duration labels, NVC cântico placeholder, comentários finais (3 min), closing cântico placeholder, and oração final

#### Scenario: PDF numbered parts
- **WHEN** treasures, FSM, NVC, and study parts are rendered
- **THEN** parts are numbered sequentially (1–10) matching S-140 conventions for that week

#### Scenario: PDF time column
- **WHEN** part rows are rendered
- **THEN** a right-aligned time placeholder column (`0:00`) appears as in the official form

### Requirement: PDF includes congregation name and computed meeting dates
The system SHALL render the configured congregation name centered at the top of each page and each week's meeting date in the S-140 header format.

#### Scenario: PDF reflects settings
- **WHEN** congregation name is configured and meeting weekday is Thursday
- **THEN** the PDF shows that name on each page and Thursday dates for each week

### Requirement: PDF shows assigned participants and part structure
The system SHALL include part titles/themes, duration labels, and assigned participant names (including pairs as Name/Name and Dirigente/Leitor for the study).

#### Scenario: Pair rendering
- **WHEN** a part has TITULAR and AJUDANTE assigned
- **THEN** the PDF shows both names in `Name/Name` format

#### Scenario: Empty slots
- **WHEN** a part slot has no participant
- **THEN** the PDF shows an underline placeholder for that slot

#### Scenario: Study pair label
- **WHEN** the congregation Bible study is rendered
- **THEN** the PDF shows `Dirigente/leitor:` before the pair names as in S-140
