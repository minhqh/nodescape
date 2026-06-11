import { useState } from 'react';
import TreeCanvas from './components/Tree/TreeCanvas';
import type { TreeNode } from './types/tree.types';

function App() {
  const [treeState, setTreeState] = useState<TreeNode | null>(null);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLoadMockTree = () => {
    const mockTree: TreeNode = {
      value: 50,
      left: {
        value: 30,
        left: { value: 20, left: null, right: null },
        right: { value: 40, left: null, right: null }
      },
      right: {
        value: 70,
        left: { value: 60, left: null, right: null },
        right: { value: 80, left: null, right: null }
      }
    };
    setTreeState(mockTree);
  };

  // Hàm tạo độ trễ cho Animation
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Logic chạy Animation duyệt cây
  const handleTraverse = async (type: 'in' | 'pre' | 'post') => {
    if (!treeState || isAnimating) return;
    
    setIsAnimating(true);
    const path: number[] = [];

    // Thuật toán đệ quy lấy mảng kết quả
    const traverse = (node: TreeNode | null) => {
      if (!node) return;
      if (type === 'pre') path.push(node.value);
      traverse(node.left);
      if (type === 'in') path.push(node.value);
      traverse(node.right);
      if (type === 'post') path.push(node.value);
    };

    traverse(treeState);

    // Chạy vòng lặp để highlight từng node
    for (const val of path) {
      setActiveNode(val);
      await sleep(600); // Dừng 0.6s ở mỗi node
    }
    
    setActiveNode(null); // Tắt highlight khi chạy xong
    setIsAnimating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Nodescape</h1>
          <p className="text-slate-500 mt-2">Trình mô phỏng Cây Nhị Phân Trực Quan</p>
        </header>

        {/* Khung Control Panel */}
        <div className="flex flex-wrap gap-4 justify-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={handleLoadMockTree}
            disabled={isAnimating}
            className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 transition"
          >
            Tải Cây Mẫu
          </button>
          
          <div className="w-px bg-slate-300 mx-2"></div> {/* Đường kẻ dọc chia cắt */}

          <button 
            onClick={() => handleTraverse('pre')}
            disabled={!treeState || isAnimating}
            className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            Pre-order
          </button>
          <button 
            onClick={() => handleTraverse('in')}
            disabled={!treeState || isAnimating}
            className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            In-order
          </button>
          <button 
            onClick={() => handleTraverse('post')}
            disabled={!treeState || isAnimating}
            className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            Post-order
          </button>

          <div className="w-px bg-slate-300 mx-2"></div>

          <button 
            onClick={() => setTreeState(null)}
            disabled={isAnimating}
            className="px-4 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 disabled:opacity-50 transition"
          >
            Xóa Cây
          </button>
        </div>

        {/* Khung hiển thị Cây */}
        <TreeCanvas data={treeState} activeNode={activeNode} />

      </div>
    </div>
  );
}

export default App;