from fastapi import FastAPI

app = FastAPI(title="Nodescape API")

@app.get("/")
def read_root():
    return {"message": "Hello tu backend FastAPI"}
