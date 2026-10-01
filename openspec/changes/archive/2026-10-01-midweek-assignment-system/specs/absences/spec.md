## ADDED Requirements

### Requirement: User can register absence periods
The system SHALL allow creating an absence for a participant with a start date, optional end date, and optional justification.

#### Scenario: Create dated absence
- **WHEN** the user registers an absence with start and end dates
- **THEN** the participant is inactive for assignment lists whose meeting date falls within the absence interval

#### Scenario: Create open-ended absence
- **WHEN** the user registers an absence without an end date
- **THEN** the participant MUST NOT appear in any assignment candidate list until reactivated

### Requirement: Open-ended absence blocks all assignments
The system SHALL forbid assigning a participant who has an active open-ended absence.

#### Scenario: Attempt assign during open-ended absence
- **WHEN** the user tries to assign a participant with active open-ended absence
- **THEN** the system rejects the assignment

### Requirement: Future eligibility after dated absence end
The system SHALL include a participant in candidate lists for meeting dates after the absence end date even if the user has not yet explicitly reactivated them.

#### Scenario: Visible after absence end month
- **WHEN** a participant absence ends in November
- **THEN** the participant appears as a candidate for December meeting dates

### Requirement: Alert when dated absence ends
The system SHALL alert the user when a dated absence period has ended and offer reactivation or a new absence period.

#### Scenario: End-of-absence alert
- **WHEN** today is after an absence `endsOn` and the absence is not yet acknowledged
- **THEN** the dashboard shows an alert for that participant

### Requirement: Absence history is available
The system SHALL keep and display the history of absence periods for a participant.

#### Scenario: View absence history
- **WHEN** the user opens absence history for a participant
- **THEN** past and current absence periods are listed

### Requirement: Justification is hidden by default
The system SHALL hide absence justification by default and reveal it only when the user explicitly requests to show justification.

#### Scenario: Reveal justification
- **WHEN** the user presses “show justification”
- **THEN** the justification text becomes visible

#### Scenario: List without justification
- **WHEN** absences are listed without reveal flag
- **THEN** justification content is not included in the response payload
