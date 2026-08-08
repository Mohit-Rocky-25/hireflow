# Candidate Funnel Drop-off Telemetry & Analytics Schema

Event instrumentation schema for tracking applicant drop-off, interaction bottlenecks, and submission completion rates.

## 1. Funnel Stages

1. `JOB_VIEW`: Candidate views job specification details.
2. `APPLICATION_START`: Candidate clicks "Apply Now" and initiates application workflow.
3. `RESUME_UPLOAD`: Candidate attaches resume and initiates parsing.
4. `PREVIEW_CONFIRM`: Candidate reviews extracted structured profile.
5. `SUBMIT_COMPLETE`: Application safely delivered to hiring organization.

## 2. Telemetry Payload Schema

```json
{
  "eventId": "uuid-v4",
  "funnelStage": "PREVIEW_CONFIRM",
  "dwellTimeSeconds": 42.5,
  "clientDeviceType": "mobile",
  "dropOffFlag": false
}
```

