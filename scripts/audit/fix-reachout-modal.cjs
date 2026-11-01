const fs = require('fs');

const path = 'src/features/suite/outreach/ReachOutPage.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('showOverLengthModal,')) {
  content = content.replace(
    '  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);',
    '  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);\n  const [showOverLengthModal, setShowOverLengthModal] = useState<boolean>(false);'
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('ReachOutPage.tsx fixed');

