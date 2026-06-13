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
  const [treeName, setTreeName] = useState<string>(''); // Lưu tên cây đang muốn đặt
  const [savedTrees, setSavedTrees] = useState<SavedTreeItem[]>([]); // Danh sách cây từ DB
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [traversalResult, setTraversalResult] = useState<{name: string, data: number[]} | null>(null);

  // Hàm lấy danh sách cây từ Database về
  const fetchSavedTrees = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/trees/');
      setSavedTrees(response.data);
    } catch (error) {
      console.error("Không thể tải danh sách cây:", error);
    }
  };

  // Tự động tải danh sách cây khi ứng dụng vừa khởi chạy
  useEffect(() => {
    fetchSavedTrees();
  }, []);

  const handleTreeAction = async (action: 'insert' | 'delete') => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      alert("Vui lòng nhập một số nguyên hợp lệ!");
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/v1/trees/process-action', {
        action: action,
        value: value,
        current_tree: treeState
      });
      setTreeState(response.data.tree_data);
      setInputValue('');
      setTraversalResult(null);
    } catch (error) {
      console.error(error);
    }
  };

  // Hàm xử lý lưu cấu trúc cây hiện tại xuống Database
  const handleSaveToDatabase = async () => {
    if (!treeState) {
      alert("Cây đang rỗng, không có gì để lưu!");
      return;
    }
    if (!treeName.trim()) {
      alert("Vui lòng nhập tên cho cây trước khi lưu!");
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/v1/trees/', {
        name: treeName,
        tree_data: treeState
      });
      alert("Đã lưu cây vào Database thành công!");
      setTreeName(''); // Xóa trống ô nhập tên
      fetchSavedTrees(); // Tải lại danh sách để cập nhật cây mới lên giao diện
    } catch (error) {
      console.error("Lỗi khi lưu cây:", error);
      alert("Lưu cây thất bại!");
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleTraverseAnimation = async (type: 'pre' | 'in' | 'post') => {
    if (!treeState || isAnimating) return;
    try {
      setIsAnimating(true);
      const response = await axios.post('http://localhost:8000/api/v1/trees/process-action', {
        action: 'insert',
        value: 0,
        current_tree: treeState
      });

      let path: number[] = [];
      let label = "";
      if (type === 'pre') { path = response.data.preorder; label = "Pre-order"; }
      if (type === 'in') { path = response.data.inorder; label = "In-order"; }
      if (type === 'post') { path = response.data.postorder; label = "Post-order"; }

      setTraversalResult({ name: label, data: path });

      for (const val of path) {
        setActiveNode(val);
        await sleep(600);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActiveNode(null);
      setIsAnimating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight">Nodescape</h1>
          <p className="text-slate-500 mt-2">Hệ thống mô phỏng cấu trúc cây liên thông Database</p>
        </header>

        {/* BẢNG ĐIỀU KHIỂN CHÍNH */}
        <div className="flex flex-wrap gap-4 justify-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 items-center">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isAnimating}
            placeholder="Nhập số..."
            className="px-4 py-2 border border-slate-300 rounded-lg w-32 text-center"
          />
          <button
            onClick={() => handleTreeAction('insert')}
            disabled={isAnimating}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Thêm Node
          </button>
          <button
            onClick={() => handleTreeAction('delete')}
            disabled={!treeState || isAnimating}
            className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
          >
            Xóa Node
          </button>

          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          <button onClick={() => handleTraverseAnimation('pre')} disabled={!treeState || isAnimating} className="px-3 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition">Pre-order</button>
          <button onClick={() => handleTraverseAnimation('in')} disabled={!treeState || isAnimating} className="px-3 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition">In-order</button>
          <button onClick={() => handleTraverseAnimation('post')} disabled={!treeState || isAnimating} className="px-3 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition">Post-order</button>

          <button
            onClick={() => { setTreeState(null); setTraversalResult(null); }}
            disabled={isAnimating}
            className="px-4 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 ml-auto"
          >
            Xóa Màn Hình
          </button>
        </div>

        {/* KHU VỰC LƯU XUỐNG DATABASE */}
        <div className="flex gap-4 justify-center bg-blue-50 p-4 rounded-xl border border-blue-100 items-center">
          <span className="font-semibold text-blue-800">Lưu cây hiện tại:</span>
          <input
            type="text"
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
            disabled={!treeState || isAnimating}
            placeholder="Đặt tên cho cây này..."
            className="px-4 py-2 border border-blue-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSaveToDatabase}
            disabled={!treeState || isAnimating}
            className="px-5 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 transition shadow-sm"
          >
            Lưu vào Database
          </button>
        </div>

        {traversalResult && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="font-bold text-slate-600 mr-2">{traversalResult.name}:</span>
            <span className="text-lg font-mono tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
              {traversalResult.data.join(' → ')}
            </span>
          </div>
        )}

        {/* BỐ CỤC HAI CỘT: CANVAS VÀ DANH SÁCH ĐÃ LƯU */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Cột chính hiển thị Cây (Chiếm 3/4 khoảng trống) */}
          <div className="lg:col-span-3">
            <TreeCanvas data={treeState} activeNode={activeNode} />
          </div>

          {/* Cột phụ hiển thị Danh sách cây đã lưu từ DB (Chiếm 1/4 khoảng trống) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
            <h2 className="font-bold text-lg text-slate-700 border-b pb-2 mb-3">Kho Lưu Trữ Cây</h2>
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {savedTrees.length === 0 ? (
                <p className="text-sm text-slate-400 text-center pt-10">Chưa có cây nào được lưu.</p>
              ) : (
                savedTrees.map((tree) => (
                  <button
                    key={tree.id}
                    onClick={() => { setTreeState(tree.tree_data); setTraversalResult(null); }}
                    disabled={isAnimating}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition block text-sm font-medium text-slate-700 truncate"
                    title={tree.name}
                  >
                    🌳 {tree.name}
                  </button>
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