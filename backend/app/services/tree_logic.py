from typing import Optional, List, Dict, Any

class Node:
    def __init__(self, value: int):
        self.value = value
        self.left: Optional['Node'] = None
        self.right: Optional['Node'] = None

    def to_dict(self) -> Dict[str, Any]:
        """Chuyển đổi node thành dictionary để ném thẳng qua API cho React"""
        return {
            "value": self.value,
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None
        }

class BinarySearchTree:
    def __init__(self):
        self.root: Optional['Node'] = None
    
    def insert(self, value: int):
        if not self.root:
            self.root = Node(value)
            return
        self._insert_recursive(self.root, value)

    def _insert_recursive(self, current: Node, value: int):
        if value < current.value:
            if current.left is None:
                current.left = Node(value)
            else:
                self._insert_recursive(current.left, value)
        elif value > current.value:
            if current.right is None:
                current.right = Node(value)
            else:
                self._insert_recursive(current.right, value)

    def inorder(self) -> List[int]:
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, current: Optional['Node'], result: List[int]):
        if current:
            self._inorder_recursive(current.left, result)
            result.append(current.value)
            self._inorder_recursive(current.right, result)
    
    def preorder(self) -> List[int]:
        result = []
        self._preorder_recursive(self.root, result)
        return result

    def _preorder_recursive(self, current: Optional[Node], result: List[int]):
        if current:
            result.append(current.value)
            self._preorder_recursive(current.left, result)
            self._preorder_recursive(current.right, result)

    def postorder(self) -> List[int]:
        result = []
        self._postorder_recursive(self.root, result)
        return result

    def _postorder_recursive(self, current: Optional[Node], result: List[int]):
        if current:
            self._postorder_recursive(current.left, result)
            self._postorder_recursive(current.right, result)
            result.append(current.value)

    def delete(self, value: int):
        self.root = self._delete_recursive(self.root, value)

    def _delete_recursive(self, current: Optional[Node], value: int) -> Optional[Node]:
        if current is None:
            return None

        if value < current.value:
            current.left = self._delete_recursive(current.left, value)
        elif value > current.value:
            current.right = self._delete_recursive(current.right, value)
        else:
            # Case 1: Node lá (không có con) hoặc Case 2: Chỉ có 1 con
            if current.left is None:
                return current.right
            elif current.right is None:
                return current.left

            # Case 3: Có 2 con. Tìm node nhỏ nhất ở nhánh phải để thay thế
            temp = self._get_min_value_node(current.right)
            current.value = temp.value
            current.right = self._delete_recursive(current.right, temp.value)

        return current

    def _get_min_value_node(self, node: Node) -> Node:
        current = node
        while current.left is not None:
            current = current.left
        return current

    def get_tree_state(self) -> Optional[Dict[str, Any]]:
        return self.root.to_dict() if self.root else None