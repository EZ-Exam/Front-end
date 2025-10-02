import { useState, useEffect, useRef, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Star, StarOff } from 'lucide-react';

interface ReplyFormProps {
  commentId: number;
  replyState?: { content: string; rating: number };
  submitting: boolean;
  onReplyContentChange: (id: number, value: string) => void;
  onReplyRatingChange: (id: number, rating: number) => void;
  onReplySubmit: (id: number) => void;
  onReplyCancel: (id: number) => void;
}

// Star Rating Component
const StarRating = ({ rating, onRatingChange }: { 
  rating: number; 
  onRatingChange: (rating: number) => void; 
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="cursor-pointer hover:scale-110 transition-transform"
        >
          {star <= rating ? (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="h-4 w-4 text-gray-300" />
          )}
        </button>
      ))}
    </div>
  );
};

export const ReplyForm = memo(({ 
  commentId, 
  replyState, 
  submitting, 
  onReplyContentChange, 
  onReplyRatingChange, 
  onReplySubmit, 
  onReplyCancel 
}: ReplyFormProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Initialize textarea value once and auto-focus
  useEffect(() => {
    if (textareaRef.current && !isTypingRef.current) {
      textareaRef.current.value = replyState?.content || '';
      setCanSubmit((replyState?.content || '').trim().length > 0);
      
      // Auto-focus with slight delay to ensure DOM is ready
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [commentId]); // Only re-run when commentId changes (new reply form)
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Mark as typing to prevent parent sync
    isTypingRef.current = true;
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setCanSubmit(value.trim().length > 0);
    
    // Only sync with parent after user stops typing for 500ms
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onReplyContentChange(commentId, value);
    }, 500);
  };
  
  const handleSubmit = () => {
    const content = textareaRef.current?.value || '';
    if (content.trim()) {
      // Ensure parent state is updated with final content before submit
      onReplyContentChange(commentId, content);
      // Small delay to ensure state is updated
      setTimeout(() => {
        onReplySubmit(commentId);
      }, 50);
    }
  };
  
  return (
    <div className="mt-3 ml-4">
      <Textarea
        ref={textareaRef}
        placeholder="Write a reply..."
        onChange={handleContentChange}
        className="mb-2"
        rows={2}
      />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rating:</span>
          <StarRating 
            rating={replyState?.rating || 5} 
            onRatingChange={(rating) => onReplyRatingChange(commentId, rating)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Send className="h-3 w-3 mr-1" />
          )}
          Reply
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReplyCancel(commentId)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
});

ReplyForm.displayName = 'ReplyForm';
