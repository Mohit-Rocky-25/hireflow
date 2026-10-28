# HireFlow Project Brief Verification Risk Tiers

> **Audit Scope**: All 158 briefs evaluated for verification difficulty and architectural risk.
> **Tier 1 (High Risk)**: 17 briefs | **Tier 2 (Moderate)**: 75 briefs | **Tier 3 (Standard)**: 66 briefs

## Tier-1 Priority Reference Run Candidates (Top 15)

| Rank | Brief ID | Title | Domain | Risk Score | Key Complexity Factors |
|:---:|---|---|---|:---:|---|
| 1 | `brief-gitops-registry` | GitOps Continuous Deployment Controller with ... | Platform & DevOps | **11** | Distributed consensus / streaming cluster complexity; Kubernetes API / Operator runtime dependency; Security auditing & cryptographic payload boundary |
| 2 | `brief-kubernetes-operator` | Custom Kubernetes Operator in Go with CRD Lif... | Platform & DevOps | **11** | Distributed consensus / streaming cluster complexity; Kubernetes API / Operator runtime dependency; Security auditing & cryptographic payload boundary |
| 3 | `cert-ckad` | Certified Kubernetes Application Developer (C... | Cloud Native & Containers | **11** | Distributed consensus / streaming cluster complexity; Kubernetes API / Operator runtime dependency; Security auditing & cryptographic payload boundary |
| 4 | `brief-api-gateway-scratch` | API Gateway from Scratch with Plugin Architec... | Distributed Systems | **9** | Distributed consensus / streaming cluster complexity; OS kernel primitives or lock-free concurrent synchronization |
| 5 | `brief-dist-cache-rust` | Distributed In-Memory Key-Value Cache Engine ... | Systems Programming | **9** | Distributed consensus / streaming cluster complexity; OS kernel primitives or lock-free concurrent synchronization |
| 6 | `brief-graphql-federation` | Federated GraphQL Gateway with Distributed Qu... | Full-Stack Web | **9** | Distributed consensus / streaming cluster complexity; Security auditing & cryptographic payload boundary |
| 7 | `brief-llm-finetuning-peft` | Domain-Specific LLM Fine-Tuning Pipeline with... | GenAI & LLM Engineering | **9** | Distributed consensus / streaming cluster complexity; GPU hardware acceleration dependency (quantized fallback needed) |
| 8 | `brief-realtime-code-execution` | Secure Remote Code Execution Sandbox in Go wi... | Security & Platform | **9** | Security auditing & cryptographic payload boundary; OS kernel primitives or lock-free concurrent synchronization |
| 9 | `brief-zero-trust-proxy` | Least-Privilege API Security Gateway with RS2... | Security & Platform | **9** | Distributed consensus / streaming cluster complexity; Security auditing & cryptographic payload boundary |
| 10 | `brief-llm-firewall-guardrail` | Real-Time LLM Security Firewall & Prompt Inje... | Generative AI & LLMOps | **9** | Distributed consensus / streaming cluster complexity; Security auditing & cryptographic payload boundary |
| 11 | `brief-sse-websocket-broadcaster` | Real-Time WebSocket & SSE Pub/Sub Fanout Broa... | High-Scale Backend & Distributed Architecture | **9** | Distributed consensus / streaming cluster complexity; OS kernel primitives or lock-free concurrent synchronization |
| 12 | `brief-container-runtime` | Minimal Container Runtime (Docker-like) in Go... | Systems Programming | **8** | Kubernetes API / Operator runtime dependency; OS kernel primitives or lock-free concurrent synchronization |
| 13 | `brief-service-mesh` | Service Mesh Zero-Trust Architecture with Ist... | Platform & DevOps | **8** | Distributed consensus / streaming cluster complexity; Kubernetes API / Operator runtime dependency |
| 14 | `cert-gcp-ace` | Google Cloud Associate Cloud Engineer (ACE) I... | Cloud Infrastructure & Kubernetes | **8** | Distributed consensus / streaming cluster complexity; Kubernetes API / Operator runtime dependency |
| 15 | `brief-k8s-crd-operator` | Custom Kubernetes CRD & Controller Operator i... | Cloud Native & DevOps Engineering | **8** | Distributed consensus / streaming cluster complexity; Kubernetes API / Operator runtime dependency |

## Full Catalog Risk Distribution Summary

- **Tier 1**: High concurrency, kernel hooks, hardware acceleration, or multi-node streaming distributed state.
- **Tier 2**: Async queues, relational transactions, caching tiers, or authenticated REST/gRPC services.
- **Tier 3**: Static analysis, CLI tools, parsers, or algorithmic utilities with deterministic golden vector evaluation.
