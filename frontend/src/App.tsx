import { useState } from 'react';
import axios from 'axios';
import TreeCanvas from './components/Tree/TreeCanvas';
import type { TreeNode } from './types/tree.types';

function App() {
  const [treeState, setTreeState] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Lưu trữ danh sách kết quả duyệt cây để hiển thị ra màn hình
  const [traversalResult, setTraversalResult] = useState<{name: string, data: number[]} | null>(null);

  // Hàm gọi API xử lý cấu trúc cây ở Backend
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

      // Cập nhật lại cây từ dữ liệu Backend trả về
      setTreeState(response.data.tree_data);
      setInputValue(''); // Xóa trống ô input
      setTraversalResult(null); // Reset kết quả duyệt cũ khi cấu trúc cây thay đổi
    } catch (error) {
      console.error("Lỗi khi kết nối với Backend:", error);
      alert("Không thể kết nối đến Backend!");
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Chạy hiệu ứng highlight dựa trên dữ liệu đã tính toán sẵn từ Backend
  const handleTraverseAnimation = async (type: 'pre' | 'in' | 'post') => {
    if (!treeState || isAnimating) return;

    try {
      setIsAnimating(true);
      // Gọi một request rỗng lên chỉ để lấy mảng thứ tự duyệt chuẩn xác từ Backend
      const response = await axios.post('http://localhost:8000/api/v1/trees/process-action', {
        action: 'insert',
        value: 0, // Giá trị ảo không ảnh hưởng vì không mutate cấu trúc
        current_tree: treeState
      });

      let path: number[] = [];
      let label = "";
      if (type === 'pre') { path = response.data.preorder; label = "Pre-order"; }
      if (type === 'in') { path = response.data.inorder; label = "In-order"; }
      if (type === 'post') { path = response.data.postorder; label = "Post-order"; }

      setTraversalResult({ name: label, data: path });

      // Chạy hiệu ứng sáng đèn từng node
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
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight">Nodescape</h1>
          <p className="text-slate-500 mt-2">Trình mô phỏng Cây Nhị Phân Kết Nối API Thật</p>
        </header>

        {/* Bảng điều khiển Thêm/Xóa Node */}
        <div className="flex flex-wrap gap-4 justify-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 items-center">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isAnimating}
            placeholder="Nhập giá trị số..."
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 text-center"
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

          <div className="w-px h-8 bg-slate-200 mx-2"></div>

          <button
            onClick={() => handleTraverseAnimation('pre')}
            disabled={!treeState || isAnimating}
            className="px-3 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            Duyệt Pre-order
          </button>
          <button
            onClick={() => handleTraverseAnimation('in')}
            disabled={!treeState || isAnimating}
            className="px-3 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            Duyệt In-order
          </button>
          <button
            onClick={() => handleTraverseAnimation('post')}
            disabled={!treeState || isAnimating}
            className="px-3 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition"
          >
            Duyệt Post-order
          </button>

          <button
            onClick={() => { setTreeState(null); setTraversalResult(null); }}
            disabled={isAnimating}
            className="px-4 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 disabled:opacity-50 transition ml-auto"
          >
            Xóa Toàn Bộ
          </button>
        </div>

        {/* Hiển thị kết quả mảng duyệt dưới dạng text trực quan */}
        {traversalResult && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="font-bold text-slate-600 mr-2">{traversalResult.name}:</span>
            <span className="text-lg font-mono tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
              {traversalResult.data.join(' → ')}
            </span>
          </div>
        )}

        {/* Khung hiển thị SVG Canvas */}
        <TreeCanvas data={treeState} activeNode={activeNode} />

      </div>
    </div>
  );
}

export default App;