# Verified Employer Identity Protocol

Security specification for anti-fraud company verification and verified employer badge distribution in HireFlow.

## 1. Domain & DNS Validation

- **Automated DNS TXT Challenge:** Employer domain administrators verify control by publishing a unique challenge record `_hireflow-verify.<domain>`.
- **Corporate Email Handshake:** Hiring managers must verify active corporate inbox ownership with SPF/DKIM verification.

## 2. Fraud Prevention & Trust Scoring

- Automatic quarantine of unverified domains posting high-risk salary outlier positions.
- Trust tier levels: Unverified, Email-Verified, Enterprise-Verified.

