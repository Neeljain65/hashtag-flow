import { useState, useCallback } from 'react';
import { TweetStream } from '@/components/TweetStream';
import { MapReduceVisualization } from '@/components/MapReduceVisualization';
import { HashtagAnalytics } from '@/components/HashtagAnalytics';
import { SystemMetrics } from '@/components/SystemMetrics';
import { TweetInput } from '@/components/TweetInput';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Activity, Hash, Server } from 'lucide-react';
import { useMapReduce } from '@/hooks/useMapReduce';
import { useTweets } from '@/hooks/useTweets';

const Index = () => {
  const [currentHashtags, setCurrentHashtags] = useState<string[]>([]);
  const { jobs } = useMapReduce();
  const { tweets } = useTweets();

  const handleHashtagExtraction = useCallback((hashtags: string[]) => {
    setCurrentHashtags(hashtags);
  }, []);

  // Calculate real metrics from database
  const totalTweets = tweets.length;
  const processedTweets = tweets.filter(t => t.processed).length;
  const totalHashtags = tweets.reduce((sum, t) => sum + t.hashtags.length, 0);
  const latestJob = jobs[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Twitter Hashtag MapReduce
                </h1>
                <p className="text-muted-foreground">
                  Real-time processing of millions of tweets using distributed computing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-tech-green/10 text-tech-green border-tech-green/20">
                <div className="w-2 h-2 rounded-full bg-tech-green mr-2 animate-pulse" />
                Live Processing
              </Badge>
              <Badge variant="outline">
                v2.1.0
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-tech-blue/10 to-tech-blue/5 border-tech-blue/20">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-tech-blue" />
              <div>
                <div className="text-2xl font-bold text-foreground">{totalTweets.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Tweets</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-tech-green/10 to-tech-green/5 border-tech-green/20">
            <div className="flex items-center gap-3">
              <Hash className="w-8 h-8 text-tech-green" />
              <div>
                <div className="text-2xl font-bold text-foreground">{totalHashtags.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Hashtags</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-tech-purple/10 to-tech-purple/5 border-tech-purple/20">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-tech-purple" />
              <div>
                <div className="text-2xl font-bold text-foreground">{processedTweets.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-tech-orange/10 to-tech-orange/5 border-tech-orange/20">
            <div className="flex items-center gap-3">
              <Server className="w-8 h-8 text-tech-orange" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {latestJob ? latestJob.status === 'running' ? 'Active' : 'Idle' : 'Ready'}
                </div>
                <div className="text-sm text-muted-foreground">MapReduce Status</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tweet Input */}
        <div className="mb-8">
          <TweetInput />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid ">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Tweet Stream */}
            <div className="h-[600px]">
              <TweetStream onHashtagExtracted={handleHashtagExtraction} />
            </div>
            
            {/* Hashtag Analytics */}
            <div className="h-[600px]">
              <HashtagAnalytics incomingHashtags={currentHashtags} />
            </div>
          </div>

        
          
        </div>

        {/* Architecture Overview */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-card to-secondary/20 border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">Architecture Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { title: 'Data Ingestion', desc: 'Real-time tweet streaming', icon: '📥', color: 'tech-blue' },
              { title: 'Map Phase', desc: 'Extract & emit hashtags', icon: '🗂️', color: 'tech-green' },
              { title: 'Shuffle Phase', desc: 'Group by hashtag key', icon: '🔀', color: 'tech-orange' },
              { title: 'Reduce Phase', desc: 'Aggregate final counts', icon: '📊', color: 'tech-purple' },
              { title: 'Output Storage', desc: 'Store results in HDFS', icon: '💾', color: 'tech-pink' },
            ].map((phase, index) => (
              <div
                key={phase.title}
                className={`p-4 rounded-lg bg-${phase.color}/10 border border-${phase.color}/20 text-center transition-all duration-300 hover:scale-105`}
              >
                <div className="text-3xl mb-2">{phase.icon}</div>
                <div className="text-sm font-semibold text-foreground">{phase.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{phase.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;