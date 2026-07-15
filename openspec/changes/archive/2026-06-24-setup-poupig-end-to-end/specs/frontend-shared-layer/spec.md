## ADDED Requirements

### Requirement: Next.js frontend shared layer

The system SHALL configure the Next.js/React frontend shared structure via the `config-shared-frontend` skill, installing the common components into the target frontend project.

#### Scenario: Shared structure and routes configured

- **WHEN** the `config-shared-frontend` skill is applied
- **THEN** the `shared/` structure and Next.js route groups (public/private) are created
- **AND** navigation lives in the private group layout, not in `shared/`

#### Scenario: Common components installed

- **WHEN** the frontend is inspected after configuration
- **THEN** the common components (single menu, landing page, example auth screen, open dashboard) are present
- **AND** the dashboard is accessible without an auth block
