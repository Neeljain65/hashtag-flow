import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Twitter, Hash, TrendingUp } from 'lucide-react';

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

const mockTweets: Omit<Tweet, 'id' | 'timestamp'>[] = [
  { user: 'TechGuru', content: 'Breaking: New AI breakthrough in #MachineLearning and #DeepLearning #Tech', hashtags: ['MachineLearning', 'DeepLearning', 'Tech'], avatar: '🤖' },
  { user: 'DataScientist', content: 'Loving the new #BigData tools for #Analytics and #DataProcessing', hashtags: ['BigData', 'Analytics', 'DataProcessing'], avatar: '📊' },
  { user: 'CloudExpert', content: 'Just deployed a massive #Kubernetes cluster with #Docker containers #DevOps', hashtags: ['Kubernetes', 'Docker', 'DevOps'], avatar: '☁️' },
  { user: 'AIResearcher', content: 'Working on #NLP models for better #TextAnalysis and #SentimentAnalysis', hashtags: ['NLP', 'TextAnalysis', 'SentimentAnalysis'], avatar: '🧠' },
  { user: 'WebDev', content: 'Building responsive UIs with #React #JavaScript and #TypeScript', hashtags: ['React', 'JavaScript', 'TypeScript'], avatar: '💻' },
  { user: 'MobileGuru', content: 'Flutter vs React Native debate continues #Flutter #ReactNative #MobileDev', hashtags: ['Flutter', 'ReactNative', 'MobileDev'], avatar: '📱' },
  { user: 'CyberSecPro', content: 'Important security updates for #CyberSecurity and #DataProtection #InfoSec', hashtags: ['CyberSecurity', 'DataProtection', 'InfoSec'], avatar: '🔒' },
  { user: 'StartupFounder', content: 'Scaling our #Startup with #Microservices architecture #Innovation', hashtags: ['Startup', 'Microservices', 'Innovation'], avatar: '🚀' },
];

export const TweetStream = ({ onHashtagExtracted }: TweetStreamProps) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const mockTweet = mockTweets[Math.floor(Math.random() * mockTweets.length)];
      const newTweet: Tweet = {
        ...mockTweet,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
      };

      setTweets(prev => [newTweet, ...prev.slice(0, 9)]);
      onHashtagExtracted(newTweet.hashtags);
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming, onHashtagExtracted]);

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
            <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-tech-green animate-pulse' : 'bg-muted'}`} />
            <span className="text-sm text-muted-foreground">
              {isStreaming ? 'Streaming' : 'Paused'}
            </span>
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
          {tweets.map((tweet, index) => (
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

        {tweets.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Waiting for tweets...</p>
          </div>
        )}
      </div>
    </Card>
  );
};