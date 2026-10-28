# Modern Data Engineering & Analytics Infra Domain Checklist

## 1. Domain Pitfalls & Failure Modes
1. **The "small**: The "small files problem" in cloud object storage data lakes causing 10x query slowdowns.
2. **Silent data**: Silent data quality degradation (null value spikes, schema drift) passing undetected into production tables.
3. **Unpartitioned analytical**: Unpartitioned analytical queries scanning entire multi-terabyte datasets.
4. **Approximate deduplication**: Approximate deduplication discarding legitimate unique events in streaming pipelines.
5. **CDC pipelines**: CDC pipelines losing state during Kafka broker disconnects or LSN drift.

## 2. Authoritative Reference Sources
- Apache Parquet Format Specification (Columnar Storage & Snappy Compression)
- ClickHouse Official Documentation (MergeTree Engine Family & Materialized Views)
- DuckDB Documentation (Vectorized Execution & Direct Parquet Query Pushdown)
- Uber H3 Documentation (Hexagonal Hierarchical Spatial Indexing System)

## 3. Mandatory Reviewer Correctness Checks
- [ ] **Check 1:** Verify that columnar data lakes implement compaction workers targeting 128MB-256MB Parquet row groups.
- [ ] **Check 2:** Assert that analytical query engines leverage projection pushdown and partition pruning.
- [ ] **Check 3:** Confirm that CDC synchronizers maintain confirmed LSN checkpoints and handle tombstone deletes.
- [ ] **Check 4:** Check that geospatial engines utilize discrete hierarchical grid systems (H3/S2) rather than trigonometric loops.
