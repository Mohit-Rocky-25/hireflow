# Candidate PII Redaction & Data Retention Policy

Privacy guidelines for automated personally identifiable information (PII) stripping and GDPR compliance in HireFlow.

## 1. Automated Blind Screening Redaction

To prevent unconscious hiring bias and enforce data privacy standards:
- Name, postal address, phone numbers, and profile photos are scrubbed during initial evaluation phases.
- Educational institution names can be optionally abstracted to accredited degree levels during blind review mode.

## 2. Retention Lifecycles

- Unaccepted applicant resumes are purged after 180 days unless affirmative candidate talent pool consent is provided.
- Right-to-be-forgotten webhooks trigger cascading deletions across vector embeddings and relational application records.

