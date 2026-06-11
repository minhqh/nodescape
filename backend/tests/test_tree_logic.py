from app.services.tree_logic import BinarySearchTree

def test_insert_and_inorder():
    tree = BinarySearchTree()
    for val in [50, 30, 70, 20, 40, 60, 80]:
        tree.insert(val)
    
    # In-order của BST luôn trả về mảng tăng dần
    assert tree.inorder() == [20, 30, 40, 50, 60, 70, 80]

def test_preorder_and_postorder():
    tree = BinarySearchTree()
    for val in [50, 30, 70]:
        tree.insert(val)
        
    assert tree.preorder() == [50, 30, 70]
    assert tree.postorder() == [30, 70, 50]

def test_delete_leaf_node():
    tree = BinarySearchTree()
    for val in [50, 30, 70]:
        tree.insert(val)
    
    tree.delete(30)
    assert tree.inorder() == [50, 70]

def test_delete_node_with_two_children():
    tree = BinarySearchTree()
    for val in [50, 30, 70, 20, 40]:
        tree.insert(val)
    
    # Xóa 30, node 40 (nhỏ nhất bên phải của 30) sẽ thế chỗ
    tree.delete(30)
    assert tree.inorder() == [20, 40, 50, 70]
    assert tree.get_tree_state()["left"]["value"] == 40