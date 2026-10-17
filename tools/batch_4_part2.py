"""
Batch 4 Part 2: Redesign briefs 39 to 43 from scratch.
39. brief-llm-finetuning-peft
40. brief-llm-finetuning-rlhf
41. brief-llm-gateway
42. brief-load-balancer
43. brief-message-queue
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from build_batch_1 import process_brief

# ==============================================================================
# 39. brief-llm-finetuning-peft
# ==============================================================================
b39_data = {
  "id": "brief-llm-finetuning-peft",
  "title": "Domain-Specific LLM Fine-Tuning Pipeline with QLoRA, Token Packing & Automated Evaluation",
  "domain": "GenAI & LLM Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["Data pipeline / ETL", "Systems programming"],
  "problem": "General-purpose language models perform unreliably on specialized domain tasks involving legal statute interpretation, clinical terminology, and proprietary API code generation. Full parameter fine-tuning is computationally prohibitive, requiring multi-node GPU clusters and millions of dollars. This project builds a parameter-efficient fine-tuning (PEFT) pipeline in Python and PyTorch. The system ingests structured domain corpora, quantizes base open-source transformer models to 4-bit precision via bitsandbytes, injects Low-Rank Adaptation (LoRA) matrices into attention and feed-forward layers, trains models with sequence packing and gradient checkpointing, tracks loss curves in Weights & Biases, and evaluates domain accuracy improvements against base zero-shot models.",
  "use_cases": [
    {
      "title": "Clinical Terminology and Pathology Report Extraction",
      "first_sentence": "Healthcare research institutions require language models that extract structured disease codes and laboratory findings from unstructured pathology text.",
      "second_sentence": "The pipeline fine-tunes a base 7B parameter open-source model on clinical datasets, increasing biomedical entity extraction accuracy without exposing training data to third-party APIs."
    },
    {
      "title": "Corporate Regulatory Compliance & Statutory Q&A",
      "first_sentence": "Corporate legal teams need specialized models capable of answering queries regarding cross-jurisdictional data privacy regulations and corporate bylaws.",
      "second_sentence": "The engine trains LoRA adapters on statutory corpora, enabling localized legal question answering with precise section citations and low hallucination rates."
    },
    {
      "title": "Internal Proprietary Software Framework Code Generation",
      "first_sentence": "Software engineering organizations with proprietary internal SDKs and private libraries require code assistance tools tailored to their non-public APIs.",
      "second_sentence": "The system fine-tunes base coding models on internal repository functions, generating syntactically valid code completions that respect internal abstractions."
    }
  ],
  "hard_parts": [
    "Configuring 4-bit NormalFloat (NF4) quantization and double quantization to fit 7B parameter models within consumer GPU VRAM limits",
    "Implementing sequence packing algorithms that concatenate short training samples to maximize compute utilization without cross-sample attention leakage",
    "Selecting optimal LoRA rank (r) and alpha hyperparameters across attention projections to prevent catastrophic forgetting",
    "Benchmarking fine-tuned adapter weights against zero-shot base baselines to verify genuine domain generalization"
  ],
  "screener_signals": [
    "Clean Python codebase separating dataset tokenization scripts, LoRA configuration modules, and evaluation harnesses",
    "Reproducible training pipeline with public Weights & Biases run logs demonstrating smooth loss convergence and gradient norm stability",
    "Anti-fake verification script loading merged LoRA adapter weights and verifying domain-specific terminology generation on unseen prompts"
  ],
  "job_families": [
    "LLM Fine-Tuning Engineer",
    "Applied Machine Learning Scientist",
    "GenAI Platform Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary language implementing dataset tokenization, training scripts, and evaluation suites"},
    {"tool": "PyTorch", "role": "deep learning framework providing tensor computations, autograd, and CUDA execution primitives"},
    {"tool": "HuggingFace", "role": "library ecosystem providing transformer architectures, tokenizers, and dataset loaders"},
    {"tool": "PEFT", "role": "parameter-efficient fine-tuning library managing LoRA adapter initialization and weight merging"},
    {"tool": "LoRA", "role": "low-rank adaptation technique parameterizing attention weight updates into low-rank matrices"},
    {"tool": "Weights & Biases", "role": "experiment tracking platform recording training loss, learning rate schedules, and GPU metrics"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Dataset Preprocessing & Token Packing Engine",
        "tools_used": ["Python", "HuggingFace"],
        "purpose": "Tokenizes instruction-response pairs and packs sequences to max context length with attention masking"
      },
      {
        "name": "4-Bit QLoRA Model Quantizer & Adapter Injector",
        "tools_used": ["Python", "PyTorch", "PEFT", "LoRA"],
        "purpose": "Loads base weights in 4-bit precision, enables gradient checkpointing, and attaches trainable LoRA adapters"
      },
      {
        "name": "Trainer Loop & Weights & Biases Tracker",
        "tools_used": ["Python", "PyTorch", "Weights & Biases"],
        "purpose": "Executes mixed-precision training steps, calculates loss, and logs telemetry to experiment dashboards"
      },
      {
        "name": "Weight Merger & GGUF Quantization Exporter",
        "tools_used": ["Python", "PEFT"],
        "purpose": "Fuses trained LoRA adapter weights into base model layers and exports GGUF binaries for local inference"
      },
      {
        "name": "Domain Benchmark Evaluation Harness",
        "tools_used": ["Python", "HuggingFace"],
        "purpose": "Scores model predictions against held-out domain benchmark questions, comparing zero-shot and fine-tuned results"
      },
      {
        "name": "Training Throughput & VRAM Profiling Harness",
        "tools_used": ["PyTorch"],
        "purpose": "Profiles GPU memory allocation and measures token processing throughput per second during training"
      },
      {
        "name": "Model Card & LoRA Hyperparameter Documentation",
        "tools_used": ["HuggingFace"],
        "purpose": "Documents training hyperparameters, dataset distributions, intended use, and evaluation limitations"
      }
    ],
    "data_flow": "Domain instruction datasets enter the tokenization engine; sequences pack into dense context blocks with appropriate masking; the base model loads in 4-bit precision using bitsandbytes; LoRA adapter matrices inject into target query, key, value, and projection layers; PyTorch executes mixed-precision training steps with AdamW optimizer and cosine learning rate schedules; training metrics stream to Weights & Biases; upon completion, adapter weights merge into the base checkpoint; the evaluation harness scores generation accuracy across held-out domain test sets.",
    "enforcement_mechanism": "Gradient clipping at 1.0 preventing exploding gradients; sequence length truncation preventing out-of-memory GPU crashes."
  },
  "targets": [
    {
      "metric": "Domain Benchmark Evaluation Accuracy Improvement",
      "method": "Percentage point improvement on 300 domain-specific multiple choice and extraction questions over baseline unadapted model",
      "input": "300 domain-specific evaluation question-answer pairs spanning medical and legal technical terminology",
      "environment": "Standard GPU instance (NVIDIA T4 / RTX 3060 / A10G with 12GB+ VRAM) or CPU simulation harness",
      "minimum_pass": "Fine-tuned model achieves >= 14.0 percentage point accuracy improvement over baseline unadapted model",
      "target": "Fine-tuned model achieves >= 22.5 percentage point accuracy improvement over baseline unadapted model",
      "report": "Domain evaluation accuracy comparison report and benchmark score table"
    },
    {
      "metric": "Peak Training VRAM Consumption Ceiling",
      "method": "Maximum allocated GPU memory measured via torch.cuda.max_memory_allocated during QLoRA training",
      "input": "Batch size of 4 with sequence length 1024 tokens on 7B parameter base model with 4-bit quantization",
      "environment": "Single 16GB GPU or local simulated PyTorch memory tracker",
      "minimum_pass": "Peak VRAM allocation during training step is < 12.0 gigabytes",
      "target": "Peak VRAM allocation during training step is < 8.5 gigabytes",
      "report": "GPU memory allocation profile and VRAM benchmark trace"
    },
    {
      "metric": "Training Token Processing Throughput",
      "method": "Sustained tokens processed per second across active training epochs with sequence packing",
      "input": "1,000,000 training tokens packed into 1024-token sequence blocks",
      "environment": "Single consumer/cloud GPU running PyTorch 2.1+ with FlashAttention-2 or SDPA",
      "minimum_pass": "Training throughput is >= 650 tokens per second",
      "target": "Training throughput is >= 1,450 tokens per second",
      "report": "Training execution timing log and token throughput summary"
    }
  ],
  "skills": ["Python", "PyTorch", "HuggingFace", "PEFT", "LoRA", "Weights & Biases", "LLM Fine-tuning", "CUDA"],
  "starter_input": {
    "spec": "Directory of 5,000 domain instruction-response pairs in JSONL format, training configuration YAMLs, and evaluation splits.",
    "size": "5,000 instruction pairs (approx 8MB text), 300 benchmark evaluation records, and tokenizer configs",
    "seeded_cases": "Malformed multi-line JSON records, out-of-vocabulary domain abbreviations, and truncated context blocks",
    "label_source": "Expert domain curated instruction-response pairs and standardized legal/clinical benchmark questions",
    "personal_data_policy": "Strictly public technical QA pairs and synthetic clinical vignettes; zero real personal data used"
  },
  "components": [
    {"name": "Dataset Preprocessing & Token Packing Engine", "task_type": "data pipeline step", "hours": 6.0},
    {"name": "4-Bit QLoRA Model Quantizer & Adapter Injector", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Trainer Loop & Weights & Biases Tracker", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Weight Merger & GGUF Quantization Exporter", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Domain Benchmark Evaluation Harness", "task_type": "evaluation dataset creation + scoring script", "hours": 5.0},
    {"name": "Training Throughput & VRAM Profiling Harness", "task_type": "load or performance test harness + report", "hours": 4.0},
    {"name": "Model Card & LoRA Hyperparameter Documentation", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Direct Preference Optimization (DPO) alignment stage training on paired chosen-rejected domain responses",
      "Continuous streaming dataset loading from cloud object stores for multi-gigabyte corpus fine-tuning",
      "Automated LoRA hyperparameter search over rank, alpha, and dropout using Optuna"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Dataset Tokenization & Sequence Packing in Python and HuggingFace",
      "hours": 10,
      "done_criterion": "Preprocessing pipeline packs 5,000 instruction pairs with attention masks and zero cross-sample leakage."
    },
    {
      "name": "4-Bit QLoRA Adapter Injection & CUDA Training in PyTorch and PEFT",
      "hours": 10,
      "done_criterion": "QLoRA loads model in 4-bit NF4; training completes with peak VRAM < 12GB on CUDA."
    },
    {
      "name": "Weights & Biases Tracking & Model Evaluation in LLM Fine-tuning",
      "hours": 10,
      "done_criterion": "Fine-tuned model achieves >= 14 percentage point accuracy improvement on 300 test questions."
    },
    {
      "name": "Weight Merging, Anti-Fake Dynamic Generation Test & Docs",
      "hours": 10,
      "done_criterion": "LoRA merges into base weights; anti-fake test validates dynamic generation; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python programming, PyTorch tensor manipulation, and HuggingFace transformers library",
    "Understanding of transformer self-attention mechanisms, parameter-efficient fine-tuning (LoRA), and quantization"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "16GB RAM",
    "gpu": "12GB+ VRAM GPU recommended (Google Colab T4 / Kaggle free GPU tier / local NVIDIA GPU)",
    "cost": "$0 (fully executable on free Google Colab / Kaggle GPU tiers or local hardware)",
    "accounts_keys_quotas": "Free HuggingFace account for base model downloads and free Weights & Biases account",
    "reference_environment": "Ubuntu 22.04 with NVIDIA GPU (12GB+ VRAM), PyTorch 2.1+, CUDA 12.1, and HuggingFace transformers",
    "fallback_path": "CPU training with TinyLlama (1.1B) using bitsandbytes CPU quantization or mock forward-pass runner"
  },
  "riskiest_component": {
    "name": "GPU Out-of-Memory (OOM) Errors During Attention Backward Passes",
    "mitigation": "Enable gradient checkpointing, FlashAttention-2, and per-device batch size of 1 with gradient accumulation.",
    "fallback": "Reduce sequence length to 512 tokens and use LoRA rank r=8 instead of r=16."
  },
  "deliverables": [
    "Git repository containing dataset tokenization scripts, QLoRA training loop, and evaluation harnesses",
    "Trained LoRA adapter weights checkpoint and merged model export script",
    "Public Weights & Biases experiment dashboard tracking loss, learning rate, and GPU memory",
    "Screener verification script evaluating model accuracy on domain test benchmark in under 5 minutes"
  ],
  "out_of_scope": [
    "Full-parameter pre-training from scratch on trillion-token web corpora",
    "Distributed 3D-parallelism (Megatron-LM tensor and pipeline parallelism across GPU clusters)",
    "Hardware custom ASIC accelerator driver authoring"
  ],
  "safety_note": None,
  "resources": [
    "QLoRA: Efficient Finetuning of Quantized LLMs (Dettmers et al.)",
    "HuggingFace PEFT Documentation: Low-Rank Adaptation (LoRA) Guide",
    "PyTorch Gradient Checkpointing and Memory Optimization Guide"
  ],
  "rubric": [
    {
      "input": "300 domain-specific evaluation question-answer pairs evaluated against base vs fine-tuned model",
      "action": "python -m peft_pipeline.evaluate_domain --model-dir output/merged_model --test-file test_data/domain_eval.json",
      "expected_result": "Fine-tuned model achieves >= 14.0 percentage point accuracy improvement over base zero-shot model",
      "evidence_location": "Terminal test execution output log and reports/domain_accuracy_report.json",
      "pass_criterion": "Evaluation report confirms >= 14.0 point accuracy improvement with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Training step execution monitoring GPU memory allocation",
      "action": "python scripts/profile_vram.py --config configs/qlora_7b.yaml",
      "expected_result": "Peak memory allocated during active forward and backward pass is < 12.0 gigabytes",
      "evidence_location": "VRAM allocation profile log",
      "pass_criterion": "Peak memory allocation is < 12.0GB with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Weights & Biases training run telemetry log",
      "action": "python -m peft_pipeline.verify_wandb_run --run-id latest",
      "expected_result": "Telemetry confirms smooth training loss decrease, learning rate warmup, and zero NaN gradients",
      "evidence_location": "W&B run verification log in reports/wandb_audit.json",
      "pass_criterion": "Verification confirms monotonic loss trend and 0 NaN occurrences",
      "kind": "normal"
    },
    {
      "input": "Merged model directory and configuration files",
      "action": "python -m peft_pipeline.verify_model_artifacts --model-dir output/merged_model",
      "expected_result": "Directory contains valid safetensors weights, tokenizer configs, and generation config",
      "evidence_location": "Model artifact inspection log",
      "pass_criterion": "All required model weight files exist and load successfully in Python",
      "kind": "normal"
    },
    {
      "input": "Dynamic unobserved domain prompt testing specialized statutory terminology",
      "action": "python scripts/verify_dynamic_generation.py --prompt 'Under Section 42 of the Corporate Privacy Act, what constitutes a qualifying data controller?'",
      "expected_result": "Model generates answer correctly citing statutory criteria while base model gives generic refusal",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Generation contains required statutory keywords and passes domain rubric checks with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected parameter-efficient domain fine-tuning pipeline in Python and PyTorch using QLoRA; increased domain evaluation accuracy by [ACCURACY_DELTA] points over baseline, and maintained training memory consumption below [VRAM_CEILING] gigabytes.",
    "claims": [
      {
        "text": "increased domain evaluation accuracy by [ACCURACY_DELTA] points over baseline",
        "rubric_indexes": [0]
      },
      {
        "text": "maintained training memory consumption below [VRAM_CEILING] gigabytes",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "full pre-training from scratch on multi-node GPU superclusters or commercial medical diagnosis licensure"
  },
  "verify": [
    "Run `python -m pytest tests/` to verify token packing, LoRA injection, and loss calculation tests pass.",
    "Execute `python -m peft_pipeline.evaluate_domain` to verify fine-tuned model accuracy exceeds zero-shot baseline.",
    "Run `python scripts/verify_dynamic_generation.py` to assert domain-specific terminology generation on unseen prompts."
  ],
  "worksheet": {
    "q1": "Core deliverable: a parameter-efficient fine-tuning pipeline in Python/PyTorch with 4-bit QLoRA, token packing, and domain evaluation.",
    "q2": "Target users: applied ML engineers, NLP scientists, and enterprise GenAI platform developers.",
    "q3": "3 use cases: clinical report entity extraction, corporate regulatory Q&A, and proprietary internal code completion.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: 4-bit NF4 quantization parameterization, sequence packing without cross-sample attention leakage, LoRA rank hyperparameter tuning, and VRAM containment.",
    "q6": "Starter input: 5,000 domain instruction pairs in JSONL format, training configuration YAMLs, and 300 benchmark questions. Public datasets only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 16GB RAM, free Colab/Kaggle GPU, $0 cost, zero paid cloud services. Fallback: CPU training with TinyLlama.",
    "q8": "Riskiest component: GPU OOM errors on backward pass. Fallback: gradient checkpointing, FlashAttention-2, and per-device batch size 1.",
    "q9": "Potential faking: pre-generated text completions. Anti-fake check 5 runs unseen dynamic prompt through merged weights and verifies statutory keywords.",
    "q10": "Safety/ethics: Safe; public technical instruction datasets and synthetic clinical vignettes only, zero private medical patient records."
  }
}

b39_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Domain-Specific LLM Fine-Tuning with LoRA/PEFT | Generic headline | Minor |
| Claims / Marketing | 'Medical AI (Apollo, Manipal hospitals), Legal tech (IndiaFilings, LegalWiz), EdTech (BYJU's custom tutors)...' | Named Indian commercial companies as marketing hooks | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing domain instruction pairs and benchmark evaluation sets | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No GPU/CUDA/VRAM specifications | Major |
| Resume Bullet | Spliced bullet ending with copied web-service targets | Malformed resume bullet | Critical |
"""

b39_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs on free Google Colab / Kaggle GPU tiers or local 12GB GPU using Python, PyTorch, and PEFT at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Accuracy improvement (>= 14.0 points), peak VRAM (< 12.0GB), and token throughput (>= 650 tokens/sec) measured directly on target hardware.",
  "Is there a CPU/local/free fallback?": "YES. CPU training mode with TinyLlama (1.1B) using bitsandbytes CPU quantization or mock forward pass.",
  "Can test data be created in minutes?": "YES. Synthetic 5,000-instruction dataset and 300 benchmark questions included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: full-parameter pre-training and multi-node 3D parallelism.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 runs novel unobserved prompt through merged weights and verifies domain terminology generation.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b39_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved DPO preference alignment and Optuna hyperparameter search to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic fine-tuning metrics (domain evaluation accuracy gain, peak VRAM consumption, and token throughput).
- Removed Banned Content: Removed marketing references to Apollo, Manipal hospitals, BYJU's, and HDFC.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic statutory generation test.
"""


# ==============================================================================
# 40. brief-llm-finetuning-rlhf
# ==============================================================================
b40_data = {
  "id": "brief-llm-finetuning-rlhf",
  "title": "LLM Preference Alignment Pipeline with Bradley-Terry Reward Modeling & Direct Preference Optimization",
  "domain": "GenAI & LLM Engineering",
  "difficulty": "ADVANCED",
  "project_types": ["Data pipeline / ETL", "Systems programming"],
  "problem": "Supervised fine-tuning teaches language models task formats but fails to align generation tone, safety boundaries, and nuanced human preferences. Reinforcement Learning from Human Feedback (RLHF) using traditional PPO is notoriously unstable, suffering from hyperparameter sensitivity, value network divergence, and reward hacking. This project builds a direct preference alignment pipeline in Python and PyTorch using the TRL library. The system trains a Bradley-Terry pairwise reward model on human preference datasets, optimizes model policies using Direct Preference Optimization (DPO) with implicit reward formulations and KL divergence penalties, prevents catastrophic forgetting, and evaluates alignment win rates against baseline supervised models.",
  "use_cases": [
    {
      "title": "Conversational Safety & Hate Speech Refusal Alignment",
      "first_sentence": "Consumer AI application developers need conversational assistants that politely refuse harmful instructions while remaining helpful on benign queries.",
      "second_sentence": "The alignment pipeline trains a reward model on safety preference pairs, optimizing model weights via DPO to eliminate toxic outputs without over-refusal."
    },
    {
      "title": "Executive Summary Conciseness and Tone Calibration",
      "first_sentence": "Enterprise business intelligence tools require summarization models that consistently produce concise, bulleted executive briefings rather than verbose narrative text.",
      "second_sentence": "The system aligns an open-source model against executive preference pairs, ensuring generated summaries strictly prioritize key quantitative takeaways."
    },
    {
      "title": "Code Review Tone & Constructive Feedback Alignment",
      "first_sentence": "Engineering organizations deploying automated code review bots need comments that provide constructive architectural suggestions rather than dismissive remarks.",
      "second_sentence": "The engine trains on paired senior engineer feedback demonstrations, aligning review bots to suggest specific refactoring diffs with polite explanatory notes."
    }
  ],
  "hard_parts": [
    "Training a robust Bradley-Terry reward model that scores preference margins accurately without overfitting to response length bias",
    "Deriving and optimizing the closed-form DPO objective without requiring unstable actor-critic reinforcement learning loops",
    "Calibrating the KL divergence reference model constraint beta parameter to prevent policy collapse into degenerate repetitive strings",
    "Evaluating win rates using automated LLM-as-a-judge protocols with position-bias counterbalancing"
  ],
  "screener_signals": [
    "Clean Python codebase separating preference dataset loaders, reward model training scripts, and DPO trainers",
    "Comprehensive training curves in Weights & Biases showing margin growth, policy reward increase, and KL divergence stabilization",
    "Anti-fake verification script presenting an unseen paired preference test and verifying reward model assigns correct higher score to preferred text"
  ],
  "job_families": [
    "AI Alignment & Safety Engineer",
    "Reinforcement Learning Specialist",
    "Applied Machine Learning Scientist"
  ],
  "stack": [
    {"tool": "Python", "role": "primary programming language implementing preference dataset loaders and DPO training loops"},
    {"tool": "PyTorch", "role": "deep learning framework providing tensor operations and autograd execution"},
    {"tool": "HuggingFace", "role": "model hub and tokenization ecosystem providing base models and datasets"},
    {"tool": "TRL", "role": "transformer reinforcement learning library implementing DPO and reward model trainers"},
    {"tool": "LoRA", "role": "parameter-efficient adapter technique constraining trainable weights during preference alignment"},
    {"tool": "Weights & Biases", "role": "experiment tracking tool logging reward margins, KL penalties, and loss metrics"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Preference Pair Ingestion & Length-Normalization Pipeline",
        "tools_used": ["Python", "HuggingFace"],
        "purpose": "Loads chosen-rejected response pairs, normalizes response lengths, and constructs tokenized tensors"
      },
      {
        "name": "Bradley-Terry Pairwise Reward Model Trainer",
        "tools_used": ["Python", "PyTorch", "TRL"],
        "purpose": "Trains a scalar reward head on top of transformer backbone using binary cross-entropy preference loss"
      },
      {
        "name": "Direct Preference Optimization (DPO) Trainer",
        "tools_used": ["Python", "PyTorch", "TRL", "LoRA"],
        "purpose": "Optimizes policy weights directly from preference pairs with reference model KL divergence regularization"
      },
      {
        "name": "Reward Score Distribution & Margin Evaluator",
        "tools_used": ["Python", "PyTorch"],
        "purpose": "Computes reward score histograms and validates margin separation between chosen and rejected candidates"
      },
      {
        "name": "Win-Rate & Catastrophic Forgetting Benchmark Suite",
        "tools_used": ["Python", "HuggingFace"],
        "purpose": "Measures pairwise win-rate against SFT baseline and asserts retention of core knowledge benchmarks"
      },
      {
        "name": "Alignment Experiment Telemetry & Runbook Documentation",
        "tools_used": ["Weights & Biases"],
        "purpose": "Documents hyperparameter configurations, beta sweep findings, and preference data curation guides"
      }
    ],
    "data_flow": "Chosen and rejected prompt-response pairs enter the ingestion pipeline; text sequences tokenize and pad with uniform formatting; the reward model trains to predict higher scalar values for chosen completions; the DPO training loop loads the base SFT model alongside frozen reference weights; DPO updates LoRA policy parameters by maximizing the log-likelihood of chosen completions relative to rejected completions penalizing KL divergence; evaluation harnesses score aligned outputs against held-out preference prompts; telemetry logs to Weights & Biases.",
    "enforcement_mechanism": "KL penalty coefficient (beta=0.1) preventing policy drift from reference model; gradient norm clipping at 1.0."
  },
  "targets": [
    {
      "metric": "Pairwise Reward Model Classification Accuracy",
      "method": "Percentage of held-out preference test pairs where the reward model scores the chosen response higher than the rejected response",
      "input": "500 held-out pairwise preference test samples spanning helpfulness, conciseness, and safety domains",
      "environment": "Standard GPU instance (12GB+ VRAM) or CPU evaluation harness",
      "minimum_pass": "Reward classification accuracy is >= 72.0% across 500 test pairs",
      "target": "Reward classification accuracy is >= 81.5% across 500 test pairs",
      "report": "Reward model accuracy and margin distribution evaluation report"
    },
    {
      "metric": "DPO Aligned Policy Win-Rate Over SFT Baseline",
      "method": "Pairwise win-rate evaluated across 200 held-out evaluation prompts judged by automated evaluator with position swapping",
      "input": "200 test prompts evaluated for response helpfulness, safety, and conciseness",
      "environment": "Standard 4-core local CPU with PyTorch inference runtime",
      "minimum_pass": "Aligned model achieves >= 65.0% win-rate over unaligned SFT baseline across 200 prompts",
      "target": "Aligned model achieves >= 78.0% win-rate over unaligned SFT baseline across 200 prompts",
      "report": "Pairwise alignment win-rate evaluation summary table"
    },
    {
      "metric": "KL Divergence Penalty Stability Ceiling",
      "method": "Average per-token KL divergence between aligned policy and frozen SFT reference model across training epochs",
      "input": "Training trajectory across 1,000 DPO optimization steps with beta=0.1",
      "environment": "PyTorch training loop with CUDA execution",
      "minimum_pass": "Average per-token KL divergence is < 0.15 across training epochs",
      "target": "Average per-token KL divergence is < 0.08 across training epochs",
      "report": "Training KL divergence trajectory and policy stability log"
    }
  ],
  "skills": ["Python", "PyTorch", "HuggingFace", "RLHF", "Reward Modeling", "PEFT", "TRL", "Weights & Biases", "Alignment"],
  "starter_input": {
    "spec": "Directory of 3,000 preference pairs in JSONL format, DPO configuration YAMLs, and evaluation prompt manifests.",
    "size": "3,000 chosen-rejected text pairs (approx 6MB text), 500 test preference pairs, and 200 evaluation prompts",
    "seeded_cases": "Identical length ties, subtle patronizing tone in rejected responses, and adversarial trick questions",
    "label_source": "Expert human annotator consensus preference ratings and standardized Anthropic HH-RLHF open dataset subsets",
    "personal_data_policy": "Strictly synthetic and public preference datasets; no real personal data used"
  },
  "components": [
    {"name": "Preference Pair Ingestion & Length-Normalization Pipeline", "task_type": "data pipeline step", "hours": 6.0},
    {"name": "Bradley-Terry Pairwise Reward Model Trainer", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Direct Preference Optimization (DPO) Trainer", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Reward Score Distribution & Margin Evaluator", "task_type": "evaluation dataset creation + scoring script", "hours": 5.0},
    {"name": "Win-Rate & Catastrophic Forgetting Benchmark Suite", "task_type": "load or performance test harness + report", "hours": 6.0},
    {"name": "Alignment Experiment Telemetry & Runbook Documentation", "task_type": "docs + architecture diagram", "hours": 3.0},
    {"name": "DPO Architecture Diagram & Hyperparameter Guide", "task_type": "docs + architecture diagram", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Online iterative DPO with dynamic synthetic generation and reward model re-ranking in the training loop",
      "KTO (Kahneman-Tversky Optimization) alignment requiring only binary feedback (up/down) rather than preference pairs",
      "Automated length-bias debiasing using length-penalized margin formulations"
    ],
    "hours": 16
  },
  "milestones": [
    {
      "name": "Preference Pair Preprocessing & Reward Modeling in PyTorch and TRL",
      "hours": 10,
      "done_criterion": "Reward model trains on 3,000 preference pairs and achieves >= 72% accuracy on 500 test pairs."
    },
    {
      "name": "Direct Preference Optimization Training in HuggingFace, PEFT and LoRA",
      "hours": 10,
      "done_criterion": "DPO trainer updates LoRA adapters while maintaining KL divergence < 0.15."
    },
    {
      "name": "Alignment Win-Rate Benchmarking & RLHF Evaluation",
      "hours": 10,
      "done_criterion": "Aligned model achieves >= 65% win rate over unaligned SFT baseline across 200 prompts."
    },
    {
      "name": "Weights & Biases Telemetry, Anti-Fake Test & Docs",
      "hours": 10,
      "done_criterion": "Telemetry verifies stable training; anti-fake test validates preference margin; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python programming, PyTorch deep learning, and transformer architectures",
    "Understanding of preference alignment principles (Bradley-Terry models, DPO loss formulation, KL divergence)"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "16GB RAM",
    "gpu": "12GB+ VRAM GPU recommended (Google Colab T4 / Kaggle free GPU / local NVIDIA GPU)",
    "cost": "$0 (fully executable on free Google Colab or Kaggle GPU tiers)",
    "accounts_keys_quotas": "Free HuggingFace account for model downloads and free Weights & Biases account",
    "reference_environment": "Ubuntu 22.04 with NVIDIA GPU (12GB+ VRAM), PyTorch 2.1+, TRL 0.7+, and HuggingFace transformers",
    "fallback_path": "CPU training mode using Qwen-0.5B or TinyLlama with small batch sizes and gradient accumulation"
  },
  "riskiest_component": {
    "name": "Policy Degeneration and Repetitive Output Collapse During DPO",
    "mitigation": "Tune beta coefficient between 0.05 and 0.2 and evaluate token diversity metrics during training.",
    "fallback": "Increase beta to 0.25 to tightly anchor policy to reference model."
  },
  "deliverables": [
    "Git repository containing preference preprocessing, reward modeling, and DPO training pipelines",
    "Trained DPO adapter weights checkpoint and inference evaluation scripts",
    "Weights & Biases training dashboard tracking reward margin, KL divergence, and loss curves",
    "Screener verification script running preference pair scoring and win-rate assertions in under 5 minutes"
  ],
  "out_of_scope": [
    "Multi-turn conversational PPO with real-time value network critic rollouts",
    "Human annotator workforce management platforms and crowdsourcing payment systems",
    "Full-scale pre-training of base foundation models"
  ],
  "safety_note": None,
  "resources": [
    "Direct Preference Optimization: Your Language Model is Secretly a Reward Model (Rafailov et al.)",
    "HuggingFace TRL Documentation: DPO and Reward Model Training Guides",
    "Anthropic: Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback"
  ],
  "rubric": [
    {
      "input": "500 held-out pairwise preference test samples",
      "action": "python -m rlhf_pipeline.evaluate_reward --model-dir output/reward_model --test-file test_data/test_pairs.json",
      "expected_result": "Reward model scores chosen response higher than rejected response in >= 72.0% of test pairs",
      "evidence_location": "Terminal test execution output log and reports/reward_accuracy_report.json",
      "pass_criterion": "Report records preference classification accuracy >= 72.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "200 evaluation prompts comparing DPO aligned model vs SFT baseline",
      "action": "python -m rlhf_pipeline.benchmark_win_rate --prompts test_data/eval_prompts.json",
      "expected_result": "Aligned model achieves >= 65.0% win-rate over baseline with position bias balanced",
      "evidence_location": "Win-rate evaluation report in reports/win_rate_summary.json",
      "pass_criterion": "Win-rate is >= 65.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Weights & Biases DPO training telemetry log",
      "action": "python -m rlhf_pipeline.verify_training_stability --run-id latest",
      "expected_result": "Verification confirms average per-token KL divergence remains < 0.15 across all steps",
      "evidence_location": "Training stability audit log",
      "pass_criterion": "Average KL divergence < 0.15 and exit code is 0",
      "kind": "normal"
    },
    {
      "input": "Trained DPO adapter checkpoint files",
      "action": "python -m rlhf_pipeline.verify_checkpoint --adapter-dir output/dpo_adapter",
      "expected_result": "Directory contains adapter_model.safetensors, adapter_config.json, and valid metadata",
      "evidence_location": "Checkpoint inspection output",
      "pass_criterion": "All adapter files exist and load into TRL pipeline without errors",
      "kind": "normal"
    },
    {
      "input": "Dynamic unseen preference pair testing polite constructive refusal vs unsafe toxic completion",
      "action": "python scripts/verify_dynamic_preference.py --prompt 'How do I bypass software activation keys?'",
      "expected_result": "Reward model evaluates safety response with higher score (margin > 1.5 logits) and DPO policy chooses refusal",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Reward margin > 1.5 logits and generated response politely declines with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected direct preference optimization alignment pipeline in Python and PyTorch using TRL; achieved [PREFERENCE_ACCURACY] pairwise preference accuracy on reward classification, and delivered [WIN_RATE] win-rate improvement over baseline supervised policies.",
    "claims": [
      {
        "text": "achieved [PREFERENCE_ACCURACY] pairwise preference accuracy on reward classification",
        "rubric_indexes": [0]
      },
      {
        "text": "delivered [WIN_RATE] win-rate improvement over baseline supervised policies",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "general artificial moral alignment or absolute immunity to toxic prompt generation"
  },
  "verify": [
    "Run `python -m pytest tests/` to confirm preference pair loading, loss formulations, and KL penalty logic pass.",
    "Execute `python -m rlhf_pipeline.evaluate_reward` to verify reward model preference classification accuracy.",
    "Run `python scripts/verify_dynamic_preference.py` to assert correct preference margin scoring on dynamic prompts."
  ],
  "worksheet": {
    "q1": "Core deliverable: an LLM preference alignment pipeline in Python/PyTorch using Bradley-Terry reward modeling and Direct Preference Optimization (DPO).",
    "q2": "Target users: AI alignment engineers, safety researchers, and enterprise LLM developers.",
    "q3": "3 use cases: conversational safety refusal alignment, executive summary tone calibration, and constructive code review feedback.",
    "q4": "Stated hours: 40 hours. Calculated bottom-up: 35 component hours * 1.15 buffer = 40.25 -> 40 hours. Advanced level.",
    "q5": "Hard parts: Bradley-Terry reward modeling without length bias, DPO closed-form optimization, KL divergence penalty calibration, and position-bias counterbalancing in win-rate evals.",
    "q6": "Starter input: 3,000 preference pairs in JSONL format, DPO configuration YAMLs, and 200 evaluation prompts. Public preference data only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 16GB RAM, free Colab/Kaggle GPU, $0 cost, zero paid cloud services. Fallback: CPU training with Qwen-0.5B.",
    "q8": "Riskiest component: policy degeneration during DPO. Fallback: beta hyperparameter sweeps and token diversity monitoring.",
    "q9": "Potential faking: pre-canned reward scores. Anti-fake check 5 scores dynamic unseen safety prompt and asserts reward margin > 1.5 logits.",
    "q10": "Safety/ethics: Safe; public open-source preference datasets only, zero private or sensitive user personal data."
  }
}

b40_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | RLHF-Style LLM Alignment with Reward Model Training | Generic headline | Minor |
| Claims / Marketing | 'ChatGPT, Claude, Gemini... Anthropic, OpenAI, DeepMind... This is the most future-proof GenAI skill you can demonstrate' | Marketing hype naming big tech labs and future-proof claims | Critical |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 38 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing preference datasets and evaluation manifests | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No GPU/CUDA/TRL specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b40_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 40 hours (ADVANCED); runs on free Google Colab / Kaggle GPU tiers or local 12GB GPU using Python, PyTorch, and TRL at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Reward accuracy (>= 72.0%), win-rate (>= 65.0%), and KL penalty (< 0.15) measured directly on target hardware.",
  "Is there a CPU/local/free fallback?": "YES. CPU training mode using lightweight Qwen-0.5B or TinyLlama with gradient accumulation.",
  "Can test data be created in minutes?": "YES. Synthetic 3,000-preference pair dataset and 200 evaluation prompts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: multi-turn conversational PPO with critic rollouts and human crowdsourcing platforms.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 scores dynamic safety prompt and asserts reward margin > 1.5 logits.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b40_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (35 component hours * 1.15 buffer = 40 hours). Moved online iterative DPO and Kahneman-Tversky Optimization to Extended Path (+16h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic alignment metrics (pairwise reward accuracy, DPO win-rate, and KL divergence stability).
- Removed Banned Content: Removed marketing claims mentioning ChatGPT, Claude, Gemini, Anthropic, OpenAI, and DeepMind.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic preference scoring test.
"""


# ==============================================================================
# 41. brief-llm-gateway
# ==============================================================================
b41_data = {
  "id": "brief-llm-gateway",
  "title": "High-Throughput Multi-Provider LLM Gateway with Semantic Prompt Caching, Automatic Failover & Token Rate Limiting",
  "domain": "GenAI & LLM Engineering",
  "difficulty": "INTERMEDIATE",
  "project_types": ["API/backend service", "Platform/infra tool"],
  "problem": "Applications relying directly on single LLM provider APIs suffer catastrophic outages during vendor downtime, waste budget repeatedly recalculating identical prompt completions, and face uncoordinated quota exhaustion across distributed microservices. Building ad-hoc client-side retries leads to stampeding herds and unpredictable billing spikes. This project builds a production-grade multi-provider LLM gateway in Python and FastAPI. The gateway unifies access across heterogeneous providers with automatic fallback routing, reduces inference expenditures through semantic vector prompt caching in Redis, enforces token-bucket rate limits per tenant, and exports real-time spend telemetry.",
  "use_cases": [
    {
      "title": "Multi-Tenant Enterprise AI API Cost Optimization",
      "first_sentence": "Enterprise software platforms serving thousands of internal corporate users need centralized billing control and spend limits across engineering teams.",
      "second_sentence": "The gateway intercepts all model completion requests, checks semantic caches to return instant cached responses for repetitive queries, and tracks usage per project."
    },
    {
      "title": "Zero-Downtime Provider Failover for Mission-Critical APIs",
      "first_sentence": "Production SaaS products relying on LLM backends must maintain continuous uptime even when a primary commercial provider encounters service degradation.",
      "second_sentence": "The gateway monitors provider response latency and HTTP error rates, automatically routing traffic to secondary providers or open-source fallback models within 450ms."
    },
    {
      "title": "Distributed Rate Limiting and Quota Enforcement",
      "first_sentence": "Cloud services offering LLM features to tiered subscription customers need deterministic token-per-minute and request-per-minute enforcement.",
      "second_sentence": "The system applies distributed token-bucket rate limiting in Redis, smoothly queuing requests and rejecting abusive bursts with standard HTTP 429 status codes."
    }
  ],
  "hard_parts": [
    "Implementing semantic prompt caching using vector cosine similarity that reliably detects semantic matches without returning stale or irrelevant completions",
    "Designing circuit-breaking failover policies that detect degraded upstream providers without causing cascading request timeouts",
    "Executing atomic distributed token-bucket rate limiting in Redis under high-concurrency client request bursts",
    "Normalizing disparate multi-vendor streaming response schemas into a unified server-sent events (SSE) protocol"
  ],
  "screener_signals": [
    "Clean Python codebase separating provider adapters, semantic caching managers, rate limiting interceptors, and telemetry routers",
    "High-throughput benchmark report measuring proxy latency overhead, cache hit response speed, and failover diversion timings",
    "Anti-fake verification script issuing a novel prompt followed by a semantically equivalent variant, asserting sub-15ms cached return and zero provider token usage"
  ],
  "job_families": [
    "LLM Platform Engineer",
    "Backend Infrastructure Engineer",
    "API Gateway Architect"
  ],
  "stack": [
    {"tool": "Python", "role": "primary backend language implementing asynchronous proxy logic and caching pipelines"},
    {"tool": "FastAPI", "role": "high-performance asynchronous framework exposing unified OpenAI-compatible REST endpoints"},
    {"tool": "Redis", "role": "in-memory cache storing semantic vector embeddings and distributed token-bucket counters"},
    {"tool": "LangChain", "role": "library managing prompt template standardizations and provider interface abstractions"},
    {"tool": "OpenAI API", "role": "primary commercial LLM provider interface supported through unified client adapter"},
    {"tool": "Anthropic API", "role": "secondary commercial LLM provider interface configured for automatic fallback routing"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Unified API Gateway & OpenAI Schema Adapter",
        "tools_used": ["FastAPI", "Python"],
        "purpose": "Ingests standard OpenAI-formatted completion and chat requests, normalizing payloads across providers"
      },
      {
        "name": "Semantic Prompt Cache & Vector Similarity Engine",
        "tools_used": ["Python", "Redis", "LangChain"],
        "purpose": "Embeds incoming prompt strings, searches Redis vector index, and serves cached responses for cosine similarity > 0.92"
      },
      {
        "name": "Distributed Token-Bucket Rate Limiter & Quota Guard",
        "tools_used": ["Python", "Redis"],
        "purpose": "Enforces tenant-level requests-per-minute and tokens-per-minute constraints using atomic Redis Lua scripts"
      },
      {
        "name": "Circuit Breaker & Multi-Provider Failover Router",
        "tools_used": ["FastAPI", "OpenAI API", "Anthropic API"],
        "purpose": "Tracks upstream health, trips circuits on consecutive timeouts, and seamlessly routes requests to backup providers"
      },
      {
        "name": "Gateway Throughput & Cache Latency Benchmark Suite",
        "tools_used": ["Python", "FastAPI"],
        "purpose": "Executes concurrent synthetic traffic drills measuring proxy overhead, cache hit latencies, and failover behavior"
      }
    ],
    "data_flow": "A client application dispatches a standard chat completion request to the FastAPI gateway; the rate limiter evaluates the tenant token budget in Redis, rejecting requests that exceed quotas; the semantic cache computes prompt embeddings and queries Redis; if a semantic match exceeding similarity threshold 0.92 exists, the cached completion returns immediately; on a cache miss, the failover router forwards the request to the primary provider; if the primary provider times out or returns HTTP 5xx, the circuit breaker triggers fallback routing to the secondary provider; the response streams back to the client while writing to the cache and telemetry logs.",
    "enforcement_mechanism": "Redis Lua scripts atomically decrementing tenant token allowances; circuit breakers opening after 3 consecutive provider failures."
  },
  "targets": [
    {
      "metric": "Semantic Cache Hit Response Latency",
      "method": "Wall-clock timing from client request receipt to cached completion dispatch for semantically matching prompts",
      "input": "100 semantically varied prompts querying previously cached knowledge completion payloads",
      "environment": "Standard 4-core local CPU, local Redis container, Python 3.11 asynchronous runtime",
      "minimum_pass": "p95 semantic cache response latency is < 25.0 milliseconds",
      "target": "p95 semantic cache response latency is < 12.0 milliseconds",
      "report": "Semantic cache latency profiling log and benchmark summary table"
    },
    {
      "metric": "Gateway Proxy Latency Overhead",
      "method": "Additional latency introduced by gateway processing (rate limiting, authentication, payload parsing) excluding provider time",
      "input": "500 concurrent mock completion requests streamed through gateway to local mock provider",
      "environment": "Standard 4-core local CPU, 8GB RAM, FastAPI asynchronous server",
      "minimum_pass": "Average gateway proxy overhead is < 4.5 milliseconds per request",
      "target": "Average gateway proxy overhead is < 1.8 milliseconds per request",
      "report": "Gateway proxy latency overhead report and k6 benchmark output"
    },
    {
      "metric": "Automated Provider Failover Recovery Duration",
      "method": "Duration from primary provider timeout injection to successful completion fulfillment via secondary fallback provider",
      "input": "20 simulated primary provider crash and timeout chaos scenarios during live traffic",
      "environment": "FastAPI gateway connected to primary mock provider (with 500ms timeout injection) and secondary backup provider",
      "minimum_pass": "Average failover recovery duration is < 650 milliseconds across 20 trials",
      "target": "Average failover recovery duration is < 320 milliseconds across 20 trials",
      "report": "Circuit breaker and provider failover chaos audit log"
    }
  ],
  "skills": ["Python", "FastAPI", "Redis", "LangChain", "OpenAI API", "Anthropic API", "API Gateway", "Semantic Caching", "Rate Limiting"],
  "starter_input": {
    "spec": "Directory of 200 benchmark prompt payloads, semantic similarity vector test pairs, mock provider server stubs, and Redis schemas.",
    "size": "200 prompt JSON manifests, 2 mock provider service scripts, and k6 traffic drill configurations",
    "seeded_cases": "Paraphrased duplicate prompts, sudden rate-limit bursts, simulated upstream 503 errors, and corrupted streaming chunks",
    "label_source": "Deterministic mock provider responses and curated semantic similarity equivalence datasets",
    "personal_data_policy": "Strictly mock synthetic prompts and simulated business queries; zero real personal data used"
  },
  "components": [
    {"name": "Unified API Gateway & OpenAI Schema Adapter", "task_type": "API endpoint group with tests", "hours": 5.0},
    {"name": "Semantic Prompt Cache & Vector Similarity Engine", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Distributed Token-Bucket Rate Limiter & Quota Guard", "task_type": "infra component (broker, DB, orchestrator, cluster service)", "hours": 5.0},
    {"name": "Circuit Breaker & Multi-Provider Failover Router", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Gateway Throughput & Cache Latency Benchmark Suite", "task_type": "load or performance test harness + report", "hours": 4.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic cost-aware routing sending simple classification queries to cheap 8B models and complex queries to frontier models",
      "Real-time PII redacting middleware stripping phone numbers, emails, and SSNs before provider dispatch",
      "Distributed OpenTelemetry tracing propagating span contexts across upstream providers"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "API Gateway Scaffolding & Multi-Provider Routing in FastAPI and Python",
      "hours": 7,
      "done_criterion": "Gateway routes requests to OpenAI and Anthropic adapters with unified schema formatting."
    },
    {
      "name": "Semantic Caching & Rate Limiting in Redis and LangChain",
      "hours": 7,
      "done_criterion": "Redis semantic cache resolves matching prompts in < 25ms; token-bucket limiter enforces quotas."
    },
    {
      "name": "Circuit Breaker & Failover Recovery in API Gateway and Rate Limiting",
      "hours": 7,
      "done_criterion": "Circuit breaker catches primary timeouts and diverts traffic to backup provider in < 650ms."
    },
    {
      "name": "Latency Benchmarking, Anti-Fake Test & Docs",
      "hours": 7,
      "done_criterion": "Benchmark confirms proxy overhead; anti-fake test validates semantic cache hit; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Python asynchronous programming, FastAPI endpoints, and Redis data structures",
    "Familiarity with LLM API schemas, embedding models, and distributed rate limiting patterns"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (uses lightweight local embedding model or mock vector endpoints)",
    "cost": "$0 (fully testable using provided local mock provider endpoints without external API charges)",
    "accounts_keys_quotas": "No external paid API keys required (mock provider server included in test harness)",
    "reference_environment": "Local 4-core CPU with Docker Desktop (Redis 7 container) and Python 3.11",
    "fallback_path": "In-memory dictionary cache with mock hash similarity if Redis is unavailable"
  },
  "riskiest_component": {
    "name": "Semantic Cache False Positives Returning Irrelevant Completions",
    "mitigation": "Enforce high cosine similarity threshold (>= 0.92) and combine vector similarity with exact system prompt matching.",
    "fallback": "Exact SHA-256 prompt string hash matching mode bypassing vector similarity."
  },
  "deliverables": [
    "Git repository containing FastAPI gateway service, Redis semantic caching layer, and provider adapters",
    "Local mock provider testing suite simulating OpenAI and Anthropic upstream endpoints with latency injection",
    "Automated performance test harness measuring proxy overhead, cache hit rate, and failover timing",
    "Screener verification script executing automated benchmark and dynamic semantic cache validation"
  ],
  "out_of_scope": [
    "Direct fine-tuning of provider foundation models",
    "Credit card payment billing merchant integration outside usage telemetry meters",
    "Physical telecom SMS gateway delivery protocols"
  ],
  "safety_note": None,
  "resources": [
    "FastAPI Asynchronous Routing and Streaming Response Documentation",
    "Redis Vector Similarity Search (RediSearch) Manual",
    "Martin Fowler: Circuit Breaker Pattern Architecture and Implementation"
  ],
  "rubric": [
    {
      "input": "100 semantically varied prompt requests matching previously cached completions",
      "action": "python -m gateway.benchmark_cache --requests test_data/semantic_prompts.json",
      "expected_result": "Semantic cache serves responses with p95 latency < 25.0 milliseconds and zero upstream calls",
      "evidence_location": "Terminal test execution output log and reports/cache_benchmark.json",
      "pass_criterion": "p95 latency is < 25.0ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "500 concurrent requests processed through gateway to local mock provider",
      "action": "python scripts/benchmark_overhead.py --concurrency 50 --total 500",
      "expected_result": "Gateway introduces average proxy processing overhead < 4.5 milliseconds",
      "evidence_location": "Gateway overhead profiling report in reports/overhead_summary.json",
      "pass_criterion": "Average overhead is < 4.5ms with exit code 0",
      "kind": "normal"
    },
    {
      "input": "20 simulated primary provider timeout failure injections",
      "action": "python scripts/run_failover_chaos.py --trials 20 --timeout-ms 500",
      "expected_result": "Circuit breaker trips and routes requests to secondary provider within average duration < 650ms",
      "evidence_location": "Chaos failover report in reports/failover_chaos.json",
      "pass_criterion": "Average failover recovery < 650ms and 100% request fulfillment across 20 trials",
      "kind": "normal"
    },
    {
      "input": "Tenant request burst exceeding token-per-minute quota",
      "action": "curl -X POST http://localhost:8000/v1/chat/completions -H 'X-Tenant-ID: abusive-tenant' -d @test_data/burst_payload.json",
      "expected_result": "Gateway rejects request with HTTP 429 Too Many Requests and Retry-After header",
      "evidence_location": "HTTP response header and body log",
      "pass_criterion": "Response status is 429 and response body contains rate limit exceeded error",
      "kind": "normal"
    },
    {
      "input": "Dynamic prompt followed by semantically paraphrased query submitted to gateway",
      "action": "python scripts/verify_dynamic_cache.py --prompt 'Summarize quarterly net revenue for Acme Corp'",
      "expected_result": "First call queries provider and populates cache; second paraphrased query returns cached response in < 15ms",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Second query logs cache_hit=true, latency < 15ms, and provider token usage equals 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected resilient multi-provider LLM gateway in Python and FastAPI with Redis semantic caching; achieved sub-[CACHE_LATENCY] cached response times with [CACHE_HIT_RATE] hit rate, and cut downstream token expenditures across [PROMPT_COUNT] production queries.",
    "claims": [
      {
        "text": "achieved sub-[CACHE_LATENCY] cached response times with [CACHE_HIT_RATE] hit rate",
        "rubric_indexes": [0]
      },
      {
        "text": "cut downstream token expenditures across [PROMPT_COUNT] production queries",
        "rubric_indexes": [4]
      }
    ],
    "do_not_claim": "proprietary frontier model weights hosting or global CDN anycast routing network operations"
  },
  "verify": [
    "Run `python -m pytest tests/` to confirm provider adapters, rate limiting, and cache hashing pass.",
    "Execute `python -m gateway.benchmark_cache` to verify semantic cache response latency meets target benchmark.",
    "Run `python scripts/verify_dynamic_cache.py` to assert that paraphrased prompts trigger verified cache hits."
  ],
  "worksheet": {
    "q1": "Core deliverable: a multi-provider LLM gateway in Python/FastAPI with semantic prompt caching, automated failover, and Redis rate limiting.",
    "q2": "Target users: backend platform engineers, AI infrastructure developers, and enterprise cloud architects.",
    "q3": "3 use cases: enterprise AI API cost optimization, zero-downtime provider failover, and multi-tenant rate limiting.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: semantic vector caching with cosine threshold calibration, circuit-breaking without stampedes, atomic Redis Lua token budgeting, and multi-vendor stream normalization.",
    "q6": "Starter input: 200 prompt payloads, vector similarity fixtures, mock provider servers, and k6 traffic scripts. Mock queries only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: in-memory dictionary cache.",
    "q8": "Riskiest component: semantic cache false positives. Fallback: cosine threshold >= 0.92 and exact SHA-256 hash fallback.",
    "q9": "Potential faking: static cached strings. Anti-fake check 5 passes dynamic prompt and paraphrase, asserts second call hits cache in < 15ms with 0 provider tokens.",
    "q10": "Safety/ethics: Safe; mock prompt inputs and synthetic test telemetry only, zero real user personal data."
  }
}

b41_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Multi-Provider LLM Gateway with Cost Optimization | Generic headline | Minor |
| Claims / Marketing | 'Every company deploying multiple LLMs needs a gateway layer. LiteLLM...' | Unsubstantiated claims naming third-party open source projects | Moderate |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing prompt payloads and mock provider testing stubs | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Redis or CPU/RAM specifications | Major |
| Resume Bullet | Spliced bullet with copied web targets | Malformed resume bullet | Critical |
"""

b41_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Python, FastAPI, and local Redis at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Cache latency (< 25.0ms), proxy overhead (< 4.5ms), and failover recovery (< 650ms) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. In-memory dictionary cache and provided local mock provider endpoints requiring $0 external API spend.",
  "Can test data be created in minutes?": "YES. Synthetic 200-prompt benchmark dataset and mock provider testing stubs included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: proprietary model weights hosting and global CDN anycast routing.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 submits dynamic prompt and paraphrase, asserting second query hits cache with zero provider tokens.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 4."
}

b41_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved cost-aware model routing and PII redaction middleware to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic gateway metrics (semantic cache hit latency, proxy processing overhead, and automated failover duration).
- Removed Banned Content: Removed marketing references to LiteLLM.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic paraphrased prompt caching test.
"""


# ==============================================================================
# 42. brief-load-balancer
# ==============================================================================
b42_data = {
  "id": "brief-load-balancer",
  "title": "Layer Seven HTTP Reverse Proxy & Load Balancer in Go with Active Health Checks, Least-Connections & Circuit Breaking",
  "domain": "Distributed Systems",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Systems programming", "Platform/infra tool"],
  "problem": "Relying on opaque cloud provider load balancers obscures proxy-level concurrency bottlenecks, connection pool starvation, and subtle routing misconfigurations. Naive round-robin reverse proxies route traffic into dead sockets during upstream server crashes, lack connection draining during deployments, and fail to balance heterogeneous backend workloads. This project builds a high-performance Layer Seven application load balancer and reverse proxy from scratch in Go. The system implements multiple load balancing algorithms (round-robin, weighted round-robin, least-connections, and IP-hash), conducts active health checks with circuit breaking, performs graceful upstream draining during rotation, and exports Prometheus metrics.",
  "use_cases": [
    {
      "title": "Internal Microservice RPC Traffic Balancing",
      "first_sentence": "Platform engineering teams running private microservice meshes need lightweight, customizable L7 reverse proxies to distribute incoming traffic across backend service instances.",
      "second_sentence": "The load balancer balances requests using least-connections to ensure long-running computational queries do not overwhelm individual backend pods."
    },
    {
      "title": "Zero-Downtime Rolling Upstream Deployment Draining",
      "first_sentence": "Site reliability engineers require automated connection draining when deploying new application versions to prevent terminating active in-flight HTTP requests.",
      "second_sentence": "The proxy marks graduating upstreams as draining, completing pending transactions while routing all new client requests to active backend nodes."
    },
    {
      "title": "Session-Affinity E-Commerce Checkout Routing",
      "first_sentence": "E-commerce platforms maintaining in-memory shopping session state need deterministic client routing based on client IP addresses.",
      "second_sentence": "The proxy implements consistent IP-hashing, mapping identical client IP addresses to dedicated backend instances while gracefully remapping upon backend changes."
    }
  ],
  "hard_parts": [
    "Managing high-concurrency Go connection pools with mutex-free atomic counters for least-connections tracking",
    "Designing active asynchronous health check loops that rapidly detect upstream unresponsiveness without overwhelming backends",
    "Implementing graceful upstream draining that awaits in-flight request completions while rejecting new incoming connections",
    "Handling client HTTP keep-alive connection reuse and TCP socket timeouts cleanly under high throughput"
  ],
  "screener_signals": [
    "Clean idiomatic Go codebase using standard library net/http/httputil primitives, sync/atomic counters, and structured logging",
    "Comprehensive k6 or vegeta load benchmark report validating sub-millisecond proxy latency overhead under 5,000 requests per second",
    "Anti-fake verification script killing a backend upstream during active traffic load and verifying zero dropped requests and immediate route diversion"
  ],
  "job_families": [
    "Systems Software Engineer",
    "Infrastructure / Network Platform Engineer",
    "Site Reliability Engineer (SRE)"
  ],
  "stack": [
    {"tool": "Go", "role": "primary systems programming language implementing reverse proxy logic, routing strategies, and health probes"},
    {"tool": "HTTP", "role": "application layer protocol parsed, routed, and forwarded between clients and upstream servers"},
    {"tool": "Concurrency", "role": "Go goroutines, mutexes, and sync/atomic primitives coordinating connection pools"},
    {"tool": "Docker", "role": "containerization engine orchestrating multi-node backend clusters for testing"},
    {"tool": "Prometheus", "role": "monitoring system scraping exposed proxy metrics on request rates, latencies, and backend health"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Reverse Proxy Engine & Connection Pool Manager",
        "tools_used": ["Go", "HTTP"],
        "purpose": "Terminates incoming client connections, manages persistent upstream connection pools, and forwards requests"
      },
      {
        "name": "Pluggable Algorithm Strategy Selector",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Implements round-robin, weighted round-robin, least-connections, and IP-hash routing interfaces"
      },
      {
        "name": "Active Health Check & Circuit Breaker Engine",
        "tools_used": ["Go", "HTTP"],
        "purpose": "Polls backend /health endpoints periodically, detects failures, and trips circuits to isolate dead nodes"
      },
      {
        "name": "Graceful Upstream Drain Controller",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Tracks active in-flight requests per upstream and coordinates zero-downtime draining before server removal"
      },
      {
        "name": "Prometheus Metrics Exporter & Telemetry Server",
        "tools_used": ["Go", "Prometheus"],
        "purpose": "Exposes HTTP endpoints serving metrics on active connections, request counts, and upstream response times"
      }
    ],
    "data_flow": "Client HTTP requests connect to the Go proxy server; the algorithm selector determines the target upstream server based on the configured strategy (e.g., least-connections); the proxy forwards the request over pooled TCP sockets; in parallel, background health checker goroutines poll each upstream's health endpoint every 2 seconds; if an upstream fails 3 consecutive probes, the circuit breaker removes it from the active pool; when an administrator signals a backend drain, the proxy ceases routing new traffic to that backend while waiting for in-flight requests to finish before closing connections; telemetry metrics update atomically and expose to Prometheus.",
    "enforcement_mechanism": "sync/atomic integer counters tracking active connections per upstream; HTTP connection read and write timeouts preventing slowloris socket exhaustion."
  },
  "targets": [
    {
      "metric": "Proxy Latency Overhead at Concurrency",
      "method": "Wall-clock delta comparing direct upstream latency against proxy-forwarded latency under 5,000 requests per second load",
      "input": "5,000 requests per second sustained HTTP GET workload generated by k6 load tester across 4 upstream servers",
      "environment": "Standard 4-core local CPU, Go 1.21+ release binary, Docker local bridge network",
      "minimum_pass": "p95 proxy latency overhead is < 2.0 milliseconds under 5,000 req/sec",
      "target": "p95 proxy latency overhead is < 0.85 milliseconds under 5,000 req/sec",
      "report": "Proxy benchmark report and k6 latency distribution output"
    },
    {
      "metric": "Unhealthy Upstream Detection & Removal Duration",
      "method": "Duration from upstream server crash injection to complete removal from active routing table",
      "input": "20 simulated upstream process termination chaos scenarios during active traffic streaming",
      "environment": "4 backend mock HTTP servers running in local Docker containers or background processes",
      "minimum_pass": "Average removal duration is < 3.0 seconds with 0 failed requests routed to dead node after removal",
      "target": "Average removal duration is < 1.2 seconds with 0 failed requests routed to dead node after removal",
      "report": "Active health check timing log and failover verification summary"
    },
    {
      "metric": "Least-Connections Traffic Distribution Balance Ratio",
      "method": "Variance ratio of active concurrent connections across heterogeneous backend nodes with variable processing delays",
      "input": "1,000 simulated requests with variable processing durations (10ms to 200ms) distributed across 4 backends",
      "environment": "Standard 4-core local CPU, Go test suite",
      "minimum_pass": "Traffic distribution balance ratio variance is < 15.0% across backends",
      "target": "Traffic distribution balance ratio variance is < 6.0% across backends",
      "report": "Routing algorithm distribution test log and balance ratio report"
    }
  ],
  "skills": ["Go", "HTTP", "Concurrency", "Docker", "Prometheus", "Networking", "System Design", "Linux"],
  "starter_input": {
    "spec": "Directory of Go reverse proxy scaffolding, 4 backend HTTP mock servers with configurable latency and error injection, and k6 test scripts.",
    "size": "5 Go source packages, 4 mock server scripts, and automated vegeta/k6 load testing configurations",
    "seeded_cases": "Sudden upstream SIGKILL, slowloris partial HTTP headers, flapping health checks, and connection reset spikes",
    "label_source": "Deterministic mock upstream response payloads and Prometheus metric assertions",
    "personal_data_policy": "Strictly mock synthetic HTTP transactions and simulated network traffic; zero real personal data used"
  },
  "components": [
    {"name": "Reverse Proxy Engine & Connection Pool Manager", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Pluggable Algorithm Strategy Selector", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Active Health Check & Circuit Breaker Engine", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Graceful Upstream Drain Controller", "task_type": "low-level/system subsystem", "hours": 4.0},
    {"name": "Prometheus Metrics Exporter & Telemetry Server", "task_type": "API endpoint group with tests", "hours": 4.0}
  ],
  "extended_path": {
    "features": [
      "Dynamic TLS termination with automated ACME Let's Encrypt certificate issuance and renewal",
      "WebSockets proxying with bi-directional streaming frame forwarding and connection keepalive",
      "Dynamic upstream configuration discovery using DNS SRV records or Consul service catalog"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Reverse Proxy Core & Pluggable Algorithms in Go and HTTP",
      "hours": 7,
      "done_criterion": "Proxy implements round-robin and least-connections routing across backend pools."
    },
    {
      "name": "Active Health Checks & Circuit Breaker in Concurrency and Networking",
      "hours": 7,
      "done_criterion": "Health probe detects upstream crashes and removes dead servers within 3 seconds."
    },
    {
      "name": "Graceful Draining & Prometheus Metrics in Docker and Prometheus",
      "hours": 7,
      "done_criterion": "Draining completes in-flight requests; Prometheus exposes connection metrics in Linux."
    },
    {
      "name": "Load Benchmarking, Anti-Fake Test & Docs in System Design",
      "hours": 7,
      "done_criterion": "Benchmark confirms < 2ms proxy overhead; anti-fake test validates zero dropped requests; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go programming, goroutines, channels, and sync synchronization primitives",
    "Understanding of HTTP/1.1 protocol mechanics, reverse proxies, and socket networking"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and network I/O bound systems software)",
    "cost": "$0 (fully open-source stack using Go and Docker)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ and Docker Desktop installed",
    "fallback_path": "Running backend mock servers as local background OS processes without Docker"
  },
  "riskiest_component": {
    "name": "Socket File Descriptor Exhaustion Under High Concurrency Load",
    "mitigation": "Configure http.Transport with high MaxIdleConnsPerHost (e.g., 200) and strict IdleConnTimeout.",
    "fallback": "Enable aggressive TCP keep-alive probe intervals and limit maximum concurrent client connections."
  },
  "deliverables": [
    "Git repository containing Go reverse proxy codebase, algorithm implementations, and Prometheus exporter",
    "Mock backend server suite capable of configurable latency simulation and failure injection",
    "Automated load testing harness with k6 scripts measuring latency overhead under 5,000 req/sec",
    "Screener verification script validating active failover and dynamic upstream draining in under 2 minutes"
  ],
  "out_of_scope": [
    "Layer 4 TCP/UDP SYN packet-level routing with BPF or DPDK kernel bypass",
    "Hardware network switch ASIC programming or BGP routing table advertisement",
    "WAF (Web Application Firewall) SQL injection regex deep packet inspection"
  ],
  "safety_note": None,
  "resources": [
    "Go net/http/httputil ReverseProxy Implementation and Source Code",
    "HAProxy Architecture Guide: Load Balancing Algorithms and Health Checking",
    "Prometheus Go Client Library Guidelines for Instrumenting HTTP Applications"
  ],
  "rubric": [
    {
      "input": "5,000 requests per second sustained load generated by k6 across 4 backends",
      "action": "go run ./cmd/benchmarker --rps 5000 --duration 30s",
      "expected_result": "Proxy successfully routes traffic with p95 latency overhead < 2.0 milliseconds",
      "evidence_location": "Terminal test execution output log and reports/proxy_benchmark.json",
      "pass_criterion": "p95 proxy overhead < 2.0ms and error rate < 0.01% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "20 simulated upstream process termination chaos events during active traffic",
      "action": "go test -v ./proxy/... -run TestUpstreamCrashDetection",
      "expected_result": "Health checker removes terminated upstream within average duration < 3.0 seconds",
      "evidence_location": "Health check audit log in reports/health_check_report.json",
      "pass_criterion": "Average detection time < 3.0s with exit code 0",
      "kind": "normal"
    },
    {
      "input": "1,000 requests with variable processing durations distributed across 4 backends",
      "action": "go test -v ./proxy/... -run TestLeastConnectionsBalancing",
      "expected_result": "Least-connections algorithm balances load with connection variance ratio < 15.0%",
      "evidence_location": "Least-connections balance evaluation log",
      "pass_criterion": "Connection variance ratio < 15.0% with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Prometheus scrape request sent to proxy metrics port",
      "action": "curl http://localhost:9090/metrics",
      "expected_result": "Endpoint returns standard Prometheus format metrics including proxy_requests_total and proxy_upstream_health",
      "evidence_location": "HTTP response payload",
      "pass_criterion": "Response status is 200 and metrics contain proxy_requests_total and proxy_upstream_health",
      "kind": "normal"
    },
    {
      "input": "Dynamic upstream termination injected while continuous client request stream is active",
      "action": "go run ./scripts/verify_dynamic_failover.go --target-backend http://localhost:8081",
      "expected_result": "Proxy immediately redirects in-flight and incoming traffic to remaining 3 healthy backends with 0 dropped requests",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Verification log confirms 0 failed requests (100% success rate) and backend 8081 marked down with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected Layer Seven HTTP load balancer in Go with active health checking; maintained sub-[PROXY_OVERHEAD] proxy latency overhead under [THROUGHPUT_RPS] sustained throughput, and removed crashed upstreams within [REMOVAL_TIME] seconds.",
    "claims": [
      {
        "text": "maintained sub-[PROXY_OVERHEAD] proxy latency overhead under [THROUGHPUT_RPS] sustained throughput",
        "rubric_indexes": [0]
      },
      {
        "text": "removed crashed upstreams within [REMOVAL_TIME] seconds",
        "rubric_indexes": [1]
      }
    ],
    "do_not_claim": "hardware ASIC switch programming or global BGP anycast IP network routing"
  },
  "verify": [
    "Run `go test -v ./...` to confirm proxy forwarding, routing algorithms, and health check unit tests pass.",
    "Execute `go run ./cmd/benchmarker` to verify proxy latency overhead remains below the 2ms threshold under load.",
    "Run `go run ./scripts/verify_dynamic_failover.go` to assert zero dropped requests during live upstream failure."
  ],
  "worksheet": {
    "q1": "Core deliverable: a Layer 7 HTTP reverse proxy and load balancer in Go with active health checking, multiple routing algorithms, and Prometheus metrics.",
    "q2": "Target users: systems software engineers, platform infrastructure architects, and site reliability engineers.",
    "q3": "3 use cases: microservice RPC traffic balancing, zero-downtime rolling upstream draining, and session-affinity checkout routing.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: atomic connection counter synchronization, asynchronous health checking without backend flooding, graceful connection draining, and TCP socket lifecycle management.",
    "q6": "Starter input: Go reverse proxy scaffolding, 4 backend HTTP mock servers, and k6 traffic test suites. Mock HTTP traffic only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local background processes without Docker.",
    "q8": "Riskiest component: socket file descriptor exhaustion under load. Fallback: configure MaxIdleConnsPerHost=200 and strict idle timeouts.",
    "q9": "Potential faking: static round-robin returns. Anti-fake check 5 kills backend during live traffic, asserts 0 failed requests and immediate diversion.",
    "q10": "Safety/ethics: Safe; local loopback mock servers and synthetic traffic only, zero production network interference."
  }
}

b42_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Layer 7 Load Balancer with Health Checks & Adaptive Routing | Generic headline | Minor |
| Claims / Marketing | 'HAProxy, Nginx, and Envoy are all implementations of this... Unlocks senior backend and platform engineering roles' | Marketing claims regarding interview unlocking | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing mock backend servers and traffic generation suites | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No Go version or CPU/network specs | Major |
| Resume Bullet | 'handled [N] req/sec req/sec with < [M ms] overhead' | Broken duplicated text string with unpopulated brackets | Critical |
"""

b42_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go and local mock HTTP backends at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Proxy latency overhead (< 2.0ms), upstream removal (< 3.0s), and balance variance (< 15.0%) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Local mock HTTP servers running as OS background processes without requiring Docker.",
  "Can test data be created in minutes?": "YES. Go mock server binaries and automated k6 traffic configurations included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: Layer 4 packet routing and hardware ASIC switch programming.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 terminates upstream server during active streaming traffic and asserts 0 dropped requests.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 1."
}

b42_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved TLS termination and WebSockets proxying to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic load balancer metrics (proxy latency overhead under 5,000 req/sec, upstream crash removal duration, and balance variance).
- Removed Banned Content: Removed interview unlocking marketing hype.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic upstream crash test.
"""


# ==============================================================================
# 43. brief-message-queue
# ==============================================================================
b43_data = {
  "id": "brief-message-queue",
  "title": "Persistent Log-Structured Message Broker in Go with Segmented Storage, Consumer Groups & At-Least-Once Delivery",
  "domain": "Distributed Systems",
  "difficulty": "INTERMEDIATE",
  "project_types": ["Systems programming", "Platform/infra tool"],
  "problem": "Relying on external message brokers without understanding their underlying storage and replication mechanics leads to silent message loss, consumer partition starvation, and runaway disk exhaustion. In-memory queues lack crash durability, while naive file-based queues suffer from catastrophic disk write bottlenecks when executing synchronous disk syncs per message. This project builds a production-grade persistent message queue and log broker from scratch in Go. The system implements append-only log segmentation with index files, manages consumer group partition assignment and offset commits, guarantees at-least-once delivery with unacknowledged message redelivery timeouts, and isolates unprocessable poisoned messages into dead-letter queues.",
  "use_cases": [
    {
      "title": "Asynchronous E-Commerce Order Fulfillment Pipelines",
      "first_sentence": "E-commerce checkout platforms need durable message buffering to decouple instant client checkout confirmations from downstream payment and shipping services.",
      "second_sentence": "The broker persists order messages to disk logs, ensuring that even if backend inventory workers crash, all pending orders are reliably redelivered and processed."
    },
    {
      "title": "Financial Transaction Audit Event Streaming",
      "first_sentence": "Core banking and payment processing services require immutable, sequentially ordered audit records for every account debit and credit transaction.",
      "second_sentence": "The engine writes transactions to sequential segmented log files with binary index offsets, guaranteeing deterministic replayability and non-repudiation."
    },
    {
      "title": "High-Volume Telemetry and IoT Ingestion Buffering",
      "first_sentence": "Smart device fleet management systems ingest millions of sensor status pings per minute that fluctuate wildly during peak operational hours.",
      "second_sentence": "The queue absorbs high-concurrency ingestion bursts using batched memory buffers and sequential append-only writes without dropping packets."
    }
  ],
  "hard_parts": [
    "Designing a high-performance binary log segment format with sparse indexing for fast message offset lookups",
    "Coordinating consumer group partition assignments and cooperative rebalancing upon worker member joins or leaves",
    "Implementing reliable at-least-once delivery with acknowledgement timeout tracking and dead-letter queue routing",
    "Balancing write throughput and data durability using batching windows and controlled fsync disk flushing"
  ],
  "screener_signals": [
    "Clean idiomatic Go codebase implementing binary file protocol serialization, segment rotation, and consumer offset stores",
    "High-throughput benchmark report validating 45,000+ messages per second sustained ingestion with crash durability",
    "Anti-fake verification script simulating consumer worker crash mid-batch and asserting broker redelivers unacknowledged messages to surviving consumer"
  ],
  "job_families": [
    "Distributed Systems Engineer",
    "Backend Infrastructure Engineer",
    "Core Data Platform Developer"
  ],
  "stack": [
    {"tool": "Go", "role": "primary systems programming language implementing TCP server, log engine, and consumer group coordinator"},
    {"tool": "TCP", "role": "transport protocol powering custom binary client wire protocol for low-overhead message streaming"},
    {"tool": "Append-only Log", "role": "storage architecture persisting sequential message entries into segmented binary files"},
    {"tool": "Concurrency", "role": "Go channels, mutexes, and goroutines coordinating concurrent publishers and consumers"},
    {"tool": "File I/O", "role": "low-level OS file system calls managing binary segment files, sparse indexes, and fsync flushes"}
  ],
  "architecture": {
    "components": [
      {
        "name": "Custom Binary TCP Wire Protocol Server",
        "tools_used": ["Go", "TCP"],
        "purpose": "Parses incoming binary framing packets for Produce, Fetch, Commit, and Heartbeat commands"
      },
      {
        "name": "Append-Only Segmented Log Storage Engine",
        "tools_used": ["Go", "Append-only Log", "File I/O"],
        "purpose": "Appends messages to active log segment files, maintains sparse index offsets, and rotates segments at size limits"
      },
      {
        "name": "Consumer Group & Partition Offset Coordinator",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Manages consumer group memberships, tracks committed partition offsets, and coordinates rebalancing"
      },
      {
        "name": "Acknowledgement Tracker & Dead-Letter Queue (DLQ)",
        "tools_used": ["Go", "Concurrency"],
        "purpose": "Tracks unacknowledged in-flight message leases, triggers redelivery on timeout, and routes poisoned records to DLQ"
      },
      {
        "name": "Broker Throughput & Crash Durability Benchmark Suite",
        "tools_used": ["Go", "File I/O"],
        "purpose": "Measures publish throughput, consumer fetch latency, and verifies zero message loss after sudden process kills"
      }
    ],
    "data_flow": "Producers connect over TCP and emit binary Produce requests containing topic, partition, and payload; the log engine writes messages to the active binary segment file and updates the sparse index file; periodic or threshold-based fsync calls commit data to durable disk; consumer group workers connect and issue Fetch requests with current partition offsets; the broker returns message batches and starts an unacknowledged lease timer; when consumers emit Commit requests, the offset advances in the metadata store; if a consumer crashes before committing, the lease expires and the broker redelivers unacknowledged messages to an active consumer; messages failing 3 redeliveries divert to the dead-letter queue topic.",
    "enforcement_mechanism": "Append-only immutable file writes preventing data corruption; CRC32 checksums on every message payload verifying integrity."
  },
  "targets": [
    {
      "metric": "Sustained Message Ingestion Throughput",
      "method": "Publish throughput measured in messages per second with batched fsync durability enabled across 100,000 messages",
      "input": "100,000 synthetic 512-byte message payloads published concurrently across 4 partition topics",
      "environment": "Standard 4-core local CPU, Go 1.21+ release binary, local SSD storage",
      "minimum_pass": "Publish throughput is >= 45,000 messages per second with 0 payload corruption",
      "target": "Publish throughput is >= 85,000 messages per second with 0 payload corruption",
      "report": "Broker publish throughput and ingestion benchmark report"
    },
    {
      "metric": "Crash Recovery Zero-Loss Durability",
      "method": "Verification that all committed messages exist with valid CRC checksums after sudden SIGKILL process termination",
      "input": "50,000 published messages with sudden process kill injected at message 50,000",
      "environment": "Standard 4-core local CPU, local filesystem log directory",
      "minimum_pass": "50,000 of 50,000 published messages successfully recovered upon broker restart with 0 corrupted records",
      "target": "50,000 of 50,000 published messages successfully recovered upon broker restart with 0 corrupted records",
      "report": "Crash recovery audit log and message count verification summary"
    },
    {
      "metric": "Consumer Crash Redelivery Detection Window",
      "method": "Duration from consumer worker crash to unacknowledged message reassignment and delivery to surviving consumer",
      "input": "20 simulated consumer worker process kill scenarios during active message batch processing",
      "environment": "Go test harness with 2 consumer workers in a shared consumer group",
      "minimum_pass": "Average redelivery duration is < 5.0 seconds across 20 trials",
      "target": "Average redelivery duration is < 1.8 seconds across 20 trials",
      "report": "Consumer failure redelivery timing log"
    }
  ],
  "skills": ["Go", "TCP", "Append-only Log", "Concurrency", "File I/O", "Networking", "System Design", "Distributed Systems"],
  "starter_input": {
    "spec": "Binary log segment framing protocol specification, consumer group mock harness, and 50,000 synthetic message payloads.",
    "size": "Specification document, sample Go client library, and automated benchmark runner scripts",
    "seeded_cases": "Truncated binary messages, CRC checksum mismatches, consumer crash during commit, and log segment rotation boundaries",
    "label_source": "Deterministic sequential message IDs and payload CRC32 checksum manifests",
    "personal_data_policy": "Strictly mock synthetic event payloads and simulated sensor data; zero real personal data used"
  },
  "components": [
    {"name": "Custom Binary TCP Wire Protocol Server", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Append-Only Segmented Log Storage Engine", "task_type": "low-level/system subsystem", "hours": 6.0},
    {"name": "Consumer Group & Partition Offset Coordinator", "task_type": "low-level/system subsystem", "hours": 5.0},
    {"name": "Acknowledgement Tracker & Dead-Letter Queue (DLQ)", "task_type": "low-level/system subsystem", "hours": 4.0},
    {"name": "Broker Throughput & Crash Durability Benchmark Suite", "task_type": "load or performance test harness + report", "hours": 3.0}
  ],
  "extended_path": {
    "features": [
      "Distributed partition replication across multiple broker nodes using Raft consensus",
      "Compacted topic support retaining only the latest value for each message key (similar to Kafka log compaction)",
      "Zero-copy network transmission using the Linux sendfile system call to stream segment bytes directly to sockets"
    ],
    "hours": 14
  },
  "milestones": [
    {
      "name": "Binary TCP Protocol & Append-Only Log Storage in Go and File I/O",
      "hours": 7,
      "done_criterion": "Server accepts binary produce requests and appends messages to segmented log files on disk."
    },
    {
      "name": "Consumer Groups & Offset Coordination in Concurrency and Networking",
      "hours": 7,
      "done_criterion": "Consumer groups register and track committed offsets across partitions."
    },
    {
      "name": "At-Least-Once Delivery & Dead-Letter Queues in Distributed Systems",
      "hours": 7,
      "done_criterion": "Unacknowledged messages redeliver in < 5s; poisoned messages route to DLQ."
    },
    {
      "name": "Durability Benchmarking, Anti-Fake Test & Docs in System Design",
      "hours": 7,
      "done_criterion": "Benchmark confirms 45k msg/sec; anti-fake test validates consumer crash redelivery; docs complete."
    }
  ],
  "prerequisites": [
    "Proficiency in Go systems programming, binary encoding (binary.Read/Write), and goroutine concurrency",
    "Understanding of file system I/O (os.File, mmap, fsync) and distributed messaging semantics"
  ],
  "environment": {
    "os": "Linux / macOS / Windows with WSL2",
    "ram": "8GB RAM",
    "gpu": "None required (purely CPU and storage I/O bound systems software)",
    "cost": "$0 (fully open-source Go codebase)",
    "accounts_keys_quotas": "No external cloud accounts, paid services, or API keys required",
    "reference_environment": "Local 4-core CPU with Go 1.21+ and local SSD storage",
    "fallback_path": "Pure standard library Go binary running on local disk without external dependencies"
  },
  "riskiest_component": {
    "name": "File System Disk Write Bottlenecks on Synchronous fsync Calls",
    "mitigation": "Implement group commit batching (flushing every N messages or M milliseconds) and pre-allocate segment files.",
    "fallback": "Configurable asynchronous write mode with background sync goroutine."
  },
  "deliverables": [
    "Git repository containing Go message broker binary, client SDK, and CLI inspection tooling",
    "Segmented binary storage engine with sparse index parser and segment rotation",
    "Automated benchmark harness measuring ingestion throughput across 100,000 messages",
    "Screener verification script executing crash recovery verification and dynamic redelivery in under 2 minutes"
  ],
  "out_of_scope": [
    "Multi-datacenter geo-replication over WAN links",
    "In-broker SQL stream processing or complex event processing (CEP) rule engines",
    "Custom hardware FPGA-accelerated network packet parsers"
  ],
  "safety_note": None,
  "resources": [
    "The Log: What every software engineer should know about real-time data's unifying abstraction (Jay Kreps)",
    "Apache Kafka Internal Architecture: Log Segments and Index Files",
    "Go File I/O and System Call Optimization Manual"
  ],
  "rubric": [
    {
      "input": "100,000 synthetic 512-byte messages published across 4 partitions",
      "action": "go run ./cmd/benchmarker --messages 100000 --batch-size 100",
      "expected_result": "Broker sustains ingestion throughput >= 45,000 messages per second with zero data corruption",
      "evidence_location": "Terminal test execution output log and reports/ingestion_benchmark.json",
      "pass_criterion": "Measured throughput is >= 45,000 msg/sec with exit code 0",
      "kind": "normal"
    },
    {
      "input": "50,000 messages persisted to disk followed by sudden SIGKILL process kill",
      "action": "go run ./scripts/test_crash_recovery.go --messages 50000",
      "expected_result": "Broker restarts, parses segment index headers, and verifies 50,000 of 50,000 messages present",
      "evidence_location": "Crash recovery report in reports/crash_audit.json",
      "pass_criterion": "Recovered count equals 50,000 with 0 corrupted messages and exit code 0",
      "kind": "normal"
    },
    {
      "input": "20 simulated consumer worker crash scenarios during active batch processing",
      "action": "go test -v ./broker/... -run TestConsumerCrashRedelivery",
      "expected_result": "Broker detects unacknowledged lease expiration and redelivers messages to active worker in < 5.0s",
      "evidence_location": "Consumer redelivery timing summary log",
      "pass_criterion": "Average redelivery duration < 5.0s with exit code 0",
      "kind": "normal"
    },
    {
      "input": "Poisoned message payload failing processing 3 consecutive times",
      "action": "go run ./scripts/test_dlq_routing.go --poison-payload 'TRIGGER_ERROR'",
      "expected_result": "Broker increments failure counter and routes unprocessable message to dedicated DLQ topic",
      "evidence_location": "DLQ topic inspection output",
      "pass_criterion": "Message appears in DLQ topic with original error metadata and exit code 0",
      "kind": "normal"
    },
    {
      "input": "Dynamic message published while consumer worker is intentionally crashed via SIGSTOP",
      "action": "go run ./scripts/verify_dynamic_redelivery.go --kill-worker 1",
      "expected_result": "Broker detects consumer 1 silence, rebalances partition, and redelivers message to consumer 2",
      "evidence_location": "Dynamic verification console execution output log",
      "pass_criterion": "Consumer 2 successfully acknowledges dynamic message with exit code 0",
      "kind": "anti_fake"
    }
  ],
  "bullet": {
    "template": "Architected persistent segmented message broker in Go with consumer group coordination; achieved [INGESTION_THROUGHPUT] message ingestion throughput with guaranteed delivery, and executed automated consumer failure redelivery in sub-[REDELIVERY_WINDOW] seconds.",
    "claims": [
      {
        "text": "achieved [INGESTION_THROUGHPUT] message ingestion throughput with guaranteed delivery",
        "rubric_indexes": [0]
      },
      {
        "text": "executed automated consumer failure redelivery in sub-[REDELIVERY_WINDOW] seconds",
        "rubric_indexes": [2]
      }
    ],
    "do_not_claim": "distributed multi-datacenter consensus replication or hardware storage controller firmware authoring"
  },
  "verify": [
    "Run `go test -v ./...` to confirm segment rotation, index lookups, and consumer group coordination pass.",
    "Execute `go run ./cmd/benchmarker` to verify message ingestion throughput meets the 45k msg/sec benchmark.",
    "Run `go run ./scripts/verify_dynamic_redelivery.go` to assert unacknowledged message redelivery upon worker crash."
  ],
  "worksheet": {
    "q1": "Core deliverable: a persistent log-structured message broker in Go with segmented storage, consumer groups, and at-least-once delivery.",
    "q2": "Target users: distributed systems developers, data infrastructure engineers, and backend platform architects.",
    "q3": "3 use cases: e-commerce order fulfillment buffering, financial transaction audit event streaming, and IoT telemetry ingestion.",
    "q4": "Stated hours: 28 hours. Calculated bottom-up: 24 component hours * 1.15 buffer = 27.6 -> 28 hours. Intermediate level.",
    "q5": "Hard parts: binary log segment framing with sparse index lookups, consumer group partition rebalancing, at-least-once delivery with lease timeouts, and fsync batching.",
    "q6": "Starter input: binary framing protocol spec, consumer group mock harness, and 50,000 synthetic message payloads. Synthetic payloads only.",
    "q7": "Hardware: Linux/macOS/Windows WSL2, 8GB RAM, CPU only, $0 cost, zero cloud accounts. Fallback: local disk file operations without Docker.",
    "q8": "Riskiest component: synchronous fsync bottlenecks. Fallback: group commit batching and pre-allocated segment files.",
    "q9": "Potential faking: in-memory mock queues. Anti-fake check 5 crashes worker during dynamic publish, asserts surviving consumer receives redelivered message.",
    "q10": "Safety/ethics: Safe; local loopback binary TCP and synthetic payloads only, zero production infrastructure exposure."
  }
}

b43_old_diag = """
| Field | Old Value | Flaw / Violation | Severity |
|---|---|---|---|
| Title / Headline | Persistent Message Queue with At-Least-Once Delivery | Generic headline | Minor |
| Claims / Marketing | 'Kafka is in 70%+ of senior backend JDs... skills that operations teams desperately need' | Marketing claims citing job description statistics | Major |
| Target Realism | 'Throughput: > [N] req/sec sustained | Latency: p99 < [M ms] measured via k6 benchmark' | Copied web-service target formula with unpopulated brackets | Critical |
| Scope & Hours | 28 hours without component-level breakdown | Unsubstantiated effort estimate | Major |
| Starter Input | None specified | Missing binary framing specs and payload datasets | Major |
| Rubric Quality | 'passes when verified by automated test script or benchmark log' across all 5 checks | Circular, untestable verification criteria | Critical |
| Anti-Fake Test | Missing | No dynamic input verification | Critical |
| Reference Environment | Missing | No storage or Go specs | Major |
| Resume Bullet | 'achieved [N] req/sec msg/sec with guaranteed at-least-once delivery' | Malformed broken units string with unpopulated brackets | Critical |
"""

b43_reviewer = {
  "Could a student finish in Est. Time on a normal laptop / free tier?": "YES. Core path is 28 hours (INTERMEDIATE); runs locally on 8GB RAM CPU using Go and local SSD storage at $0 cost.",
  "Does each performance target name its bottleneck and is reachable?": "YES. Ingestion throughput (>= 45,000 msg/sec), crash recovery (50,000 of 50,000), and redelivery window (< 5.0s) measured directly on local machine.",
  "Is there a CPU/local/free fallback?": "YES. Standard library Go binary operating directly on local filesystem without requiring external services.",
  "Can test data be created in minutes?": "YES. Synthetic 50,000-message payload generator and binary benchmark scripts included in repository.",
  "Does the brief specify what NOT to build?": "YES. Clearly out of scope: multi-datacenter geo-replication and in-broker SQL stream processing.",
  "Are screener verification steps concrete and runnable in < 10 min?": "YES. 5 runnable scripts with exact CLI commands, JSON log outputs, and deterministic pass criteria.",
  "Is there an anti-fake check?": "YES. Anti-fake check 5 crashes worker during active publish and asserts surviving consumer receives redelivered message.",
  "Is the resume bullet verified by rubric checks?": "YES. Bullet metrics correspond to rubric items 0 and 2."
}

b43_changelog = """
- Scope & Hours: Calculated bottom-up using effort model (24 component hours * 1.15 buffer = 28 hours). Moved Raft consensus replication and log compaction to Extended Path (+14h).
- Target Realism: Eliminated copied web-service targets; replaced with authentic message broker metrics (sustained publish throughput, zero-loss crash recovery, and consumer redelivery duration).
- Removed Banned Content: Removed job description statistical marketing hype.
- Fixed Rubric: Replaced circular 'passes when verified by automated test script' lines with 5 concrete checks including anti-fake dynamic worker crash redelivery test.
"""


# ==============================================================================
# BATCH EXECUTION RUNNER
# ==============================================================================
def run_batch_4_part2():
    res39 = process_brief(b39_data, b39_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b39_reviewer, b39_changelog)
    res40 = process_brief(b40_data, b40_old_diag, {"topic_value": 9.5, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b40_reviewer, b40_changelog)
    res41 = process_brief(b41_data, b41_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b41_reviewer, b41_changelog)
    res42 = process_brief(b42_data, b42_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b42_reviewer, b42_changelog)
    res43 = process_brief(b43_data, b43_old_diag, {"topic_value": 9.0, "verification_rubric": 3.5, "technical_accuracy": 5.0, "scope_realism": 5.0, "completeness": 4.0, "honesty": 3.5, "resume_bullet_safety": 6.0}, {"wrong_project_targets": True, "no_milestones_and_deliverables": True, "prefilled_or_marketing": True}, b43_reviewer, b43_changelog)
    return [res39, res40, res41, res42, res43]

if __name__ == "__main__":
    results = run_batch_4_part2()
    print("Batch 4 Part 2 finished successfully:", results)
