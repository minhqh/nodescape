# Cấu trúc thư mục

``` bash
nodescape/
├── .github/
│   └── workflows/
│       ├── backend-test.yml       # CI/CD tự động chạy pytest khi push
│       └── frontend-lint.yml      # CI/CD check lỗi cú pháp frontend
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # Điểm khởi chạy FastAPI ứng dụng
│   │   ├── core/                  # Cấu hình hệ thống, bảo mật, biến môi trường
│   │   │   └── config.py
│   │   ├── api/                   # Định nghĩa các Route (Endpoints)
│   │   │   ├── v1/
│   │   │   │   ├── auth.py        # Middleware/Route xử lý JWT/Supabase Auth
│   │   │   │   ├── tree.py        # API lưu/tải/thao tác cây
│   │   │   │   └── ai.py          # API gọi LLMs để parse câu lệnh tự nhiên
│   │   │   └── router.py
│   │   ├── models/                # Thực thể cơ sở dữ liệu (PostgreSQL/Supabase)
│   │   │   └── tree.py
│   │   ├── schemas/               # Pydantic Schemas định nghĩa kiểu dữ liệu Input/Output
│   │   │   ├── tree.py
│   │   │   └── ai.py
│   │   └── services/              # Chứa Logic cốt lõi (Core Logic)
│   │       ├── tree_logic.py      # Thuật toán BST, AVL, Duyệt cây (In/Pre/Post)
│   │       └── llm_service.py     # Logic kết nối API LLM
│   ├── tests/                     # Thư mục kiểm thử với Pytest
│   │   ├── conftest.py
│   │   ├── test_tree_logic.py     # Test các thuật toán thêm/xóa/duyệt cây
│   │   └── test_api.py
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── assets/                # Hình ảnh, icons, styles dùng chung
│   │   ├── components/            # Các component tái sử dụng (Button, Modal, Navbar)
│   │   │   └── common/
│   │   ├── features/              # Chia theo tính năng chính của ứng dụng
│   │   │   ├── auth/              # Logic đăng nhập/đăng ký với Supabase
│   │   │   ├── tree-simulator/    # Logic lõi mô phỏng cây
│   │   │   │   ├── components/    # Canvas, Node, ControlPanel, SpeedSlider
│   │   │   │   ├── hooks/         # useTreeState.ts (Quản lý trạng thái cây)
│   │   │   │   └── utils/         # Hàm bổ trợ tính toán tọa độ vẽ cây
│   │   │   └── dashboard/         # Quản lý danh sách các cây đã lưu
│   │   ├── services/              # API Client (Axios/Fetch) kết nối với Backend
│   │   │   ├── api.ts
│   │   │   └── supabase.ts        # Supabase Client cho Frontend Auth
│   │   ├── types/                 # Định nghĩa các interface TypeScript
│   │   │   └── tree.types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml             # Khởi chạy cả FE và BE chỉ với 1 câu lệnh
├── .gitignore
└── README.md
```

## Task

Task 1: Khởi Tạo Môi Trường & Mã Nguồn Thô (Mục tiêu: "Hello World")
Tạo repo Git, khởi tạo cấu trúc thư mục như trên.

Backend: Khởi tạo FastAPI, viết một endpoint trả về {"message": "Hello Backend"}. Tạo Dockerfile.

Frontend: Khởi tạo dự án React + TypeScript bằng Vite. Tạo một giao diện trống. Tạo Dockerfile.

Docker Compose: Viết file docker-compose.yml ở thư mục root để gom cả 2 dịch vụ lại, đảm bảo chạy docker compose up là cả FE và BE đều lên.

Task 2: Hiện Thực Logic Cây Ở Backend & Viết Test (Mục tiêu: Thuật toán chuẩn 100%)
Tại backend/app/services/tree_logic.py, định nghĩa class Node và BinarySearchTree.

Viết các hàm: insert, delete (xử lý đủ 3 trường hợp xóa node), get_parent, get_children, và các hàm duyệt cây (inorder, preorder, postorder).

Bổ sung logic chuyển đổi chế độ Cây cân bằng (AVL - tự động xoay Left/Right khi mất cân bằng).

Quan trọng: Viết test bằng pytest trong thư mục tests/. Test kỹ các case biên (xóa node gốc, thêm trùng giá trị, cây rỗng) để đảm bảo backend hoạt động không một lỗi nhỏ.

Task 3: Kết Nối Supabase & Quản Lý Thực Thể (Mục tiêu: Lưu trữ dữ liệu)
Tạo một project trên Supabase, lấy thông tin kết nối PostgreSQL.

Thiết kế bảng trees lưu thông tin cây của người dùng (có thể dùng trường kiểu JSONB hoặc lưu danh sách quan hệ node).

Tích hợp Supabase Auth vào Frontend để người dùng có thể Đăng ký / Đăng nhập. Kiếm tra token JWT ở Backend để đảm bảo user chỉ được quyền sửa/xóa cây của chính mình.

Task 4: Trực Quan Hóa Cây Trên React (Mục tiêu: UI hiển thị cây tĩnh)
Xây dựng UI cho khu vực giả lập (Workspace). Bạn có thể tự dựng hệ thống vẽ bằng SVG/HTML Canvas thuần hoặc dùng thư viện hỗ trợ như D3.js/React Flow để tính toán tọa độ phân cấp của các node.

Kết nối Frontend với API của Backend để khi ấn nút "Thêm Node" hoặc "Xóa Node", một request gửi lên Backend, nhận lại cấu trúc cây mới và render lại màn hình.

Task 5: Animation Tương Tác & Tối Ưu UX (Mục tiêu: Tăng trải nghiệm)
Xây dựng tính năng duyệt cây từng bước: Khi bấm "Duyệt In-order", sử dụng hàm setTimeout hoặc setInterval trong React để kích hoạt hiệu ứng highlight tuần tự các node theo mảng kết quả trả về từ Backend.

Thêm thanh trượt (Speed Slider) để thay đổi thời gian delay giữa các bước duyệt cây.

Bổ sung sự kiện onClick vào từng Node để hiển thị thông tin chi tiết (Node cha là ai, Node con trái/phải là ai).

Task 6: Tích Hợp AI & Thiết Lập CI/CD (Mục tiêu: Tính năng nâng cao)
AI Feature: Thiết kế một ô input nhập văn bản tự nhiên. Khi người dùng nhập: "Tạo cho tôi một cây nhị phân từ mảng các số nguyên từ 1 đến 10", Frontend gửi chuỗi này lên Backend. Backend gọi API LLM (bằng cách định nghĩa Prompt ép cấu trúc đầu ra trả về dạng JSON chuẩn như mảng số hoặc cấu trúc cây), sau đó nạp dữ liệu này vào hệ thống để vẽ lên màn hình.

CI/CD: Viết mã GitHub Actions trong .github/workflows/ để mỗi khi bạn push code mới lên GitHub, hệ thống tự động chạy pytest. Nếu tất cả test pass, code mới sẵn sàng để deploy lên Host (như Render).
