# Spec Delta

## Purpose

Give visitors one focused browser surface to create an account, verify their
email with a code, sign in with a password, a code, or Google, and land in an
authenticated session.

## ADDED Requirements

### Requirement: Single auth route with modes

The application SHALL expose an `/auth` route that defaults to sign-in and lets
the visitor switch between sign-in and sign-up without leaving the page.

#### Scenario: Opening the page

- **WHEN** a visitor navigates to `/auth` while signed out
- **THEN** the page shows the sign-in form with email and password fields and a
  way to switch to sign-up

#### Scenario: Switching modes

- **WHEN** the visitor switches between sign-in and sign-up
- **THEN** the form changes to the matching fields, prior errors are cleared, and
  sensitive fields are not carried across modes

#### Scenario: Already signed in

- **WHEN** a signed-in visitor opens `/auth`
- **THEN** the application redirects to `/` instead of showing the forms

### Requirement: Password sign-in

The page SHALL sign users in with email and password and MUST keep the visitor on
the page with an actionable message when sign-in fails.

#### Scenario: Successful sign-in

- **WHEN** the visitor submits valid credentials
- **THEN** a session is established and the application redirects to `/`

#### Scenario: Invalid credentials

- **WHEN** the visitor submits an email and password that do not match
- **THEN** the page shows an inline error, keeps the email, and clears the
  password field

#### Scenario: Unverified email

- **WHEN** the visitor submits correct credentials for an unverified account
- **THEN** the page moves to the verification step with the message that the email
  must be verified

#### Scenario: Pending request

- **WHEN** a sign-in request is in flight
- **THEN** the primary action is disabled and shows a pending state

### Requirement: Sign-up with email verification

The page SHALL create an account from name, email, and password, then require the
emailed code before the account is usable.

#### Scenario: Creating an account

- **WHEN** the visitor submits a valid name, email, and password in sign-up mode
- **THEN** the page moves to the verification step and shows the submitted email

#### Scenario: Client-side validation

- **WHEN** the visitor submits an invalid email or a password below the minimum
- **THEN** the page shows a field-level error and does not send a request

#### Scenario: Existing account

- **WHEN** the visitor submits an email that already has an account
- **THEN** the page shows the same verification step as a new registration and
  does not reveal whether the account existed

### Requirement: Email-code sign-in and verification

The page SHALL support a one-time code as both the sign-up verification and an
alternative sign-in method.

#### Scenario: Requesting a code

- **WHEN** the visitor chooses "email me a code" in sign-in mode
- **THEN** the page requests a sign-in code and moves to the verification step

#### Scenario: Confirming the code

- **WHEN** the visitor submits the current six-digit code
- **THEN** a session is established and the application redirects to `/`

#### Scenario: Incorrect code

- **WHEN** the visitor submits a code that does not match
- **THEN** the page shows an inline error and keeps the code field available

#### Scenario: Expired code

- **WHEN** the visitor submits a code after it expired
- **THEN** the page reports that the code expired and enables requesting a new one

#### Scenario: Too many attempts

- **WHEN** the visitor exhausts the allowed code attempts
- **THEN** the page stops accepting the current code and requires a new one

#### Scenario: Resending a code

- **WHEN** the visitor requests another code before the cooldown elapses
- **THEN** the resend action is unavailable and shows the remaining wait; after
  the cooldown it becomes available again

#### Scenario: Returning to sign-in

- **WHEN** the visitor chooses to use a password instead
- **THEN** the page returns to sign-in with the email preserved

### Requirement: Google sign-in

The page SHALL offer Google as a sign-in method and return the visitor to the
authenticated application after the provider flow.

#### Scenario: Starting Google sign-in

- **WHEN** the visitor activates "Continue with Google"
- **THEN** the browser starts the provider consent flow

#### Scenario: Completing Google sign-in

- **WHEN** the provider returns a successful callback
- **THEN** a session is established and the application redirects to `/`

#### Scenario: Provider failure

- **WHEN** the provider flow fails or is cancelled
- **THEN** the page shows an actionable error and remains usable

#### Scenario: Provider not configured

- **WHEN** Google credentials are unavailable on the server
- **THEN** the failure is surfaced in the panel without breaking the other
  sign-in methods

### Requirement: Actionable error and loading states

The page SHALL keep the visitor oriented during failures and MUST NOT leave an
action silently stuck.

#### Scenario: Network or gateway failure

- **WHEN** a request fails because the server is unreachable
- **THEN** the page shows a retryable error and preserves what the visitor typed

#### Scenario: Rate limited

- **WHEN** the server refuses a request due to rate limiting
- **THEN** the page explains the wait instead of showing a generic failure

#### Scenario: Session check

- **WHEN** the page is checking whether a session exists
- **THEN** it shows a stable loading state and does not flash the forms

### Requirement: Accessible and responsive auth surface

The page MUST be operable with a keyboard and screen reader, and MUST remain
usable at mobile and desktop widths in both themes.

#### Scenario: Keyboard and screen reader

- **WHEN** a visitor navigates with a keyboard or assistive technology
- **THEN** every field has a label, errors are announced, focus moves to the
  first invalid field, and the OTP field accepts a pasted code

#### Scenario: Mobile width

- **WHEN** the page is viewed at 375px wide
- **THEN** the panel fits without horizontal scrolling and all actions remain
  reachable

#### Scenario: Desktop and themes

- **WHEN** the page is viewed at 768px or 1440px in light or dark mode
- **THEN** the layout stays centered and readable, with sufficient contrast and
  reduced motion respected

#### Scenario: Single primary action

- **WHEN** a step is displayed
- **THEN** only one action is visually primary, and secondary actions are
  recognizably subordinate
