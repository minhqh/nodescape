from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from app.core.config import settings
from app.schemas.tree import TreeCreate, TreeResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.services.tree_logic import BinarySearchTree, Node

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

class TreeActionRequest(BaseModel):
    action: str
    value: int
    current_tree: Optional[Dict[str, Any]] = None

def deserialize_tree(d: Optional[Dict[str, Any]]) -> Optional[Node]:
    if not d:
        return None
    node = Node(d["value"])
    node.left = deserialize_tree(d.get("left"))
    node.right = deserialize_tree(d.get("right"))
    return node

# --- API THAO TÁC CÂY TRÊN RAM ---
@router.post("/process-action")
def process_tree_action(payload: TreeActionRequest):
    tree = BinarySearchTree()
    if payload.current_tree:
        tree.root = deserialize_tree(payload.current_tree)
    
    if payload.action == "insert":
        tree.insert(payload.value)
    elif payload.action == "delete":
        tree.delete(payload.value)
    else:
        raise HTTPException(status_code=400, detail="Hành động không hợp lệ")
        
    return {
        "tree_data": tree.get_tree_state(),
        "inorder": tree.inorder(),
        "preorder": tree.preorder(),
        "postorder": tree.postorder()
    }

# --- API TƯƠNG TÁC DATABASE (SUPABASE) ---

@router.post("/", response_model=TreeResponse)
def save_tree(tree_in: TreeCreate):
    try:
        # Sử dụng .data[0] để lấy bản ghi đầu tiên vừa được insert
        response = supabase.table("trees").insert({
            "name": tree_in.name,
            "tree_data": tree_in.tree_data
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Không thể lưu dữ liệu")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[TreeResponse])
def list_trees():
    try:
        # Lấy toàn bộ danh sách cây đã lưu xếp theo thời gian mới nhất
        response = supabase.table("trees").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{tree_id}", response_model=TreeResponse)
def get_tree(tree_id: str):
    try:
        response = supabase.table("trees").select("*").eq("id", tree_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy cây")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))