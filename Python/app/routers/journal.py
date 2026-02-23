from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import database
from ..models import journal_model
from sqlalchemy import text
import os
from datetime import date

router = APIRouter(
    prefix="/journal",
    tags=["Journal Ct"]
)

# Load DB Names from environment variables
DB_NAME_USER_NEW = os.getenv('DB_NAME_USER_NEW', 'btggasify_userpanel_live')
DB_NAME_USER = os.getenv('DB_NAME_USER', 'btggasify_live')
DB_NAME_MASTER = os.getenv('DB_NAME_MASTER', 'btggasify_masterpanel_live')
DB_NAME_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')

@router.get("/get-party-list/{party_type}")
async def get_party_list(
    party_type: str,
    db: AsyncSession = Depends(database.get_db)
):
    try:
        # Validate party_type
        if party_type not in ['customer', 'supplier', 'bank']:
            raise HTTPException(status_code=400, detail="Invalid party type. Must be 'customer', 'supplier', or 'bank'.")

        if party_type == 'customer':
            query = text(f"SELECT Id as id, CustomerName as name FROM {DB_NAME_USER}.master_customer WHERE IsActive = 1")
        elif party_type == 'supplier':
            query = text(f"SELECT SupplierId as id, SupplierName as name FROM {DB_NAME_MASTER}.master_supplier WHERE IsActive = 1")
        elif party_type == 'bank':
            query = text(f"SELECT BankId as id, BankName as name FROM {DB_NAME_MASTER}.master_bank WHERE IsActive = 1")
            
        result = await db.execute(query)
        rows = result.mappings().all()
        
        return {
            "status": True,
            "message": "Success",
            "data": rows
        }

    except Exception as e:
        print(f"Error fetching party list: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-gl-codes")
async def get_gl_codes(db: AsyncSession = Depends(database.get_db)):
    try:
        query = text(f"SELECT id, GLcode, description FROM {DB_NAME_FINANCE}.tbl_GLcodemaster WHERE isActive = 1")
        result = await db.execute(query)
        rows = result.mappings().all()
        return {
            "status": True,
            "message": "Success",
            "data": rows
        }
    except Exception as e:
        print(f"Error fetching GL Codes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-journal")
async def save_journal(
    request: journal_model.JournalCreateRequest,
    db: AsyncSession = Depends(database.get_db)
):
    try:
        # 1. Generate Journal No (Simple logic for now, ideally strictly sequential/safe)
        # Assuming format JRN-YYYY-MM-XXXX
        # For simplicity, we might let DB handle it or generate here.
        # Let's check max ID first or just use a timestamp based NO for MVP if logic not specified.
        # However, user didn't specify format. I will generate a simple one.
        today_str = date.today().strftime("%Y%m")
        # Ensure 'journal_no' is passed or generated. I'll generate it.
        journal_no = f"JRN-{today_str}-{request.created_by}" # Placeholder logic

        # 2. Insert Header via SP
        # Note: SQLAlchemy execute with OUT parameters is tricky in async.
        # Simpler to do a standard INSERT via text or a procedure that SELECTs the ID.
        # I will use the SP I defined but since it uses OUT param, I might just use Python logic to Insert and Get ID to avoid async driver issues with OUT params if any.
        # Actually, `proc_save_journal_header` uses LAST_INSERT_ID() set to p_journal_id. 
        # Calling it might return the result set if I SELECT it.
        
        # Adjusted strategy: Execute Raw Insert for Header to easily get ID in async 
        # OR modify SP to SELECT LAST_INSERT_ID() instead of OUT param.
        # I will assume I can modify/use the SP as created, but calling it via `CALL` directly matches user request.
        # To get the ID back, I need to use a session variable.
        
        # Using session variable trick for MySQL
        query_header = text(f"""
            CALL {DB_NAME_FINANCE}.proc_save_journal_header(
                :p_journal_no, :p_journal_date, :p_description, :p_party_type, 
                :p_party_id, :p_party_name, :p_ref_no, :p_total_amt, :p_status, :p_created_by, @new_id
            );
        """)
        
        params_header = {
            "p_journal_no": journal_no,
            "p_journal_date": request.journal_date,
            "p_description": request.description,
            "p_party_type": request.party_type,
            "p_party_id": request.party_id,
            "p_party_name": request.party_name,
            "p_ref_no": request.reference_no,
            "p_total_amt": request.total_amount,
            "p_status": request.status,
            "p_created_by": request.created_by
        }
        
        await db.execute(query_header, params_header)
        
        # Fetch the ID
        result_id = await db.execute(text("SELECT @new_id as id"))
        journal_id_row = result_id.mappings().first()
        journal_id = journal_id_row['id']
        
        if not journal_id:
             raise Exception("Failed to retrieve new Journal ID")

        # 3. Insert Details
        # Loop execution for now (safe and simple for this context)
        # Using raw insert for details as requested (no specific SP for details requested, usually generic)
        detail_query = text(f"""
            INSERT INTO {DB_NAME_FINANCE}.tbl_journal_details 
            (journal_id, gl_code, type, description, amount, reference_no)
            VALUES (:journal_id, :gl_code, :type, :desc, :amount, :ref_no)
        """)
        
        for detail in request.details:
            detail_params = {
                "journal_id": journal_id,
                "gl_code": detail.gl_code,
                "type": detail.type,
                "desc": detail.description,
                "amount": detail.amount,
                "ref_no": detail.reference_no
            }
            await db.execute(detail_query, detail_params)

        # Add is_posted to save
        query_update_is_posted = text(f"UPDATE {DB_NAME_FINANCE}.tbl_journal_master SET is_posted = :is_posted WHERE journal_id = :journal_id")
        await db.execute(query_update_is_posted, {"is_posted": request.is_posted, "journal_id": journal_id})

        await db.commit()

        return {
            "status": True,
            "message": "Journal saved successfully",
            "journal_id": journal_id
        }

    except Exception as e:
        await db.rollback()
        print(f"Error saving journal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-journal/{journal_id}")
async def get_journal_by_id(journal_id: int, db: AsyncSession = Depends(database.get_db)):
    try:
        # Get Header
        header_query = text(f"""
            SELECT journal_id as id, journal_no, DATE_FORMAT(journal_date, '%Y-%m-%d') as journal_date, 
                   description, party_type, party_id, party_name, reference_no, 
                   total_amount, status, created_by, is_posted
            FROM {DB_NAME_FINANCE}.tbl_journal_master
            WHERE journal_id = :journal_id
        """)
        header_res = await db.execute(header_query, {"journal_id": journal_id})
        header = header_res.mappings().first()
        
        if not header:
            raise HTTPException(status_code=404, detail="Journal not found")

        # Get Details
        detail_query = text(f"""
            SELECT detail_id as id, gl_code, type, description, amount, reference_no 
            FROM {DB_NAME_FINANCE}.tbl_journal_details
            WHERE journal_id = :journal_id
        """)
        detail_res = await db.execute(detail_query, {"journal_id": journal_id})
        details = detail_res.mappings().all()

        return {
            "status": True,
            "data": {
                "header": dict(header),
                "details": [dict(d) for d in details]
            }
        }
    except Exception as e:
        print(f"Error getting journal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update-journal/{journal_id}")
async def update_journal(
    journal_id: int,
    request: journal_model.JournalCreateRequest,
    db: AsyncSession = Depends(database.get_db)
):
    try:
        # 1. Update Header
        header_update = text(f"""
            UPDATE {DB_NAME_FINANCE}.tbl_journal_master 
            SET journal_date = :date, description = :desc, party_type = :ptype, 
                party_id = :pid, party_name = :pname, reference_no = :ref, 
                total_amount = :amt, status = :status, is_posted = :is_posted, updated_at = NOW()
            WHERE journal_id = :jid
        """)
        await db.execute(header_update, {
            "date": request.journal_date,
            "desc": request.description,
            "ptype": request.party_type,
            "pid": request.party_id,
            "pname": request.party_name,
            "ref": request.reference_no,
            "amt": request.total_amount,
            "status": request.status,
            "is_posted": request.is_posted,
            "jid": journal_id
        })

        # 2. Delete existing details and re-insert (easiest way to handle edit/add/remove for collections)
        delete_details = text(f"DELETE FROM {DB_NAME_FINANCE}.tbl_journal_details WHERE journal_id = :jid")
        await db.execute(delete_details, {"jid": journal_id})

        # 3. Insert Details
        detail_query = text(f"""
            INSERT INTO {DB_NAME_FINANCE}.tbl_journal_details 
            (journal_id, gl_code, type, description, amount, reference_no)
            VALUES (:journal_id, :gl_code, :type, :desc, :amount, :ref_no)
        """)
        
        for detail in request.details:
            await db.execute(detail_query, {
                "journal_id": journal_id,
                "gl_code": detail.gl_code,
                "type": detail.type,
                "desc": detail.description,
                "amount": detail.amount,
                "ref_no": detail.reference_no
            })

        await db.commit()

        return {
            "status": True,
            "message": "Journal updated successfully",
            "journal_id": journal_id
        }

    except Exception as e:
        await db.rollback()
        print(f"Error updating journal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-all-journals")
async def get_all_journals(db: AsyncSession = Depends(database.get_db)):
    try:
        query = text(f"""
            SELECT journal_id as id, 
                   journal_no as journalNo, 
                   DATE_FORMAT(journal_date, '%Y-%m-%d') as date, 
                   description, 
                   total_amount as amount, 
                   status
            FROM {DB_NAME_FINANCE}.tbl_journal_master
            ORDER BY journal_date DESC, journal_id DESC
        """)
        result = await db.execute(query)
        rows = result.mappings().all()

        # Convert to a list of dicts to ensure JSON serialization
        journals = [dict(row) for row in rows]

        return {
            "status": True,
            "data": journals
        }
    except Exception as e:
        print(f"Error fetching all journals: {e}")
        raise HTTPException(status_code=500, detail=str(e))