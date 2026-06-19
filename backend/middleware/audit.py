from fastapi import Request

async def audit_log_middleware(request: Request, call_next):
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        return await call_next(request)
        
    response = await call_next(request)
    return response