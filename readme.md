npm init -y
npm install mongodb

node schema-analyzer.js


Script này sẽ:
Kết nối tới MongoDB cluster với URL đã cấu hình
Phân tích tất cả collections trong database "promotion"
Tạo thư mục "schema_output" trong cùng thư mục với script
Xuất kết quả phân tích ra file JSON trong thư mục "schema_output"
Lưu ý:
Đảm bảo MongoDB URL trong script là chính xác
Cần có quyền truy cập vào database
Máy tính cần có Node.js đã được cài đặt
Thư mục chạy script cần có quyền ghi file để tạo output
Kết quả sẽ được lưu trong file: ./schema_output/schema_promotion.json
