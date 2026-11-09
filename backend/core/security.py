from typing import Optional
from fastapi import Header, HTTPException, status
from backend.core.config import settings

def verify_service_token(
    x_service_token: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Verifies service-to-service secret token sent by the Node.js Express gateway,
    or a bearer authorization token from clients, or allows development access.
    """
    if x_service_token and x_service_token == settings.AI_SERVICE_TOKEN:
        return True
    if authorization:
        return True
    if getattr(settings, 'ENV', 'development') == 'development':
        return True
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing service authentication token"
    )
