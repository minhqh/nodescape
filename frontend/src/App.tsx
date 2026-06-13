import { useState, useEffect } from 'react';
import axios from 'axios';
import TreeCanvas from './components/Tree/TreeCanvas';
import type { TreeNode } from './types/tree.types';

interface SavedTreeItem {
  id: string;
  name: string;
  tree_data: TreeNode;
}

function App() {
  const [treeState, setTreeState] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [treeName, setTreeName] = useState<string>('');
  const [savedTrees, setSavedTrees] = useState<SavedTreeItem[]>([]);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [traversalResult, setTraversalResult] = useState<{name: string, data: number[]} | null>(null);
  
  // Các state dành cho tính năng AI
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchSavedTrees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/trees/');
      setSavedTrees(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSavedTrees();
  }, []);

  const handleTreeAction = async (action: 'insert' | 'delete') => {
    const value = parseInt(inputValue);
    if (isNaN(value)) { alert("Vui lòng nhập số nguyên!"); return; }
    try {
      const response = await axios.post('http://localhost:8000/api/v1/trees/process-action', {
        action, value, current_tree: treeState
      });
      setTreeState(response.data.tree_data);
      setInputValue('');
      setTraversalResult(null);
    } catch (error) { console.error(error); }
  };

  const handleSaveToDatabase = async () => {
    if (!treeState || !treeName.trim()) { alert("Vui lòng kiểm tra lại cây hoặc tên cây!"); return; }
    try {
      await axios.post('http://localhost:8000/api/v1/trees/', { name: treeName, tree_data: treeState });
      alert("Đã lưu cây thành công!");
      setTreeName('');
      fetchSavedTrees();
    } catch (error) { alert("Lưu thất bại!"); }
  };

  // Hàm xử lý XÓA cây khỏi Database
  const handleDeleteTree = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click kích hoạt việc tải cây
    if (!window.confirm("Bạn có chắc chắn muốn xóa cây này khỏi bộ nhớ?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/trees/${id}`);
      fetchSavedTrees();
      alert("Đã xóa cây!");
    } catch (error) { alert("Xóa thất bại!"); }
  };

  // Hàm xử lý gọi AI sinh cây
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    try {
      setIsAiLoading(true);
      const response = await axios.post('http://localhost:8000/api/v1/trees/ai-generate', {
        prompt: aiPrompt
      });
      setTreeState(response.data.tree_data);
      setAiPrompt('');
      setTraversalResult(null);
      alert(`AI đã sinh mảng số thành công: [${response.data.ai_generated_array.join(', ')}]`);
    } catch (error) {
      alert("AI không hiểu hoặc xử lý lỗi, hãy thử ra lệnh rõ ràng hơn!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleTraverseAnimation = async (type: 'pre' | 'in' | 'post') => {
    if (!treeState || isAnimating) return;
    try {
      setIsAnimating(true);
      const response = await axios.post('http://localhost:8000/api/v1/trees/process-action', {
        action: 'insert', value: 0, current_tree: treeState
      });
      let path: number[] = [];
      let label = "";
      if (type === 'pre') { path = response.data.preorder; label = "Pre-order"; }
      if (type === 'in') { path = response.data.inorder; label = "In-order"; }
      if (type === 'post') { path = response.data.postorder; label = "Post-order"; }

      setTraversalResult({ name: label, data: path });
      for (const val of path) { setActiveNode(val); await sleep(600); }
    } catch (e) { console.error(e); } finally { setActiveNode(null); setIsAnimating(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-600">Nodescape Pro</h1>
          <p className="text-slate-500 mt-2">Hệ thống mô phỏng Cây Nhị Phân thông minh tích hợp AI & Database</p>
        </header>

        {/* 1. THANH ĐIỀU KHIỂN TẠO CÂY BẰNG AI */}
        <div className="flex gap-3 bg-purple-50 p-4 rounded-xl border border-purple-100 items-center shadow-sm">
          <span className="font-bold text-purple-800 text-sm whitespace-nowrap">🤖 Trợ lý AI:</span>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={isAiLoading || isAnimating}
            placeholder="Ví dụ: Tạo cây BST cân bằng từ 1 đến 7, hoặc tạo cây ngẫu nhiên 5 node..."
            className="flex-1 px-4 py-2 border border-purple-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleAIGenerate}
            disabled={isAiLoading || isAnimating || !aiPrompt.trim()}
            className="px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition shadow-sm"
          >
            {isAiLoading ? "Đang suy nghĩ..." : "Sinh Cây Bằng AI"}
          </button>
        </div>

        {/* 2. BẢNG ĐIỀU KHIỂN THỦ CÔNG */}
        <div className="flex flex-wrap gap-3 justify-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 items-center">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isAnimating}
            placeholder="Nhập số..."
            className="px-3 py-2 border border-slate-300 rounded-lg w-28 text-center text-sm"
          />
          <button onClick={() => handleTreeAction('insert')} disabled={isAnimating} className="px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition">Thêm Node</button>
          <button onClick={() => handleTreeAction('delete')} disabled={!treeState || isAnimating} className="px-4 py-2 bg-amber-500 text-white font-semibold text-sm rounded-lg hover:bg-amber-600 transition">Xóa Node</button>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <button onClick={() => handleTraverseAnimation('pre')} disabled={!treeState || isAnimating} className="px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition">Pre-order</button>
          <button onClick={() => handleTraverseAnimation('in')} disabled={!treeState || isAnimating} className="px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition">In-order</button>
          <button onClick={() => handleTraverseAnimation('post')} disabled={!treeState || isAnimating} className="px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition">Post-order</button>

          <button onClick={() => { setTreeState(null); setTraversalResult(null); }} disabled={isAnimating} className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 ml-auto">Xóa Sạch</button>
        </div>

        {/* 3. KHU VỰC LƯU DATABASE */}
        <div className="flex gap-4 justify-center bg-blue-50 p-3 rounded-xl border border-blue-100 items-center shadow-sm">
          <span className="font-semibold text-blue-800 text-sm">Lưu cây hiện tại:</span>
          <input
            type="text"
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
            disabled={!treeState || isAnimating}
            placeholder="Đặt tên cho cây này..."
            className="px-4 py-1.5 border border-blue-200 rounded-lg w-64 text-sm bg-white"
          />
          <button onClick={handleSaveToDatabase} disabled={!treeState || isAnimating} className="px-4 py-1.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition">Lưu Lại</button>
        </div>

        {/* HIỂN THỊ KẾT QUẢ DUYỆT */}
        {traversalResult && (
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="font-bold text-slate-600 text-sm mr-2">{traversalResult.name}:</span>
            <span className="text-md font-mono tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
              {traversalResult.data.join(' → ')}
            </span>
          </div>
        )}

        {/* BỐ CỤC KHÔNG GIAN LÀM VIỆC */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <TreeCanvas data={treeState} activeNode={activeNode} />
          </div>

          {/* KHO LƯU TRỮ CÓ NÚT XÓA */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
            <h2 className="font-bold text-md text-slate-700 border-b pb-2 mb-3">Kho Lưu Trữ Cây</h2>
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {savedTrees.length === 0 ? (
                <p className="text-xs text-slate-400 text-center pt-10">Chưa có cây nào được lưu.</p>
              ) : (
                savedTrees.map((tree) => (
                  <div 
                    key={tree.id}
                    onClick={() => { setTreeState(tree.tree_data); setTraversalResult(null); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer group"
                  >
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[140px]" title={tree.name}>
                      🌳 {tree.name}
                    </span>
                    <button
                      onClick={(e) => handleDeleteTree(tree.id, e)}
                      disabled={isAnimating}
                      className="text-slate-400 hover:text-red-500 text-xs p-1 rounded transition opacity-0 group-hover:opacity-100"
                      title="Xóa cây này"
                    >
                      ❌
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;