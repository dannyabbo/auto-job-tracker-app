# AutoJobTracker System Design

## What is this?

Connects to your email, finds job-related emails, pulls out the important info (company, role, status, etc), and shows it all in a dashboard. Should work for lots of users eventually.

## Requirements

### Functional

- OAuth into user email
- Fetch old + new emails
- Figure out which ones are job related
- Extract: company, role, posting link, date applied, status, source
- Group emails into one application (e.g. multiple emails from same company about same role)
- Update status when things change (got rejected, interview scheduled, etc)
- Dashboard + export (csv, google sheets)

### Non-functional

- Handle big mailboxes
- Don't hit rate limits
- Keep user data private/secure
- Fast + accurate extraction without spending too much on LLM
- Monitoring, error handling

## Architecture

Main pieces:

- Auth service - OAuth flow, token storage
- Email connector - fetches from Gmail, normalizes content
- Queue - holds emails to be processed
- Classifier/extractor - rules + LLM to identify job emails and pull out fields
- Tracker service - dedupes, links emails to applications, tracks status
- DB - users, applications, events, emails
- API - endpoints for UI and exports
- Dashboard - shows everything to the user

## Data Model

### Users

- user_id, primary_email, email_provider, token_reference, timestamps

### JobApplications

- application_id, user_id, company_name, role_title, location, source (LinkedIn etc), application_date, current_status, job_posting_url, confidence_score, timestamps

### ApplicationEvents

- event_id, application_id, event_type (applied/rejected/interview/etc), event_timestamp, summary_text, email_id

### Emails

- email_id, user_id, provider_message_id, subject, from, received_at, storage_link (if we keep body), classification_result

## Workflows

### Onboarding + historical import

1. User signs in, connects Gmail via OAuth
2. Initial sync pulls emails from last X days
3. Each email goes into queue
4. Workers classify and extract
5. Tracker populates over time

### Ongoing processing

1. Poll or push for new emails
2. Run through classification pipeline
3. If matches existing application -> update status/timeline
4. If new -> create application record

### Classification strategy

- Heuristics for known domains (Greenhouse, Workday, Lever, LinkedIn)
- LLM prompt returns structured JSON
- Retry/fallback for failures
- Cache by message id so we don't reprocess
- Confidence scores, show low-confidence stuff in UI for review

## Scaling

- Horizontal scale fetchers and processors
- Partition queue by user
- Rate limit counters per provider and per user
- Sync checkpoints so we can resume

## Storage

- Raw email bodies stored temp or compressed
- Main structured data in relational DB

## Security

- OAuth tokens in secret vault
- Encrypt user data at rest
- Minimal email permissions
- Optional: let user choose if we keep email bodies

## Fault tolerance

- Idempotent ops (key on message id)
- Dead letter queue for problem emails
- Monitoring + alerts

## API

- GET /applications (with filters)
- GET /applications/:id (with timeline)
- Export endpoint (csv or sheets)

## Dashboard

- Table view with sort/filter
- Timeline view per application
- Inline corrections for wrong labels
- Settings for classification sensitivity

## Future ideas

- Outlook + IMAP support
- Fine-tuned model to cut LLM costs
- Notifications for stalled apps
- Use user corrections to improve classifier
- ATS/job board API integrations
