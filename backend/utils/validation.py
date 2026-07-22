from fastapi import UploadFile

MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB, matches the frontend limit
ALLOWED_CONTENT_TYPES = {"application/pdf"}


class ValidationError(Exception):
    pass


async def validate_and_read(file: UploadFile) -> bytes:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise ValidationError("Only PDF files are supported.")

    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise ValidationError("File is over the 5MB limit.")
    if len(contents) == 0:
        raise ValidationError("The uploaded file is empty.")

    return contents
