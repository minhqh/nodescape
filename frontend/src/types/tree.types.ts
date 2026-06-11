export interface TreeNode {
    value: number,
    left: TreeNode | null;
    right: TreeNode | null;
}

export interface TreeData {
  id?: string;
  name: string;
  tree_data: TreeNode;
}