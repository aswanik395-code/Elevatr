import io
import pdfplumber


class PDFExtractionError(Exception):
    pass


def extract_text(file_bytes: bytes) -> str:
    """Extract plain text from a PDF's bytes. Raises PDFExtractionError
    if the file can't be read or contains no extractable text (e.g. a
    scanned image with no OCR layer)."""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = [page.extract_text() or "" for page in pdf.pages]
    except Exception as exc:
        raise PDFExtractionError(f"Could not read PDF: {exc}") from exc

    text = "\n".join(pages_text).strip()
    if not text:
        raise PDFExtractionError(
            "No extractable text found. The PDF may be a scanned image "
            "without a text layer."
        )
    return text
