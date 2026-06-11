from pydantic import BaseModel
from typing import Dict, Any

class TreeCreate(BaseModel):
    name: str
    tree_data: Dict[str, Any]  # Nhận cục JSONB chứa trạng thái cây

class TreeResponse(BaseModel):
    id: str
    name: str
    tree_data: Dict[str, Any]