from fastapi import FastAPI
from app.api.v1 import tree

app = FastAPI(title="Nodescape API")

app.include_router(tree.router, prefix="/api/v1/trees", tags=["Trees"])

@app.get("/")
def read_root():
    return {"message": "Hello tu backend FastAPI"}
