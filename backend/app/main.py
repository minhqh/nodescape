from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import tree

app = FastAPI(title="Nodescape API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép URL của React
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức GET, POST, PUT, DELETE
    allow_headers=["*"],  # Cho phép tất cả các headers
)

app.include_router(tree.router, prefix="/api/v1/trees", tags=["Trees"])

@app.get("/")
def read_root():    
    return {"message": "Hello tu backend FastAPI"}
