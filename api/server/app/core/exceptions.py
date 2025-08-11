from fastapi import HTTPException


class AuthenticationError(HTTPException):
    def __init__(self, detail: str = 'Authentication failed'):
        super().__init__(status_code=401, detail=detail)


class NotFoundError(HTTPException):
    def __init__(self, detail: str = 'Not found'):
        super().__init__(status_code=404, detail=detail)


class BadRequestError(HTTPException):
    def __init__(self, detail: str = 'Bad request'):
        super().__init__(status_code=400, detail=detail)


class InternalServerError(HTTPException):
    def __init__(self, detail: str = 'Internal server error'):
        super().__init__(status_code=500, detail=detail)


class ForbiddenError(HTTPException):
    def __init__(self, detail: str = 'Forbidden'):
        super().__init__(status_code=403, detail=detail)


class ConflictError(HTTPException):
    def __init__(self, detail: str = 'Conflict'):
        super().__init__(status_code=409, detail=detail)


class ValidationError(HTTPException):
    def __init__(self, detail: str = 'Validation error'):
        super().__init__(status_code=422, detail=detail)
