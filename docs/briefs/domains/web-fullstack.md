# Full-Stack Web & Microfrontends Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **GraphQL N+1**: GraphQL N+1 query problem exhausting database connection pools without DataLoader batching.
2. **Cross-tenant data**: Cross-tenant data leakage in multi-tenant SaaS applications lacking Row-Level Security (RLS).
3. **Micro-frontend host**: Micro-frontend host shells crashing due to uncaught runtime exceptions in child federated remotes.
4. **Race conditions**: Race conditions during e-commerce checkout allowing inventory overselling.
5. **Unbounded WebSocket**: Unbounded WebSocket broadcast fanout degrading UI responsiveness on connected clients.

## 2. Authoritative Reference Sources
- W3C Web Application Security Working Group Standards (CORS, CSP, CSRF)
- GraphQL Federation Specification & DataLoader Pattern Documentation
- Webpack Module Federation Architecture Guide
- PostgreSQL Row-Level Security (RLS) Documentation

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Verify multi-tenant queries enforce strict tenant scoping via database RLS or query middleware.
- [ ] **Check 2:** Assert GraphQL resolvers utilize DataLoader batching to eliminate N+1 database queries.
- [ ] **Check 3:** Check that micro-frontend shells wrap remotes with React Error Boundaries and versioned contract shims.
- [ ] **Check 4:** Ensure checkout endpoints implement atomic reservation locks to guarantee zero inventory overselling.
