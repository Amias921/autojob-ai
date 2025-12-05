"""
PDF Resume Generator Utility
Converts plain text resumes to professionally formatted PDFs
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfgen import canvas
import os


def generate_resume_pdf(resume_text: str, output_path: str) -> str:
    """
    Generate a PDF from resume text
    
    Args:
        resume_text: Plain text resume content
        output_path: Path where PDF should be saved
        
    Returns:
        Path to the generated PDF file
    """
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create PDF document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch
    )
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles for resume
    title_style = ParagraphStyle(
        'ResumeTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor='#1a1a1a',
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Times-Bold'
    )
    
    contact_style = ParagraphStyle(
        'ContactInfo',
        parent=styles['Normal'],
        fontSize=11,
        textColor='#1a1a1a',
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Times-Roman'
    )
    
    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=12,
        textColor='#1a1a1a',
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        borderWidth=0,
        borderPadding=0,
        borderColor='#333333',
        borderRadius=0,
        backColor=None
    )
    
    body_style = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontSize=11,
        textColor='#1a1a1a',
        leading=14,
        fontName='Times-Roman',
        spaceAfter=6
    )
    
    # Build the PDF content
    story = []
    
    # Parse resume text into sections
    lines = resume_text.split('\n')
    
    for line in lines:
        line = line.strip()
        
        if not line:
            story.append(Spacer(1, 6))
            continue
            
        # Detect section headers (usually all caps or start with **)
        if line.isupper() or line.startswith('**') or line.startswith('##'):
            # Clean up markdown formatting
            clean_line = line.replace('**', '').replace('##', '').strip()
            story.append(Paragraph(clean_line.upper(), section_header_style))
            # Add horizontal line effect with spacer
            story.append(Spacer(1, 2))
            
        # First few lines might be name/contact
        elif len(story) < 5 and ('@' in line or 'linkedin.com' in line.lower() or line.startswith('+1')):
            story.append(Paragraph(line, contact_style))
            
        # First line is likely the name
        elif len(story) == 0:
            story.append(Paragraph(line, title_style))
            
        # Regular body text
        else:
            # Preserve bullet points
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                story.append(Paragraph(line, body_style))
            else:
                story.append(Paragraph(line, body_style))
    
    # Build PDF
    doc.build(story)
    
    return output_path
