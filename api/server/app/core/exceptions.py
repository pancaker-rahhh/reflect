class NotFoundError(Exception):
    pass


class LLMGenerationError(Exception):
    pass


class DatabaseError(Exception):
    pass


class AuthorizationError(Exception):
    pass


class BadRequestError(Exception):
    pass
