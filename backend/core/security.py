from fastapi import Header, HTTPException, status
from backend.core.config import settings

def verify_service_token(x_service_token: str = Header(None)):
    """
    Verifies the service-to-service secret token sent by the Node.js Express gateway.
    """
    if not x_service_token or x_service_token != settings.AI_SERVICE_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing service authentication token"
        )
    return True
