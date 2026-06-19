# backend/utils/email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from itsdangerous import URLSafeTimedSerializer

SECRET_KEY = "your_super_secret_key_here" 
SECURITY_PASSWORD_SALT = "signature_app_salt"

serializer = URLSafeTimedSerializer(SECRET_KEY)

def generate_signing_link(doc_id: int, signer_email: str) -> str:
    """
    Generates a secure, time-sensitive token containing the doc_id and email.
    """
    token = serializer.dumps({"doc_id": doc_id, "email": signer_email}, salt=SECURITY_PASSWORD_SALT)
    
    frontend_url = f"http://localhost:5173/sign/{token}"
    return frontend_url

def send_signature_email(signer_email: str, signing_link: str, document_name: str):
    """
    Simulates sending an email to the signer. 
    In production, you would configure an SMTP server (like SendGrid or AWS SES) here.
    """
    print("\n" + "="*50)
    print(f"📧 EMAIL INTERCEPTED (Development Mode)")
    print(f"To: {signer_email}")
    print(f"Subject: Action Required: Please sign {document_name}")
    print(f"Body: You have been requested to sign a document.")
    print(f"Please click the secure link below to review and sign:")
    print(f"{signing_link}")
    print("="*50 + "\n")
    
    return True