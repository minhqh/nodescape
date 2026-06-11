import React from 'react';
import type { TreeNode } from '../../types/tree.types';

interface TreeCanvasProps {
  data: TreeNode | null;
  activeNode?: number | null; // Bổ sung prop này để nhận biết node đang active
}

const TreeCanvas: React.FC<TreeCanvasProps> = ({ data, activeNode }) => {
  if (!data) return <div className="text-center p-10 text-slate-500">Cây đang rỗng. Hãy thêm Node!</div>;

  const NODE_RADIUS = 20;
  const LEVEL_HEIGHT = 80;
  
  const renderNode = (
    node: TreeNode,
    x: number,
    y: number,
    level: number,
    parentX?: number,
    parentY?: number
  ): React.ReactNode => {
    const horizontalSpacing = 150 / level;
    
    // Kiểm tra xem node này có đang được duyệt qua không
    const isHighlight = node.value === activeNode;
    const nodeColor = isHighlight ? "#f59e0b" : "#3b82f6"; // Cam (Highlight) hoặc Xanh (Bình thường)
    const strokeColor = isHighlight ? "#b45309" : "#1d4ed8";

    return (
      <g key={`${x}-${y}-${node.value}`} className="transition-all duration-300">
        {parentX !== undefined && parentY !== undefined && (
          <line
            x1={parentX}
            y1={parentY + NODE_RADIUS}
            x2={x}
            y2={y - NODE_RADIUS}
            stroke="#cbd5e1"
            strokeWidth="2"
          />
        )}

        {node.left && renderNode(node.left, x - horizontalSpacing, y + LEVEL_HEIGHT, level + 1, x, y)}
        {node.right && renderNode(node.right, x + horizontalSpacing, y + LEVEL_HEIGHT, level + 1, x, y)}

        {/* Hiệu ứng chuyển màu mượt mà với transition */}
        <circle 
          cx={x} 
          cy={y} 
          r={NODE_RADIUS} 
          fill={nodeColor} 
          stroke={strokeColor} 
          strokeWidth="2" 
          style={{ transition: "fill 0.3s ease" }}
        />
        <text x={x} y={y} textAnchor="middle" dy=".3em" fill="white" fontSize="14px" fontWeight="bold">
          {node.value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-[500px] bg-white border border-slate-200 rounded-xl shadow-sm overflow-auto flex justify-center pt-10">
      <svg width="800" height="600">
        {renderNode(data, 400, 40, 1)}
      </svg>
    </div>
  );
};

export default TreeCanvas;