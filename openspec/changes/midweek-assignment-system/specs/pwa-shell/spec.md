## ADDED Requirements

### Requirement: App is installable as a PWA
The system SHALL provide a Progressive Web App shell (manifest and service worker) so the authenticated user can install it on mobile and desktop.

#### Scenario: Manifest available
- **WHEN** the browser requests the web app manifest
- **THEN** the app name, icons, and display mode are provided for installation

### Requirement: Mobile-first bottom navigation
The system SHALL present primary navigation at the bottom on mobile using icons. On larger breakpoints, the system MUST also show the screen name next to each icon.

#### Scenario: Mobile icons only
- **WHEN** the viewport is phone-sized
- **THEN** bottom navigation shows icons without requiring text labels

#### Scenario: Larger screens show labels
- **WHEN** the viewport is tablet/desktop sized at the configured breakpoint
- **THEN** bottom navigation shows icon and screen name

### Requirement: Desktop remains fully usable
The system SHALL keep all primary flows usable on desktop viewports with the same navigation model adapted for larger screens.

#### Scenario: Desktop can manage assignments
- **WHEN** the user accesses the app on desktop
- **THEN** participants, schedule, history, settings, and PDF export are reachable
