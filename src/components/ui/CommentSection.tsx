import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Reply, 
  Trash2,
  Send,
  Loader2,
  Star,
  StarOff
} from 'lucide-react';
import { QuestionComment } from '@/types';
import axios from '@/services/axios';
import { ReplyForm } from './ReplyForm';
import { ConfirmDialog } from './ConfirmDialog';

interface CommentSectionProps {
  questionId: number;
}

export function CommentSection({ questionId }: CommentSectionProps) {
  const [comments, setComments] = useState<QuestionComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newCommentRating, setNewCommentRating] = useState(5);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyStates, setReplyStates] = useState<Record<number, { content: string; rating: number }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    commentId: number | null;
    hasReplies: boolean;
    repliesCount: number;
  }>({
    isOpen: false,
    commentId: null,
    hasReplies: false,
    repliesCount: 0
  });

  // console.log('🏠 CommentSection render:', { questionId, replyingTo, replyStates, commentsCount: comments.length });

  // Get user info from token
  const getUserInfoFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { userId: 1, role: 'user', roleId: 1 }; // fallback
      
      // Decode JWT token (simple base64 decode for payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userInfo = {
        userId: parseInt(payload.userId || payload.id || payload.sub || '1'), // Convert to number
        role: payload.role || payload.Role || 'user',
        roleId: parseInt(payload.roleId || payload.RoleId || '1') // Convert to number
      };
      
      return userInfo;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return { userId: 1, role: 'user', roleId: 1 }; // fallback if token is invalid
    }
  };

  const currentUser = getUserInfoFromToken();

  // Check if user can delete a comment
  const canDeleteComment = (comment: QuestionComment) => {
    // Admin có thể xóa tất cả comment (roleId khác 1, ví dụ: 2, 3...)
    if (currentUser.role === 'admin' || currentUser.role === 'Admin') {
      return true;
    }
    
    // User (roleId = 1) chỉ có thể xóa comment của chính mình
    return comment.userId === currentUser.userId;
  };

  useEffect(() => {
    fetchComments();
  }, [questionId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/question-comments/by-question/${questionId}`);
      console.log('Comments API Response:', response.data);
      
      // API already returns comments with replies nested, so we can use directly
      const comments = Array.isArray(response.data) ? response.data : 
                      Array.isArray(response.data?.items) ? response.data.items : [];
      
      console.log('Processed comments:', comments);
      setComments(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await axios.post('/question-comments', {
        questionId: questionId,
        userId: currentUser.userId,
        content: newComment.trim(),
        parentCommentId: null,
        rating: newCommentRating
      });
      
      console.log('Comment created:', response.data);
      
      // Refresh all comments to get updated data from server
      await fetchComments();
      
      setNewComment('');
      setNewCommentRating(5);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    const replyState = replyStates[parentId];
    if (!replyState?.content.trim()) return;

    try {
      setSubmitting(true);
      const response = await axios.post('/question-comments', {
        questionId: questionId,
        userId: currentUser.userId,
        content: replyState.content.trim(),
        parentCommentId: parentId,
        rating: replyState.rating
      });
      
      console.log('Reply created:', response.data);
      
      // Refresh all comments to get updated data from server
      await fetchComments();
      
      // Clear reply state for this comment
      setReplyStates(prev => {
        const newStates = { ...prev };
        delete newStates[parentId];
        return newStates;
      });
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    // Find comment to check if it has replies
    const comment = comments.find(c => c.id === commentId);
    const hasReplies = comment?.replies && comment.replies.length > 0;
    const repliesCount = comment?.replies?.length || 0;
    
    // Open confirmation dialog
    setDeleteDialog({
      isOpen: true,
      commentId,
      hasReplies: hasReplies || false,
      repliesCount
    });
  };

  const confirmDeleteComment = async () => {
    if (!deleteDialog.commentId) return;
    
    try {
      console.log('🗑️ Deleting comment:', deleteDialog.commentId, 
        deleteDialog.hasReplies ? `(has ${deleteDialog.repliesCount} replies)` : '(no replies)');
      
      const response = await axios.delete(`/question-comments/${deleteDialog.commentId}`);
      console.log('✅ Delete response:', response.data);
      
      // Refresh comments to see how backend handles cascade
      await fetchComments();
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      commentId: null,
      hasReplies: false,
      repliesCount: 0
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, readonly = false }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void; 
    readonly?: boolean;
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange?.(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            {star <= rating ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4 text-gray-300" />
            )}
          </button>
        ))}
        {readonly && <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>}
      </div>
    );
  };


  // Toggle expanded state for replies
  const toggleRepliesExpanded = useCallback((commentId: number) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  // Memoized handlers to prevent re-renders
  const handleReplyClick = useCallback((commentId: number) => {
    setReplyingTo(commentId);
    // Always initialize/ensure reply state exists
    setReplyStates(prev => {
      // If state already exists, keep it, otherwise create new
      const existingState = prev[commentId];
      return {
        ...prev,
        [commentId]: existingState || { content: '', rating: 5 }
      };
    });
  }, []);

  const handleReplyCancel = useCallback((commentId: number) => {
    setReplyingTo(null);
    // Clear reply state for this comment
    setReplyStates(prev => {
      const newStates = { ...prev };
      delete newStates[commentId];
      return newStates;
    });
  }, []);

  const handleReplyContentChange = useCallback((commentId: number, value: string) => {
    setReplyStates(prev => {
      const prevState = prev[commentId];
      
      if (!prevState) {
        // Initialize state if it doesn't exist
        return {
          ...prev,
          [commentId]: { content: value, rating: 5 }
        };
      }
      
      return {
        ...prev,
        [commentId]: {
          ...prevState,
          content: value
        }
      };
    });
  }, []);

  const handleReplyRatingChange = useCallback((commentId: number, rating: number) => {
    setReplyStates(prev => {
      const prevState = prev[commentId];
      if (!prevState) {
        // Initialize state if it doesn't exist
        return {
          ...prev,
          [commentId]: { content: '', rating: rating }
        };
      }
      
      return {
        ...prev,
        [commentId]: {
          ...prevState,
          rating: rating
        }
      };
    });
  }, []);

  const CommentItem = ({ 
    comment, 
    isReply = false, 
    isCurrentlyReplying,
    replyState,
    submitting,
    onReplyClick,
    onReplyContentChange,
    onReplyRatingChange,
    onReplySubmit,
    onReplyCancel,
    onDeleteComment,
    onToggleExpanded,
    isExpanded,
    canDelete
  }: { 
    comment: QuestionComment; 
    isReply?: boolean;
    isCurrentlyReplying: boolean;
    replyState?: { content: string; rating: number };
    submitting: boolean;
    onReplyClick: (id: number) => void;
    onReplyContentChange: (id: number, value: string) => void;
    onReplyRatingChange: (id: number, rating: number) => void;
    onReplySubmit: (id: number) => void;
    onReplyCancel: (id: number) => void;
    onDeleteComment: (id: number) => void;
    onToggleExpanded: (id: number) => void;
    isExpanded: boolean;
    canDelete: boolean;
  }) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const repliesCount = comment.replies?.length || 0;
    
    // console.log('🔄 CommentItem render:', { commentId: comment.id, isCurrentlyReplying });
    const showExpandButton = repliesCount > 3;
    const visibleReplies = useMemo(() => 
      isExpanded ? comment.replies : comment.replies?.slice(0, 3), 
      [isExpanded, comment.replies]
    );
    const hiddenRepliesCount = repliesCount - 3;

    return (
    <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.userAvatar} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.userName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.userName}</span>
              <Badge variant="outline" className="text-xs">
                {formatDate(comment.createdAt)}
              </Badge>
              </div>
              {comment.rating && (
                <StarRating rating={comment.rating} readonly={true} />
              )}
            </div>
            <p className="text-gray-800 text-sm">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReplyClick(comment.id)}
                className="text-xs h-6 px-2"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            
            {!isReply && hasReplies && (
              <span className="text-xs text-gray-500">
                {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
              </span>
            )}
            
            {canDelete && (
            <Button
              variant="ghost"
              size="sm"
                onClick={() => onDeleteComment(comment.id)}
              className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
            )}
          </div>
          
          {/* Reply form */}
          {isCurrentlyReplying && (
            <ReplyForm
              commentId={comment.id}
              replyState={replyState}
              submitting={submitting}
              onReplyContentChange={onReplyContentChange}
              onReplyRatingChange={onReplyRatingChange}
              onReplySubmit={onReplySubmit}
              onReplyCancel={onReplyCancel}
            />
          )}
          
          {/* Replies */}
          {hasReplies && (
            <div className="mt-3">
              {/* Show visible replies */}
              {visibleReplies?.map((reply) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  isReply={true}
                  isCurrentlyReplying={false}
                  replyState={undefined}
                  submitting={false}
                  onReplyClick={() => {}}
                  onReplyContentChange={() => {}}
                  onReplyRatingChange={() => {}}
                  onReplySubmit={() => {}}
                  onReplyCancel={() => {}}
                  onDeleteComment={onDeleteComment}
                  onToggleExpanded={() => {}}
                  isExpanded={false}
                  canDelete={canDeleteComment(reply)}
                />
              ))}
              
              {/* Show "View more" button if there are hidden replies */}
              {showExpandButton && !isExpanded && (
                <div className="ml-8 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpanded(comment.id)}
                    className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700"
                  >
                    Xem thêm {hiddenRepliesCount} phản hồi khác
                  </Button>
                </div>
              )}
              
              {/* Show "View less" button if expanded */}
              {showExpandButton && isExpanded && (
                <div className="ml-8 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpanded(comment.id)}
                    className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700"
                  >
                    Ẩn bớt
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new comment */}
        <div className="space-y-3">
          <Textarea
            placeholder="Share your thoughts about this question..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rating:</span>
              <StarRating 
                rating={newCommentRating} 
                onRatingChange={setNewCommentRating}
              />
            </div>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id}
                comment={comment}
                isCurrentlyReplying={replyingTo === comment.id}
                replyState={replyStates[comment.id]}
                submitting={submitting}
                onReplyClick={handleReplyClick}
                onReplyContentChange={handleReplyContentChange}
                onReplyRatingChange={handleReplyRatingChange}
                onReplySubmit={handleSubmitReply}
                onReplyCancel={handleReplyCancel}
                onDeleteComment={handleDeleteComment}
                onToggleExpanded={toggleRepliesExpanded}
                isExpanded={expandedReplies.has(comment.id)}
                canDelete={canDeleteComment(comment)}
              />
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteComment}
        title="Xóa Comment"
        message="Bạn có chắc chắn muốn xóa comment này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        repliesCount={deleteDialog.repliesCount}
      />
    </Card>
  );
}
