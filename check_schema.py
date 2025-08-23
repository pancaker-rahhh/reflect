import asyncio
from app.db import get_db

async def check_schema():
    async with get_db() as db:
        # Check bug_report_feedback table columns
        result = await db.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'bug_report_feedback' 
            ORDER BY ordinal_position
        """)
        columns = result.fetchall()
        
        print("Bug report feedback columns:")
        for col in columns:
            print(f"  {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})")
        
        # Check if severity_level column exists
        severity_cols = [col for col in columns if col[0] == 'severity_level']
        if severity_cols:
            print(f"\n✓ severity_level column exists: {severity_cols[0][1]}")
        else:
            print("\n✗ severity_level column does NOT exist")
        
        # Check feedback table columns
        result = await db.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'feedback' 
            ORDER BY ordinal_position
        """)
        columns = result.fetchall()
        
        print("\nFeedback table columns:")
        for col in columns:
            print(f"  {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})")

if __name__ == "__main__":
    asyncio.run(check_schema())
