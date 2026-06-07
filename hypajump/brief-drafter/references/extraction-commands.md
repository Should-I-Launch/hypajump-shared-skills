# Document Text Extraction Fallback Commands

Quick reference for extracting text from client-supplied documents when Python libraries (`python-docx`, `pypdf`) are not available in the execution environment.

## macOS

### Word documents (.docx, .doc, .dot)

```bash
# Convert to text and print to stdout
textutil -convert txt -stdout "/path/to/file.docx"

# Works for .docx, .doc, and .dot (legacy templates)
# Preserves paragraph structure reasonably well
# Handles Unicode and macOS-specific encodings
```

### PDF

```bash
# Requires poppler (usually installed via Homebrew: brew install poppler)
pdftotext -layout "/path/to/file.pdf" -

# -layout preserves approximate page layout (columns, spacing)
# Print to stdout with trailing dash
```

## Linux

### Word documents (.docx)

```bash
# If python-docx is unavailable, use docx2txt
docx2txt "/path/to/file.docx" -

# Or pandoc
pandoc -f docx -t plain "/path/to/file.docx"
```

### Legacy Word (.doc, .dot)

```bash
# antiword is the classic tool
antiword "/path/to/file.doc"

# Or catdoc
catdoc "/path/to/file.doc"
```

### PDF

```bash
# Same as macOS if poppler is installed
pdftotext -layout "/path/to/file.pdf" -
```

## Windows

### Word documents

```powershell
# PowerShell with Word COM object (requires Word installed)
$word = New-Object -ComObject Word.Application
$doc = $word.Documents.Open("C:\path\to\file.docx")
Write-Output $doc.Content.Text
$doc.Close()
$word.Quit()
```

### PDF

```powershell
# If pdftotext.exe is available (Poppler for Windows)
pdftotext -layout "C:\path\to\file.pdf" -
```

## Python Sandbox (execute_code)

If you must use `execute_code` and libraries are missing, try system calls via `subprocess`:

```python
import subprocess

# macOS example for .docx
result = subprocess.run(
    ["textutil", "-convert", "txt", "-stdout", "/path/to/file.docx"],
    capture_output=True, text=True
)
text = result.stdout
```

If the tool is not found, immediately fall back to `terminal()` instead of trying to install packages in the sandbox.

## DOCX Embedded Media Extraction

When a `.docx` is the primary brief, it may contain embedded screenshots in `word/media/`. These often show UI behavior, expected output layout, conditional wording, or legislation references that are invisible in extracted text.

```bash
# Unzip the docx (it is a ZIP archive) and list images
unzip -d /tmp/docx_extract "/path/to/file.docx"
ls /tmp/docx_extract/word/media/

# Then run vision analysis on each image
# vision_analyze(image_url="/tmp/docx_extract/word/media/image1.png", question="...")
```

Always inspect `word/media/` before writing specs if the primary brief contains phrases like "see image below", "example below", "as shown", or "screenshot".

### When to use OCR instead of (or alongside) vision analysis

Embedded screenshots in legal, financial, and admin briefs are very often **structured-text screenshots** rather than UI photos: form mock-ups, fee/category tables, conditional cite blocks, configuration panels. For these, Tesseract OCR is faster and produces directly-quotable structured text that flows straight into specs.

Use OCR as the primary tool when the screenshot is text-heavy and tabular. Use vision analysis when layout, colour highlights, or visual relationships matter more than the text itself. Run both when the image carries both kinds of information.

```bash
# macOS: install once
brew install tesseract

# Run OCR on each extracted image and tag with filename
cd /tmp/docx_extract/word/media
for f in image*.png; do
  echo "===== $f ====="
  tesseract "$f" - 2>/dev/null
done
```

Tesseract reliably extracts: headings, form labels, table rows with prices/categories, legislation citations, and red-text editorial notes (e.g. "delete or amend as dictated by ..."). It struggles with: heavily-styled marketing graphics, screenshots of charts, and dense low-contrast text — those still want vision analysis.

If `vision_analyze` fails to load a local file path on first try, jump straight to OCR rather than retrying. For structured screenshots, OCR usually gives you everything you need anyway.

## Legacy Format Conversion (for document-generation pipelines)

When the brief includes legacy `.doc` or `.dot` templates that must be auto-populated by a modern backend, text extraction is not enough — you need a `.docx` template. Use LibreOffice headless conversion:

```bash
# Convert .doc or .dot to .docx (requires LibreOffice installed)
soffice --headless --convert-to docx "/path/to/legacy-template.doc" --outdir /tmp/converted/

# Also works for .dot templates
soffice --headless --convert-to docx "/path/to/template.dot" --outdir /tmp/converted/
```

- Produces a clean `.docx` that `python-docx-template` / `docx-tpl` can populate deterministically.
- If LibreOffice is unavailable, note in `IMPLEMENTATION-SPEC.md` that legacy template conversion is a Day-03 blocker.
- Always preserve the original `.doc`/`.dot` in `dokumen/` and place the converted `.docx` alongside it with a note.

## When to Use What

| Format | First Try | Fallback |
|---|---|---|
| .docx | `textutil` (macOS) / `docx2txt` (Linux) | `pandoc` |
| .doc / .dot (extract text) | `textutil` (macOS) / `antiword` (Linux) | `catdoc` |
| .doc / .dot (convert to .docx) | `soffice --headless --convert-to docx` | Manual rebuild from extracted text |
| .pdf | `pdftotext -layout` | `pdftotext` (no layout) |
| .xlsx | `terminal()` with `ssconvert` or `xlsx2csv` | Python `openpyxl` if available |
| .csv | `read_file` or `terminal()` `cat` | Python `csv` module |
