# HIREFLOW AI — SECRET ROTATION & EMERGENCY REVOCATION CHECKLIST

**Audit Date**: 2026-10-09  
**Git History Scan**: Verified clean. Zero leaked private credentials or `.env` files detected in repository history.  
**Working Tree Scan**: Verified clean. Zero unmasked secrets detected in code or build artifacts.  

---

## 1. Current Secrets Inventory

| Provider | Variable Name | Location | Status | Action Required |
|---|---|---|---|---|
| Google AI Studio | `GEMINI_API_KEY` | Development `.env` (Untracked) | Safe / Local only | Ensure keys used locally have IP/API restrictions configured in Google Cloud Console. |

---

## 2. Emergency Rotation Procedure (If a Key is Ever Exposed)

> [!CRITICAL]
> Removing a secret from source code or committing a deletion does NOT make it safe. Once committed to git or exposed to a client bundle, a key must be considered compromised immediately.

### Google Gemini API Key
1. Navigate to [Google AI Studio — API Keys](https://aistudio.google.com/app/apikey).
2. Locate the key in use and click **Delete** (Revoke).
3. Click **Create API key** in a dedicated Google Cloud project.
4. Set API restrictions: Restrict exclusively to **Generative Language API**.
5. Update your local `.env` file with the newly generated key.
6. Restart the local dev server (`npm run dev`).

### Git History Cleanup (If a Secret Was Ever Committed)
If a developer ever commits a sensitive file:
```bash
# 1. Immediately revoke the key in the provider console (DO THIS FIRST)
# 2. Use git-filter-repo to purge the file from local git history:
pip install git-filter-repo
git filter-repo --invert-paths --path .env --force

# 3. Coordinate with all team members to re-clone the repository
# 4. Never force-push until the key has been invalidated at the provider!
```

---

## 3. GitHub Push Protection & Secret Scanning
- Ensure GitHub **Secret Scanning** and **Push Protection** are enabled under:  
  `Repository Settings -> Code security and analysis -> Secret scanning & Push protection`.
