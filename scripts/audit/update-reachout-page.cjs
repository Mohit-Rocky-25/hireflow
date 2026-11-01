const fs = require('fs');

const path = 'src/features/suite/outreach/ReachOutPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Normalize CRLF to LF
content = content.replace(/\r\n/g, '\n');

// 1. Add state for over length modal if not present
if (!content.includes('showOverLengthModal')) {
  const stateTarget = "  const [copiedSubject, setCopiedSubject] = useState(false);";
  const stateReplacement = `  const [copiedSubject, setCopiedSubject] = useState(false);
  const [showOverLengthModal, setShowOverLengthModal] = useState(false);`;
  content = content.replace(stateTarget, stateReplacement);
}

// 2. Add handleAutoTrimLinkedIn and update handleCopyNote
const copyHelpersTarget = `  // Copy helpers
  const handleCopyNote = async () => {
    try {
      await navigator.clipboard.writeText(fitResult.body);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    } catch {
      // ignore
    }
  };`;

const copyHelpersReplacement = `  // Auto-trim helper for LinkedIn 300-char limit
  const handleAutoTrimLinkedIn = () => {
    if (slots.proofPoint) {
      let trimmed = slots.proofPoint
        .replace(/\\b(responsible for|worked on|in order to|helped to|actively|successfully|currently)\\b\\s*/gi, '')
        .replace(/\\s+/g, ' ')
        .trim();
      const excess = fitResult.charCount - 295;
      if (excess > 0 && trimmed.length > excess + 10) {
        trimmed = trimmed.slice(0, trimmed.length - excess).replace(/[,\\s]+$/, '').trim();
      }
      setSlots((prev) => ({ ...prev, proofPoint: trimmed }));
    }
  };

  const executeCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNote(true);
      setShowOverLengthModal(false);
      setTimeout(() => setCopiedNote(false), 2000);
    } catch {
      // ignore
    }
  };

  // Copy helpers
  const handleCopyNote = async () => {
    if (selectedTemplate.channel === 'linkedin_connect' && fitResult.charCount > 300) {
      setShowOverLengthModal(true);
      return;
    }
    await executeCopyText(fitResult.body);
  };`;

if (!content.includes('handleAutoTrimLinkedIn =')) {
  content = content.replace(copyHelpersTarget, copyHelpersReplacement);
}

fs.writeFileSync(path, content, 'utf8');
console.log('ReachOutPage.tsx updated successfully');
