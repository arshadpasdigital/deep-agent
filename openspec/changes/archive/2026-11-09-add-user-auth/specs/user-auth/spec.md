# Spec Delta

## Purpose

Let users create and access an account with email and password or Google, prove
ownership of their email with a one-time code, and keep a secure session through
the API gateway.

## ADDED Requirements

### Requirement: Password registration requires email verification

The system SHALL create a new account from a name, email, and password, and MUST
mark the email unverified until a valid one-time code is confirmed.

#### Scenario: Registering a new account

- **WHEN** a visitor submits a unique email, a name, and a valid password
- **THEN** the system creates an unverified account and sends a one-time code to
  that email

#### Scenario: Signing in before verification

- **WHEN** an unverified user submits their correct email and password
- **THEN** the system rejects the sign-in and indicates that email verification
  is required

#### Scenario: Duplicate email

- **WHEN** a visitor registers with an email that already has an account
- **THEN** the system does not create or modify an account and returns a generic
  acknowledgement that does not reveal the existing account

#### Scenario: Weak password

- **WHEN** a visitor submits a password shorter than the configured minimum
- **THEN** the system rejects the registration with a field-level error

### Requirement: Email one-time codes verify ownership

The system SHALL issue a short-lived numeric code, store it so it cannot be read
back in plaintext, accept it once, and limit repeated attempts.

#### Scenario: Confirming a valid code

- **WHEN** the user submits the current code for their email before it expires
- **THEN** the system marks the email verified and establishes a session

#### Scenario: Expired code

- **WHEN** the user submits a code after its expiry window
- **THEN** the system rejects it and offers to send a new code

#### Scenario: Wrong code attempts

- **WHEN** the user submits an incorrect code more times than the allowed limit
- **THEN** the system blocks further attempts until a new code is issued

#### Scenario: Reusing a consumed code

- **WHEN** a code that already verified an email is submitted again
- **THEN** the system rejects it

#### Scenario: Resending a code

- **WHEN** the user requests another code before the resend cooldown elapses
- **THEN** the system refuses to send a new code and reports when to retry

### Requirement: Email-code sign-in

The system SHALL allow an existing verified user to sign in with a one-time code
instead of a password.

#### Scenario: Signing in with a code

- **WHEN** a verified user requests a sign-in code and submits the correct value
- **THEN** the system establishes a session without requiring a password

#### Scenario: Unknown email

- **WHEN** someone requests a sign-in code for an email with no account
- **THEN** the system returns the same acknowledgement as for a known email and
  sends nothing, so account existence is not revealed

#### Scenario: Code for an unverified email

- **WHEN** the user requests a sign-in code for an account whose email is not
  verified
- **THEN** the system sends a verification code and does not start a session
  until it is confirmed

### Requirement: Google sign-in

The system SHALL let users authenticate with Google and MUST treat a Google
account as having a verified email.

#### Scenario: Successful Google sign-in

- **WHEN** the user completes the Google consent flow with a verified email
- **THEN** the system establishes a session without asking for an OTP

#### Scenario: New Google user

- **WHEN** a Google identity has no existing account
- **THEN** the system creates a verified account with the Google name and email

#### Scenario: Existing verified email

- **WHEN** a Google identity matches an existing verified account's email
- **THEN** the system signs the user into that account instead of creating a
  duplicate

#### Scenario: Unverified existing email

- **WHEN** a Google identity matches an existing account whose email is not
  verified
- **THEN** the system does not silently link the accounts and instead requires
  the email verification flow

### Requirement: Session lifecycle

The system SHALL represent an authenticated session with a secure, HTTP-only
cookie and expose the current user to the browser through the gateway.

#### Scenario: Session established

- **WHEN** authentication succeeds through any supported method
- **THEN** the system returns a session cookie scoped to the gateway origin and
  the authenticated user's public profile

#### Scenario: Current session

- **WHEN** the browser requests the current session with a valid cookie
- **THEN** the system returns the authenticated user

#### Scenario: Unauthenticated request

- **WHEN** a request arrives without a valid session cookie
- **THEN** the system returns an unauthorized response

#### Scenario: Signing out

- **WHEN** the user signs out
- **THEN** the system invalidates the session and clears the cookie

### Requirement: Auth endpoints are reachable through the gateway

The system MUST expose authentication endpoints through the API gateway without
breaking cookie handling or upstream response behavior.

#### Scenario: Auth request through the gateway

- **WHEN** the browser calls an authentication endpoint on the gateway
- **THEN** the request reaches the auth service and the response status, headers,
  and cookies are returned unchanged

#### Scenario: Cross-origin browser request

- **WHEN** the configured web origin calls the gateway with credentials
- **THEN** the gateway permits that origin, allows credentials, and preserves the
  session cookie

### Requirement: OTP delivery failure is recorded

The system MUST detect a failure to deliver a code, record it server-side, and
leave the email unverified, while keeping the client response generic so account
existence is not revealed. The documented development fallback is exempt.

#### Scenario: Mail transport fails

- **WHEN** the notification transport cannot send an OTP email
- **THEN** the notification request fails with a generic delivery error, the
  failure is logged server-side, the email remains unverified, and the auth
  response does not reveal account existence

#### Scenario: Development without mail

- **WHEN** the environment is not production and no mail transport is configured
- **THEN** the system records the OTP in development logs and allows the flow to
  continue

#### Scenario: OTP content

- **WHEN** an OTP email is sent
- **THEN** it contains the code, the action it authorizes, and its expiry
