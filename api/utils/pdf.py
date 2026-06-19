import fitz 
import os

def stamp_signature_on_pdf(input_path: str, output_path: str, x: float, y: float, signature_text: str):
    """
    Opens a PDF, embeds a text signature at the exact X/Y coordinates, and saves a new immutable version.
    """
    doc = fitz.open(input_path)
    
    page = doc[0]
    
    point = fitz.Point(x, y + 20)
    
    page.insert_text(
        point, 
        signature_text, 
        fontsize=14, 
        color=(0, 0.2, 0.6), # A deep trust-blue color
        fontname="helv",
        fontfile=None,
        set_simple=True
    )
    
    doc.save(output_path)
    doc.close()
    
    return output_path