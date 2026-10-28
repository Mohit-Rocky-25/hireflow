# Cloud Native, DevOps & Site Reliability Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **Kubernetes controllers**: Kubernetes controllers creating tight infinite reconciliation loops that peg CPU at 100%.
2. **Orphaned child**: Orphaned child resources persisting after parent Custom Resource deletion without OwnerReferences.
3. **Canary rollouts**: Canary rollouts shifting traffic without automated error-rate metric regression gates.
4. **Hardcoding secrets**: Hardcoding secrets into Git repositories or unencrypted base64 Kubernetes Secret manifests.
5. **Untested database**: Untested database backups failing restore drills during actual disaster recovery incidents.

## 2. Authoritative Reference Sources
- Kubernetes API Machinery Documentation (Controllers, Informers & Custom Resource Definitions)
- Envoy Proxy Dynamic Discovery Service (xDS API) Specification
- OpenTelemetry Specification (W3C TraceContext & OTLP Protocol Standards)
- Google SRE Book (Site Reliability Engineering: Measuring Service Level Objectives)

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Verify Kubernetes operators register OwnerReferences on all managed child pods and services.
- [ ] **Check 2:** Assert that canary routing engines evaluate Prometheus error rates and execute rollbacks within 2 seconds.
- [ ] **Check 3:** Check that preview sandbox provisioners enforce strict host CPU/RAM quotas and automated cleanup hooks.
- [ ] **Check 4:** Confirm that disaster recovery harnesses measure empirical RTO (restore time) and RPO (data drift).
