import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Hash, User, MessageSquare } from 'lucide-react';
import { useTweets } from '@/hooks/useTweets';
import { useToast } from '@/hooks/use-toast';

export const TweetInput = () => {
  const [userName, setUserName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTweet } = useTweets();
  const { toast } = useToast();

  // Extract hashtags in real-time for preview
  const extractedHashtags = content.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.toLowerCase()) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both username and tweet content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Generate a unique tweet ID
      const tweetId = `tweet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await addTweet({
        tweet_id: tweetId,
        user_name: userName.trim(),
        content: content.trim(),
      });

      toast({
        title: "Tweet Added!",
        description: `Successfully added tweet from @${userName} with ${extractedHashtags.length} hashtags.`,
      });

      // Reset form
      setUserName('');
      setContent('');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add tweet",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-tech-blue/10 to-tech-blue/5 border-tech-blue/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-foreground">
          <PlusCircle className="w-6 h-6 text-tech-blue" />
          Add New Tweet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="w-4 h-4 text-tech-blue" />
              Username
            </label>
            <Input
              type="text"
              placeholder="Enter username (without @)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-tech-blue"
            />
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageSquare className="w-4 h-4 text-tech-blue" />
              Tweet Content
            </label>
            <Textarea
              placeholder="What's happening? Use #hashtags to categorize your tweet..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-tech-blue min-h-[100px] resize-none"
              maxLength={280}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{content.length}/280 characters</span>
              {extractedHashtags.length > 0 && (
                <span className="text-tech-blue">
                  {extractedHashtags.length} hashtag{extractedHashtags.length !== 1 ? 's' : ''} detected
                </span>
              )}
            </div>
          </div>

          {/* Hashtag Preview */}
          {extractedHashtags.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Hash className="w-4 h-4 text-tech-green" />
                Detected Hashtags
              </label>
              <div className="flex flex-wrap gap-2">
                {extractedHashtags.map((hashtag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-tech-green/10 text-tech-green border-tech-green/20"
                  >
                    {hashtag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !userName.trim() || !content.trim()}
            className="w-full bg-tech-blue hover:bg-tech-blue/80 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Adding Tweet...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Tweet
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};