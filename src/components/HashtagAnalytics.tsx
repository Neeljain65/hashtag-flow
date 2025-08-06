import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Hash, BarChart3, Clock, Zap } from 'lucide-react';

interface HashtagCount {
  hashtag: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

interface HashtagAnalyticsProps {
  incomingHashtags: string[];
}

export const HashtagAnalytics = ({ incomingHashtags }: HashtagAnalyticsProps) => {
  const [hashtagCounts, setHashtagCounts] = useState<HashtagCount[]>([]);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [processingRate, setProcessingRate] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (incomingHashtags.length === 0) return;

    setTotalProcessed(prev => prev + incomingHashtags.length);
    setLastUpdate(new Date());

    // Calculate processing rate (hashtags per second)
    const now = Date.now();
    setProcessingRate(prev => {
      const timeDiff = (now - lastUpdate.getTime()) / 1000;
      return timeDiff > 0 ? Math.round(incomingHashtags.length / timeDiff) : 0;
    });

    setHashtagCounts(prevCounts => {
      const countMap: Record<string, HashtagCount> = {};
      
      // Convert previous counts to map
      prevCounts.forEach(item => {
        countMap[item.hashtag] = item;
      });
      
      incomingHashtags.forEach(hashtag => {
        if (countMap[hashtag]) {
          const oldCount = countMap[hashtag].count;
          countMap[hashtag] = {
            ...countMap[hashtag],
            count: oldCount + 1,
            trend: 'up' as const,
          };
        } else {
          countMap[hashtag] = {
            hashtag,
            count: 1,
            trend: 'up' as const,
            percentage: 0,
          };
        }
      });

      // Calculate percentages and update trends
      const total = Object.values(countMap).reduce((sum, item) => sum + item.count, 0);
      const updatedCounts = Object.values(countMap).map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      }));

      // Sort by count descending
      return updatedCounts.sort((a, b) => b.count - a.count).slice(0, 10);
    });
  }, [incomingHashtags]);

  const topHashtag = hashtagCounts[0];
  const maxCount = Math.max(...hashtagCounts.map(h => h.count), 1);

  return (
    <Card className="h-full bg-gradient-to-br from-card to-secondary/20 border-border/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-data">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Hashtag Analytics</h3>
            <p className="text-sm text-muted-foreground">Real-time trend analysis</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="text-2xl font-bold text-tech-blue">{totalProcessed}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Hash className="w-3 h-3" />
              Total Processed
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="text-2xl font-bold text-tech-green">{processingRate}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              Per Second
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="text-2xl font-bold text-tech-purple">{hashtagCounts.length}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Unique Tags
            </div>
          </div>
        </div>

        {/* Top Hashtag Highlight */}
        {topHashtag && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">#{topHashtag.hashtag}</div>
                <div className="text-sm opacity-90">Trending now</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{topHashtag.count}</div>
                <div className="text-sm opacity-90">{topHashtag.percentage}% share</div>
              </div>
            </div>
          </div>
        )}

        {/* Hashtag Rankings */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
          {hashtagCounts.map((hashtag, index) => (
            <div
              key={hashtag.hashtag}
              className="p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/70 transition-all duration-200 animate-slide-right"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-tech-blue text-white text-xs flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-sm bg-tech-blue/10 text-tech-blue border-tech-blue/20"
                  >
                    #{hashtag.hashtag}
                  </Badge>
                  {hashtag.trend === 'up' && (
                    <TrendingUp className="w-4 h-4 text-tech-green" />
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">{hashtag.count}</div>
                  <div className="text-xs text-muted-foreground">{hashtag.percentage}%</div>
                </div>
              </div>
              <Progress
                value={(hashtag.count / maxCount) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>

        {hashtagCounts.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No data processed yet</p>
            <p className="text-sm text-muted-foreground/70">Hashtag analytics will appear here</p>
          </div>
        )}

        {/* Last Update */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </Card>
  );
};