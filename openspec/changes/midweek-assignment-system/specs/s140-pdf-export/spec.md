## ADDED Requirements

### Requirement: User can export S-140 PDF for a month
The system SHALL generate a downloadable PDF of the midweek meeting schedule for a selected month in S-140 layout.

#### Scenario: Export month PDF
- **WHEN** the user requests S-140 export for a month that has weeks
- **THEN** the system returns a PDF file containing all weeks of that month

### Requirement: PDF includes congregation name and computed meeting dates
The system SHALL render the configured congregation name and each week’s `meetingDate` on the PDF.

#### Scenario: PDF reflects settings
- **WHEN** congregation name is “Congregação Exemplo” and meeting weekday is Thursday
- **THEN** the PDF shows that name and Thursday dates for each week

### Requirement: PDF shows assigned participants and part structure
The system SHALL include topics, part titles/themes, and assigned participant names (including pairs as Name/Name and Dirigente/Leitor for the study).

#### Scenario: Pair rendering
- **WHEN** a part has TITULAR and AJUDANTE assigned
- **THEN** the PDF shows both names in pair format

#### Scenario: Empty slots
- **WHEN** a part slot has no participant
- **THEN** the PDF shows an empty placeholder for that slot
