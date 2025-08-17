import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Twitter, Hash, TrendingUp, Loader2 } from 'lucide-react';
import { useTweets, Tweet as DBTweet } from '@/hooks/useTweets';

interface Tweet {
  id: string;
  user: string;
  content: string;
  hashtags: string[];
  timestamp: string;
  avatar: string;
}

interface TweetStreamProps {
  onHashtagExtracted: (hashtags: string[]) => void;
}

export const TweetStream = ({ onHashtagExtracted }: TweetStreamProps) => {
  const { tweets: dbTweets, loading, error } = useTweets();
  const [displayTweets, setDisplayTweets] = useState<Tweet[]>([]);

  // Convert database tweets to display format
  useEffect(() => {
    const convertedTweets = dbTweets.map((dbTweet): Tweet => ({
      id: dbTweet.id,
      user: dbTweet.user_name,
      content: dbTweet.content,
      hashtags: dbTweet.hashtags,
      timestamp: new Date(dbTweet.created_at).toLocaleTimeString(),
      avatar: getAvatarForUser(dbTweet.user_name),
    }));

    setDisplayTweets(convertedTweets);

    // Extract hashtags for analytics when tweets change
    const allHashtags = convertedTweets.flatMap(tweet => tweet.hashtags);
    if (allHashtags.length > 0) {
      onHashtagExtracted(allHashtags);
    }
  }, [dbTweets, onHashtagExtracted]);

  // Function to generate avatar based on username
  const getAvatarForUser = (username: string): string => {
    const avatars = ['🤖', '📊', '☁️', '🧠', '💻', '📱', '🔒', '🚀', '🎯', '🌟'];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatars[index % avatars.length];
  };

  return (
    <Card className="h-full overflow-hidden bg-gradient-to-br from-card to-secondary/20 border-border/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Twitter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Live Tweet Stream</h3>
              <p className="text-sm text-muted-foreground">Real-time Twitter data ingestion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${loading ? 'bg-tech-green animate-pulse' : 'bg-tech-blue'}`} />
            <span className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : 'Live'}
            </span>
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              Error loading tweets: {error}
            </div>
          )}
          
          {loading && displayTweets.length === 0 && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading tweets...</p>
            </div>
          )}

          {displayTweets.map((tweet, index) => (
            <div
              key={tweet.id}
              className="p-4 rounded-lg bg-background/50 border border-border/30 animate-slide-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-data flex items-center justify-center text-lg">
                  {tweet.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-foreground">@{tweet.user}</span>
                    <span className="text-xs text-muted-foreground">{tweet.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mb-3">{tweet.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {tweet.hashtags.map((hashtag) => (
                      <Badge
                        key={hashtag}
                        variant="secondary"
                        className="text-xs bg-tech-blue/10 text-tech-blue border-tech-blue/20 hover:bg-tech-blue/20"
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayTweets.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tweets available</p>
          </div>
        )}
      </div>
    </Card>
  );
};