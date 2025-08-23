import asyncio
import asyncpg

async def check_db():
    # Connect to database
    conn = await asyncpg.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='reflect_dev'
    )
    
    try:
        # Check bug_report_feedback columns
        rows = await conn.fetch("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'bug_report_feedback' 
            ORDER BY ordinal_position
        """)
        
        print("Bug report feedback columns:")
        for row in rows:
            print(f"  {row['column_name']}: {row['data_type']} (nullable: {row['is_nullable']})")
        
        # Check if severity_level exists
        severity_cols = [row for row in rows if row['column_name'] == 'severity_level']
        if severity_cols:
            print(f"\n✓ severity_level column exists: {severity_cols[0]['data_type']}")
        else:
            print("\n✗ severity_level column does NOT exist")
            
        # Check feedback table columns
        rows = await conn.fetch("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'feedback' 
            ORDER BY ordinal_position
        """)
        
        print("\nFeedback table columns:")
        for row in rows:
            print(f"  {row['column_name']}: {row['data_type']} (nullable: {row['is_nullable']})")
            
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_db())
