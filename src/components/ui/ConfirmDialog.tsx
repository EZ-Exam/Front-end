import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  repliesCount?: number;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger',
  repliesCount = 0
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-blue-500" />;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">{message}</p>
          
          {repliesCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Cảnh báo
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Comment này có <strong>{repliesCount} phản hồi</strong>. 
                Việc xóa có thể ảnh hưởng đến các phản hồi này.
              </p>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 ${getButtonStyle()}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
