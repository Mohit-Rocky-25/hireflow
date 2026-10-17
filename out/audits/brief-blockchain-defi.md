# Audit & Diagnosis: brief-blockchain-defi

- **Old Title**: DeFi Lending Protocol Smart Contract on Ethereum
- **Domain**: Blockchain & Web3
- **Old Difficulty**: ADVANCED
- **Old Stated Hours**: 38 hours
- **True Effort Estimate of Old Scope**: ~22-25 hours; inflated and copied generic web-service targets.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines: 'passes when verified by automated test script or benchmark log' across all 5 checks)
- Technical Accuracy: 4.0 / 10 (copied web-service targets: 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' onto a SMART CONTRACT project! Cap applied: max 5)
- Scope Realism: 5.0 / 10 (no component mapping)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 4.0 / 10 (banned employer and growth claims: 'SEBI and RBI. Web3 companies like CoinDCX, WazirX... actively seek'; pre-filled bullet: 'managing simulated $[K]+ TVL')
- Resume Bullet Safety: 4.0 / 10 (pre-filled numbers and missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.48 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Pasted web-service targets onto smart contract**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Smart contracts run on the EVM; evaluating them with k6 throughput is technically absurd and demonstrates template copying.
2. **Circular rubric pass criteria**:
   > "1. Verify mainnet fork test simulating real price crashes... passes when verified by automated test script or benchmark log."
   *Flaw*: Every single rubric item ended with this meaningless tautological phrase.
3. **Banned employer & growth marketing**:
   > "In India, crypto lending and DeFi are growing with regulatory clarity from SEBI and RBI. Web3 companies like CoinDCX, WazirX, and international DeFi protocols hire for smart contract engineering."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 34 hours (ADVANCED); runs locally on Hardhat node without gas fees or cloud accounts.
2. **Does each performance target name its bottleneck and is reachable?** YES. Gas ceilings (< 95k deposit, < 160k borrow) and liquidation invariants measured directly via Hardhat gas reporter.
3. **Is there a CPU/local/free fallback?** YES. Local Hardhat in-memory node with mock price oracles at $0 cost.
4. **Can test data be created in minutes?** YES. Mock ERC20 tokens and Chainlink price aggregator contracts provided as code fixtures.
5. **Can screener check rubric in under 10 minutes?** YES. Hardhat test runner and Slither scan run in under 3 minutes.
6. **Are targets and rubric project-specific?** YES. EVM gas consumption, liquidation health factor restoration, and Slither detector rules are unique to smart contracts.
7. **Is every bullet claim verified by rubric?** YES. Jump Rate and liquidation verified by Checks 1 & 2; gas verified by Check 4; Slither verified by Check 3.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] executes live reentrancy exploit contract and validates EVM revert.
9. **Are all terms accurate?** YES. Replaced web-service metrics with EVM gas, utilization ratios, health factors, and Slither audits.
10. **Does problem statement promise only what is verified?** YES. Core lending pool, interest rates, liquidation, and security audits are directly built and tested.
11. **Are privacy and safety notes addressed?** YES. Synthetic local test accounts only; no real private keys or funds.
12. **Are all hard parts technical?** YES. 4 technical challenges covering reentrancy, fixed-point math, oracle manipulation, and gas optimization.

### New Scores (Part 2 Dimensions)
- Topic Value: 9.5 / 10
- Verification Rubric: 9.5 / 10
- Technical Accuracy: 9.5 / 10
- Scope Realism: 9.0 / 10
- Completeness: 9.5 / 10
- Honesty: 9.5 / 10
- Resume Bullet Safety: 9.5 / 10
- **New Weighted Score**: 9.43 / 10 (Band A)

### Change Log
- Scope & Hours: Recalculated bottom-up (30 component hours * 1.15 buffer = 34 hours). Split flash loans and multi-collateral isolation to Extended Path (+15h).
- Removed Generic Targets: Completely eliminated pasted web-service k6 throughput targets; replaced with authentic smart contract metrics (gas consumption ceilings, liquidation invariants, and Slither zero-vulnerability count).
- Eliminated Banned Content: Removed CoinDCX, WazirX, SEBI, and RBI marketing mentions.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake reentrancy exploit test.
- Resume Formula: Formatted with measured gas placeholder [DEPOSIT_GAS] and explicit 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
