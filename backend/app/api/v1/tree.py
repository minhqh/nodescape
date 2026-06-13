from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from app.core.config import settings
from app.schemas.tree import TreeCreate, TreeResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.services.tree_logic import BinarySearchTree, Node
import google.generativeai as genai
import json
import traceback

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

@router.delete("/{tree_id}")
def delete_tree(tree_id: str):
    try:
        response = supabase.table("trees").delete().eq("id", tree_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy cây để xóa")
        return {"message": "Đã xóa cây thành công", "deleted_id": tree_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Cấu hình Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

class AICreateRequest(BaseModel):
    prompt: str
    current_tree: Optional[Dict[str, Any]] = None

@router.post("/ai-generate")
def ai_generate_tree(payload: AICreateRequest):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # System Prompt ép cấu trúc đầu ra nghiêm ngặt
        system_instruction = (
            "Bạn là một trợ lý chuyên về Cấu trúc dữ liệu và Giải thuật. "
            "Nhiệm vụ của bạn là đọc yêu cầu của người dùng và chuyển đổi nó thành một mảng các số nguyên "
            "để tạo thành một Cây Nhị Phân Tìm Kiếm (BST). "
            "BẠN CHỈ ĐƯỢC PHÉP TRẢ VỀ ĐÚNG MỘT MẢNG JSON CHỨA CÁC SỐ NGUYÊN, KHÔNG ĐƯỢC GIẢI THÍCH, KHÔNG ĐƯỢC CHÈN CHỮ. "
            "Ví dụ nếu người dùng yêu cầu cây có các số từ 1 đến 5 cân bằng, hãy xếp mảng sao cho khi insert vào BST nó sẽ cân bằng, "
            "Ví dụ trả về: [3, 1, 2, 4, 5]. "
            "Nếu người dùng yêu cầu ngẫu nhiên, hãy tự sinh từ 5 đến 8 số nguyên ngẫu nhiên."
        )
        
        response = model.generate_content(f"{system_instruction}\n\nYêu cầu của người dùng: {payload.prompt}")
        
        # Parse chuỗi JSON trả về từ LLM thành mảng Python
        cleaned_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        numbers = json.loads(cleaned_text)
        
        if not isinstance(numbers, list):
            raise ValueError("AI không trả về một mảng hợp lệ")
            
        # Dựng cây từ mảng số do AI sinh ra
        tree = BinarySearchTree()
        for val in numbers:
            tree.insert(val)
            
        return {
            "tree_data": tree.get_tree_state(),
            "ai_generated_array": numbers
        }
    except Exception as e:
        # IN LỖI CHI TIẾT RA TERMINAL DOCKER
        print(f"\n--- LỖI AI GENERATE ---")
        print(f"Chi tiết lỗi: {str(e)}")
        traceback.print_exc() 
        print(f"-----------------------\n")
        raise HTTPException(status_code=400, detail=f"AI xử lý thất bại: {str(e)}")