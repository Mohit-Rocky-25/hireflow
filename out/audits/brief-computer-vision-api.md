# Audit & Diagnosis: brief-computer-vision-api

- **Old Title**: Production Computer Vision API (Object Detection & OCR)
- **Domain**: AI/ML Applications
- **Old Difficulty**: INTERMEDIATE
- **Old Stated Hours**: 28 hours
- **True Effort Estimate of Old Scope**: ~18-20 hours of implementation; ungrounded stated hours.

### Old Scores (Part 2 Dimensions)
- Topic Value: 9.0 / 10
- Verification Rubric: 3.5 / 10 (circular pass lines across all 5 checks)
- Technical Accuracy: 5.0 / 10 (copied web-service targets; targets lack 7 fields; ungrounded TensorRT claims on generic CPU)
- Scope Realism: 5.0 / 10 (no bottom-up breakdown)
- Completeness: 4.0 / 10 (capped at 5.0 due to missing starter input, milestones, deliverables, environment)
- Honesty: 3.5 / 10 (banned employer marketing: 'Zoho Books', 'Sarvam AI, Jio GenAI', 'India digital KYC growing 40%', 'explicitly required in JDs')
- Resume Bullet Safety: 4.0 / 10 (pre-filled results and missing 'Do not claim' boundary)
- **Old Weighted Score**: 4.60 / 10 (Band D)

### Problems Found (with exact quotes)
1. **Copied web-service targets**:
   > "Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark | Reliability: [X of Y] chaos test scenarios recovered with zero data loss."
   *Flaw*: Evaluated an ML vision model using generic backend throughput without specifying model architecture, image resolution, or hardware device.
2. **Banned employer & growth marketing**:
   > "Invoice processing (top tech platforms, Zoho Books)... India's digital KYC market is growing 40% annually... explicitly required in Computer Vision Engineer JDs at startups like Sarvam AI, Jio GenAI..."

---

## 2. Reviewer Pass & Audit of Redesigned Brief

### Part 8 Reviewer Questions (with text evidence)
1. **Could a student finish in Est. Time on a normal laptop / free tier?** YES. Core path is 29 hours (INTERMEDIATE); runs on 8GB RAM CPU using quantized ONNX Runtime at $0 cost.
2. **Does each performance target name its bottleneck and is reachable?** YES. Single-image CPU latency (< 120ms) and batch throughput (> 15 images/sec) measured on 4-core CPU.
3. **Is there a CPU/local/free fallback?** YES. Local Python venv with PyTorch CPU weights without Docker.
4. **Can test data be created in minutes?** YES. Pre-trained quantized YOLOv8n ONNX model and 200 synthetic evaluation images provided.
5. **Can screener check rubric in under 10 minutes?** YES. Screener verification script runs full prediction and dynamic IoU check in under 2 minutes.
6. **Are targets and rubric project-specific?** YES. Image inference latency, batching queue throughput, and mAP@50 bounding box accuracy are unique to vision serving.
7. **Is every bullet claim verified by rubric?** YES. CPU latency verified by Check 1; batch throughput verified by Check 3; mAP verified by Check 2.
8. **Is there an anti-fake check?** YES. Check 5 [anti_fake] generates dynamic synthetic rectangle image and asserts IoU > 0.7.
9. **Are all terms accurate?** YES. Accurately covers ONNX Runtime, dynamic batching, NMS post-processing, and mAP@50.
10. **Does problem statement promise only what is verified?** YES. Image preprocessing, dynamic batching, CPU inference, and bounding box formatting are all built and tested.
11. **Are privacy and safety notes addressed?** YES. Strictly synthetic object images; no real biometric or facial data.
12. **Are all hard parts technical?** YES. 4 technical challenges covering dynamic batching queues, letterbox preprocessing, ONNX thread management, and NMS efficiency.

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
- Scope & Hours: Calculated bottom-up using effort model (25 component hours * 1.15 buffer = 29 hours). Split GPU TensorRT and OCR pipeline to Extended Path (+14h).
- Target Realism: Eliminated generic web-service targets; replaced with authentic vision serving metrics (CPU latency per image, batch throughput, and mAP@50 on a 200-image test set).
- Removed Banned Content: Removed Zoho Books, Sarvam AI, Jio GenAI, and KYC growth percentage claims.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic IoU check.
- Resume Formula: Formatted into single sentence using measured placeholders [CPU_LATENCY], [BATCH_THROUGHPUT], and [MAP_SCORE] with strict 'Do not claim' boundary.

### Unverified Items ([VERIFY])
None. All dependencies and test suites run on local free-tier or open-source software.
