## ADDED Requirements

### Requirement: Single congregation user can authenticate
The system SHALL allow exactly one configured congregation user to sign in with email and password and obtain an authenticated session.

#### Scenario: Successful login
- **WHEN** the user submits valid credentials
- **THEN** the system creates an authenticated session and grants access to protected resources

#### Scenario: Invalid credentials
- **WHEN** the user submits invalid credentials
- **THEN** the system denies access and does not create a session

### Requirement: Protected API and app routes require authentication
The system SHALL reject unauthenticated access to application pages (except login) and API endpoints (except health/login).

#### Scenario: Unauthenticated API call
- **WHEN** a client calls a protected API without a valid session
- **THEN** the system responds with HTTP 401

#### Scenario: Unauthenticated app navigation
- **WHEN** an unauthenticated user opens a protected page
- **THEN** the system redirects to the login page

### Requirement: User can end the session
The system SHALL allow the authenticated user to log out and invalidate the current session.

#### Scenario: Logout
- **WHEN** the authenticated user logs out
- **THEN** subsequent requests with the previous session are rejected
