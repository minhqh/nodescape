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
    
from typing import Optional, Dict, Any
from pydantic import BaseModel
from app.services.tree_logic import BinarySearchTree, Node

# Định nghĩa cấu trúc request nhận từ Frontend
class TreeActionRequest(BaseModel):
    action: str  # "insert" hoặc "delete"
    value: int
    current_tree: Optional[Dict[str, Any]] = None

# Hàm helper đệ quy để dựng lại đối tượng Node từ JSON nhận được của Frontend
def deserialize_tree(d: Optional[Dict[str, Any]]) -> Optional[Node]:
    if not d:
        return None
    node = Node(d["value"])
    node.left = deserialize_tree(d.get("left"))
    node.right = deserialize_tree(d.get("right"))
    return node

@router.post("/process-action")
def process_tree_action(payload: TreeActionRequest):
    # 1. Khởi tạo thực thể BST mới
    tree = BinarySearchTree()
    
    # 2. Nếu Frontend có gửi cây hiện tại lên, dựng lại cây đó ở Backend
    if payload.current_tree:
        tree.root = deserialize_tree(payload.current_tree)
    
    # 3. Thực hiện hành động tương ứng bằng Core Logic đã viết ở Task 2
    if payload.action == "insert":
        tree.insert(payload.value)
    elif payload.action == "delete":
        tree.delete(payload.value)
    else:
        raise HTTPException(status_code=400, detail="Hành động không hợp lệ")
        
    # 4. Trả về cấu trúc cây mới cùng với kết quả duyệt cây để FE cập nhật trạng thái
    return {
        "tree_data": tree.get_tree_state(),
        "inorder": tree.inorder(),
        "preorder": tree.preorder(),
        "postorder": tree.postorder()
    }