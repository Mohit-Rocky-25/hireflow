import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Make sure pdf worker is available. Vite handles this via plugin usually, or we set workerSrc
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (ext === 'txt' || ext === 'md') {
    return await file.text();
  }

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (ext === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\\n';
      }
      if (fullText.trim().length < 50) {
         throw new Error("Looks like a scanned image.");
      }
      return fullText;
    } catch (e: any) {
      throw new Error(e.message === "Looks like a scanned image." ? 
        "This looks like a scanned image. Please paste the text instead." : 
        "Failed to read PDF. Please paste the text instead.");
    }
  }

  throw new Error("Unsupported file format.");
}
