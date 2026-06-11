from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from app.core.config import settings
from app.schemas.tree import TreeCreate, TreeResponse

router = APIRouter()

# Khởi tạo Supabase Client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

@router.post("/", response_model=TreeResponse)
def save_tree(tree_in: TreeCreate):
    try:
        # Insert dữ liệu thẳng vào bảng trees
        data, count = supabase.table("trees").insert({
            "name": tree_in.name,
            "tree_data": tree_in.tree_data
        }).execute()
        
        return data[1][0] # Supabase Python Client trả về tuple (phản hồi, dữ liệu)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{tree_id}", response_model=TreeResponse)
def get_tree(tree_id: str):
    try:
        data, count = supabase.table("trees").select("*").eq("id", tree_id).execute()
        if not data[1]:
            raise HTTPException(status_code=404, detail="Không tìm thấy cây")
        return data[1][0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))