import os

import uvicorn
from dotenv import load_dotenv

load_dotenv()

if __name__ == '__main__':
    port = int(os.getenv('PORT', '8000'))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'

    uvicorn.run(
        'app.main:app', 
        host='0.0.0.0', 
        port=port, 
        reload=debug,  # Only reload in debug mode
        log_level='info'
    )
