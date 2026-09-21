"""
Stage 5: Filing & Tracking

Backed by Azure Table Storage (with transparent SQLite local fallback).
Generates standardized municipal tracking IDs (GRV-XXXXXX) with official Chandigarh Right to Service (RTS) SLA target dates.
"""

import uuid
from services import storage

# Statutory timelines under Punjab Right to Service (RTS) Act as extended to UT Chandigarh
DEPARTMENT_SLAS = {
    "water": 15,        # 15 working days for water billing disputes / 48h for major leaks
    "electricity": 7,   # 7 working days for defective meter inspection / 4h for outages
    "sanitation": 2,    # 2 days (24h for door-to-door collection missed, 48h for waste dumps)
    "roads": 7,         # 7 working days for streetlights and pothole repair
    "general": 14       # 14 days standard municipal grievance resolution
}


def file_complaint(
    department_id: str,
    department_name: str,
    complaint_text: str,
    citizen_name: str,
    blob_url: str = None
) -> dict:
    tracking_id = f"GRV-{uuid.uuid4().hex[:8].upper()}"
    dept_key = department_id.lower() if department_id else "general"
    sla_days = DEPARTMENT_SLAS.get(dept_key, 14)

    return storage.save_complaint(
        tracking_id=tracking_id,
        department_id=dept_key,
        department_name=department_name or "Municipal Corporation Chandigarh",
        complaint_text=complaint_text,
        citizen_name=citizen_name or "Citizen",
        sla_target_days=sla_days,
        blob_url=blob_url
    )


def get_status(tracking_id: str) -> dict:
    return storage.get_complaint(tracking_id)


def advance_status(tracking_id: str) -> dict:
    return storage.advance_complaint_status(tracking_id)
