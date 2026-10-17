#!/usr/bin/env python3
"""
extract_seeds.py - Scans /briefs/ and produces:
- /out/seeds.csv
- /out/progress.json
"""

import os
import re
import csv
import json

BRIEFS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "briefs"))
OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "out"))

PROJECT_TYPE_MAP = {
    "ab-experimentation": ["ML training", "API/backend"],
    "analytics-clickhouse": ["Data analysis/BI", "Data pipeline/ETL/streaming"],
    "api-gateway-scratch": ["API/backend", "Systems/low-level/networking"],
    "api-sdk-design": ["CLI/tools/libraries", "API/backend"],
    "blockchain-defi": ["Blockchain/smart contracts"],
    "canary-deployment": ["CI/CD/DevOps/security pipelines", "IaC/cloud"],
    "cdc-pipeline": ["Data pipeline/ETL/streaming", "Distributed systems"],
    "ci-cd-from-scratch": ["CI/CD/DevOps/security pipelines", "CLI/tools/libraries"],
    "compiler-interpreter": ["Systems/low-level/networking", "CLI/tools/libraries"],
    "computer-vision-api": ["ML serving/vision/NLP/LLM/RAG", "API/backend"],
    "container-runtime": ["Systems/low-level/networking"],
    "credit-risk-model": ["ML training", "Data analysis/BI"],
    "data-quality-framework": ["Data pipeline/ETL/streaming", "CLI/tools/libraries"],
    "database-engine": ["Systems/low-level/networking", "Distributed systems"],
    "devsecops-pipeline": ["CI/CD/DevOps/security pipelines", "Security projects"],
    "dist-cache-rust": ["Distributed systems", "Systems/low-level/networking"],
    "dist-rate-limiter": ["Distributed systems", "API/backend"],
    "embedding-search-engine": ["Search/recommendation", "ML serving/vision/NLP/LLM/RAG"],
    "event-driven-saas": ["API/backend", "Distributed systems"],
    "event-recon": ["Data pipeline/ETL/streaming", "Distributed systems"],
    "event-sourcing": ["Distributed systems", "API/backend"],
    "feature-flag-platform": ["API/backend", "Distributed systems"],
    "fraud-detection-ml": ["ML training", "Data pipeline/ETL/streaming"],
    "fullstack-ecommerce": ["Frontend/web", "API/backend"],
    "genai-code-reviewer": ["ML serving/vision/NLP/LLM/RAG", "CLI/tools/libraries"],
    "gitignore-lsp": ["CLI/tools/libraries", "Systems/low-level/networking"],
    "gitops-registry": ["CI/CD/DevOps/security pipelines", "IaC/cloud"],
    "gpu-accelerated-inference": ["ML serving/vision/NLP/LLM/RAG", "Systems/low-level/networking"],
    "graph-analysis": ["Data analysis/BI", "Systems/low-level/networking"],
    "graphql-federation": ["API/backend", "Distributed systems"],
    "graphql-to-sql-compiler": ["CLI/tools/libraries", "Systems/low-level/networking"],
    "high-throughput-logging": ["Distributed systems", "Data pipeline/ETL/streaming"],
    "homomorphic-encryption": ["Security projects", "Systems/low-level/networking"],
    "interview-prep-ai": ["ML serving/vision/NLP/LLM/RAG", "API/backend"],
    "knowledge-graph": ["Data pipeline/ETL/streaming", "Search/recommendation"],
    "kubernetes-operator": ["IaC/cloud", "Distributed systems"],
    "llm-agent-workflow": ["ML serving/vision/NLP/LLM/RAG", "API/backend"],
    "llm-evaluation-framework": ["ML serving/vision/NLP/LLM/RAG", "CLI/tools/libraries"],
    "llm-finetuning-peft": ["ML training", "ML serving/vision/NLP/LLM/RAG"],
    "llm-finetuning-rlhf": ["ML training", "ML serving/vision/NLP/LLM/RAG"],
    "llm-gateway": ["API/backend", "ML serving/vision/NLP/LLM/RAG"],
    "load-balancer": ["Systems/low-level/networking", "Distributed systems"],
    "message-queue": ["Distributed systems", "Systems/low-level/networking"],
    "micro-frontend-shell": ["Frontend/web"],
    "mlops-platform": ["MLOps/platform", "CI/CD/DevOps/security pipelines"],
    "mobile-flutter-prod": ["Mobile"],
    "multimodal-ai-app": ["ML serving/vision/NLP/LLM/RAG", "Frontend/web"],
    "notification-service": ["API/backend", "Distributed systems"],
    "observability-sdk": ["CLI/tools/libraries", "Systems/low-level/networking"],
    "offline-first-sync": ["Distributed systems", "Mobile"],
    "opentelemetry-observability": ["CI/CD/DevOps/security pipelines", "Distributed systems"],
    "osint-data-platform": ["Data pipeline/ETL/streaming", "Security projects"],
    "peer-to-peer": ["Distributed systems", "Systems/low-level/networking"],
    "personalization-engine": ["Search/recommendation", "ML training"],
    "privacy-preserving-ml": ["Security projects", "ML training"],
    "progressive-web-app": ["Frontend/web"],
    "raft-consensus": ["Distributed systems", "Systems/low-level/networking"],
    "rag-vector-search": ["ML serving/vision/NLP/LLM/RAG", "Search/recommendation"],
    "react-native-offline": ["Mobile", "Distributed systems"],
    "realtime-analytics-dashboard": ["Frontend/web", "Data analysis/BI"],
    "realtime-code-execution": ["Security projects", "Systems/low-level/networking"],
    "realtime-collab": ["Distributed systems", "Frontend/web"],
    "realtime-stock-platform": ["Data pipeline/ETL/streaming", "API/backend"],
    "recommendation-engine": ["Search/recommendation", "ML training"],
    "schema-registry": ["Distributed systems", "Data pipeline/ETL/streaming"],
    "search-engine": ["Search/recommendation", "Systems/low-level/networking"],
    "semantic-kernel-agent": ["ML serving/vision/NLP/LLM/RAG", "API/backend"],
    "serverless-backend": ["API/backend", "IaC/cloud"],
    "service-mesh": ["Distributed systems", "Systems/low-level/networking"],
    "streaming-data-pipeline": ["Data pipeline/ETL/streaming", "Distributed systems"],
    "supply-chain-optimization": ["Data analysis/BI", "API/backend"],
    "terraform-cloud-infra": ["IaC/cloud"],
    "time-series-forecasting": ["ML training", "Data analysis/BI"],
    "tls-certificate-manager": ["Security projects", "Systems/low-level/networking"],
    "upi-payment-gateway": ["API/backend", "Security projects"],
    "vector-db-from-scratch": ["Systems/low-level/networking", "Search/recommendation"],
    "workflow-engine": ["Distributed systems", "API/backend"],
    "zero-trust-proxy": ["Security projects", "Systems/low-level/networking"]
}

def parse_old_brief(filepath):
    filename = os.path.basename(filepath)
    is_cert = filename.startswith("cert-")
    
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    lines = content.splitlines()
    title = ""
    domain = "Cloud / Infrastructure" if is_cert else "Software Engineering"
    difficulty = "INTERMEDIATE"
    hours = 0
    tools = ""

    # Line 1 title
    if lines:
        first_line = lines[0].strip()
        if "—" in first_line:
            title = first_line.split("—", 1)[1].strip()
        elif "-" in first_line:
            title = first_line.split("-", 1)[1].strip()
        else:
            title = first_line

    for line in lines[:20]:
        l_str = line.strip()
        if l_str.startswith("Domain"):
            domain = l_str.split(":", 1)[1].strip()
        elif l_str.startswith("Difficulty"):
            difficulty = l_str.split(":", 1)[1].strip()
        elif l_str.startswith("Est. Time"):
            time_part = l_str.split(":", 1)[1].strip()
            digits = re.findall(r"\d+", time_part)
            if digits:
                hours = int(digits[0])
        elif l_str.startswith("Tech Stack") or l_str.startswith("Tools"):
            tools = l_str.split(":", 1)[1].strip()

    # Determine project type
    base_id = filename.replace(".txt", "").replace("brief-", "").replace("cert-", "")
    if is_cert:
        p_types = ["Certification / exam pages"]
        entry_type = "certification_page"
    else:
        p_types = PROJECT_TYPE_MAP.get(base_id, ["API/backend"])
        entry_type = "project"

    return {
        "filename": filename,
        "old_title": title,
        "domain": domain,
        "old_difficulty": difficulty,
        "old_hours": hours,
        "main_tools": tools,
        "project_types": "; ".join(p_types),
        "type": entry_type
    }

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "audits"), exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "design"), exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "improved"), exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "reports"), exist_ok=True)

    files = sorted([f for f in os.listdir(BRIEFS_DIR) if f.endswith(".txt")])
    seeds = []
    progress = {}

    for f in files:
        fpath = os.path.join(BRIEFS_DIR, f)
        parsed = parse_old_brief(fpath)
        seeds.append(parsed)
        progress[f] = "pending"

    # Write seeds.csv
    csv_path = os.path.join(OUT_DIR, "seeds.csv")
    fieldnames = ["filename", "old_title", "domain", "old_difficulty", "old_hours", "main_tools", "project_types", "type"]
    with open(csv_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for s in seeds:
            writer.writerow(s)
    print(f"Extracted {len(seeds)} seeds to: {csv_path}")

    # Write progress.json
    prog_path = os.path.join(OUT_DIR, "progress.json")
    with open(prog_path, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2)
    print(f"Initialized progress table with {len(progress)} files to: {prog_path}")

if __name__ == "__main__":
    main()
