# LoadingOverlay Component - Hướng dẫn sử dụng

## Tổng quan
`LoadingOverlay` là một component hiển thị màn hình phủ toàn màn hình với spinner animation khi có các tác vụ đang xử lý. Component này giúp cải thiện trải nghiệm người dùng bằng cách hiển thị trạng thái loading một cách trực quan.

## Cấu trúc Component

### LoadingOverlay.tsx
```tsx
import { LoadingOverlay, useLoadingOverlay } from '@/components/ui/LoadingOverlay';
```

### Props
- `isVisible: boolean` - Hiển thị/ẩn overlay
- `message?: string` - Thông báo hiển thị (mặc định: "Đang xử lý...")
- `className?: string` - CSS class tùy chỉnh

## Hook useLoadingOverlay

### Cách sử dụng cơ bản
```tsx
const { isLoading, loadingMessage, showLoading, hideLoading, withLoading } = useLoadingOverlay();
```

### Các phương thức

#### 1. `showLoading(message?: string)`
Hiển thị overlay với thông báo tùy chỉnh
```tsx
showLoading("Đang tải dữ liệu...");
```

#### 2. `hideLoading()`
Ẩn overlay
```tsx
hideLoading();
```

#### 3. `withLoading(asyncFn, message?)`
Wrapper cho async function, tự động hiển thị/ẩn loading
```tsx
await withLoading(async () => {
  // API call hoặc xử lý async
  const result = await api.get('/data');
  return result;
}, "Đang tải dữ liệu...");
```

## Các trường hợp sử dụng

### 1. Submit Form/Test
```tsx
const handleSubmit = async () => {
  await withLoading(async () => {
    // Xử lý submit
    await submitTest();
    // Chuyển trang
    navigate('/results');
  }, "Đang chấm điểm bài thi...");
};
```

### 2. Navigation với Loading
```tsx
const handleNavigate = () => {
  showLoading("Đang chuyển trang...");
  setTimeout(() => {
    window.location.href = '/new-page';
  }, 500);
};
```

### 3. API Calls
```tsx
const fetchData = async () => {
  await withLoading(async () => {
    const response = await api.get('/data');
    setData(response.data);
  }, "Đang tải dữ liệu...");
};
```

### 4. File Upload
```tsx
const handleUpload = async (file: File) => {
  await withLoading(async () => {
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/upload', formData);
  }, "Đang tải lên file...");
};
```

## Tích hợp vào Component

### 1. Import và khởi tạo
```tsx
import { LoadingOverlay, useLoadingOverlay } from '@/components/ui/LoadingOverlay';

export function MyComponent() {
  const { isLoading, loadingMessage, showLoading, withLoading } = useLoadingOverlay();
  
  // Component logic...
  
  return (
    <div>
      {/* Component content */}
      
      {/* Loading Overlay - luôn đặt cuối cùng */}
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </div>
  );
}
```

### 2. Sử dụng trong Event Handlers
```tsx
const handleImportantAction = async () => {
  await withLoading(async () => {
    // Thực hiện tác vụ quan trọng
    await performImportantTask();
  }, "Đang xử lý tác vụ quan trọng...");
};
```

## Best Practices

### 1. Luôn đặt LoadingOverlay cuối cùng
```tsx
return (
  <div>
    {/* Content */}
    <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
  </div>
);
```

### 2. Sử dụng thông báo có ý nghĩa
```tsx
// ✅ Tốt
showLoading("Đang lưu bài thi...");
showLoading("Đang chuyển đến trang kết quả...");

// ❌ Không tốt
showLoading("Loading...");
showLoading("Please wait...");
```

### 3. Sử dụng withLoading cho async operations
```tsx
// ✅ Tốt - tự động quản lý loading state
await withLoading(async () => {
  await api.post('/submit');
}, "Đang gửi bài thi...");

// ❌ Không tốt - phải quản lý thủ công
showLoading("Đang gửi...");
try {
  await api.post('/submit');
} finally {
  hideLoading();
}
```

### 4. Thêm delay cho UX tốt hơn
```tsx
await withLoading(async () => {
  await api.post('/submit');
  // Thêm delay nhỏ để người dùng thấy loading
  await new Promise(resolve => setTimeout(resolve, 500));
}, "Đang xử lý...");
```

## Animation Details

### Spinner Animation
- **Outer ring**: Xoay liên tục với `animate-spin`
- **Inner ring**: Pulse effect với `animate-pulse`
- **Dots**: Bounce animation với delay khác nhau

### CSS Classes sử dụng
- `animate-spin`: Xoay spinner
- `animate-pulse`: Pulse effect
- `animate-bounce`: Bounce dots
- `backdrop-blur-sm`: Blur background
- `bg-black/50`: Semi-transparent overlay

## Troubleshooting

### Loading không hiển thị
- Kiểm tra `isVisible={isLoading}` có đúng không
- Đảm bảo LoadingOverlay được đặt cuối cùng trong JSX

### Loading không ẩn
- Kiểm tra có gọi `hideLoading()` hoặc sử dụng `withLoading()` không
- Kiểm tra async function có throw error không

### Performance
- LoadingOverlay sử dụng `fixed` positioning nên không ảnh hưởng layout
- Animation được optimize với CSS transforms
- Component chỉ render khi `isVisible={true}`
