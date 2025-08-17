import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  ArrowRight, 
  Shuffle, 
  BarChart3, 
  Cpu, 
  Hash 
} from 'lucide-react';

interface MapReduceStep {
  id: string;
  stage: 'input' | 'map' | 'shuffle' | 'reduce' | 'output';
  data: any;
  timestamp: string;
}

interface MapReduceVisualizationProps {
  hashtags: string[];
}

export const MapReduceVisualization = ({ hashtags }: MapReduceVisualizationProps) => {
  const [steps, setSteps] = useState<MapReduceStep[]>([]);
  const [currentStep, setCurrentStep] = useState<'input' | 'map' | 'shuffle' | 'reduce' | 'output'>('input');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (hashtags.length === 0) return;

    // Simulate MapReduce process
    const processMapReduce = async () => {
      // Input stage
      setCurrentStep('input');
      setProgress(20);
      const inputStep: MapReduceStep = {
        id: `input-${Date.now()}`,
        stage: 'input',
        data: hashtags,
        timestamp: new Date().toLocaleTimeString(),
      };
      setSteps(prev => [inputStep, ...prev.slice(0, 4)]);

      await new Promise(resolve => setTimeout(resolve, 8000));

      // Map stage
      setCurrentStep('map');
      setProgress(40);
      const mappedData = hashtags.map(hashtag => ({ hashtag, count: 1 }));
      const mapStep: MapReduceStep = {
        id: `map-${Date.now()}`,
        stage: 'map',
        data: mappedData,
        timestamp: new Date().toLocaleTimeString(),
      };
      setSteps(prev => [mapStep, ...prev.slice(0, 4)]);

      await new Promise(resolve => setTimeout(resolve, 800));

      // Shuffle stage
      setCurrentStep('shuffle');
      setProgress(60);
      const shuffledData = mappedData.reduce((acc, item) => {
        acc[item.hashtag] = (acc[item.hashtag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const shuffleStep: MapReduceStep = {
        id: `shuffle-${Date.now()}`,
        stage: 'shuffle',
        data: shuffledData,
        timestamp: new Date().toLocaleTimeString(),
      };
      setSteps(prev => [shuffleStep, ...prev.slice(0, 4)]);

      await new Promise(resolve => setTimeout(resolve, 800));

      // Reduce stage
      setCurrentStep('reduce');
      setProgress(80);
      const reducedData = Object.entries(shuffledData).map(([hashtag, count]) => ({
        hashtag,
        count
      }));
      const reduceStep: MapReduceStep = {
        id: `reduce-${Date.now()}`,
        stage: 'reduce',
        data: reducedData,
        timestamp: new Date().toLocaleTimeString(),
      };
      setSteps(prev => [reduceStep, ...prev.slice(0, 4)]);

      await new Promise(resolve => setTimeout(resolve, 800));

      // Output stage
      setCurrentStep('output');
      setProgress(100);
      const outputStep: MapReduceStep = {
        id: `output-${Date.now()}`,
        stage: 'output',
        data: reducedData,
        timestamp: new Date().toLocaleTimeString(),
      };
      setSteps(prev => [outputStep, ...prev.slice(0, 4)]);

      // Reset after completion
      setTimeout(() => {
        setProgress(0);
        setCurrentStep('input');
      }, 2000);
    };

    processMapReduce();
  }, [hashtags]);

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'input': return <Database className="w-4 h-4" />;
      case 'map': return <Hash className="w-4 h-4" />;
      case 'shuffle': return <Shuffle className="w-4 h-4" />;
      case 'reduce': return <Cpu className="w-4 h-4" />;
      case 'output': return <BarChart3 className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'input': return 'bg-tech-blue/10 text-tech-blue border-tech-blue/20';
      case 'map': return 'bg-tech-green/10 text-tech-green border-tech-green/20';
      case 'shuffle': return 'bg-tech-orange/10 text-tech-orange border-tech-orange/20';
      case 'reduce': return 'bg-tech-purple/10 text-tech-purple border-tech-purple/20';
      case 'output': return 'bg-tech-pink/10 text-tech-pink border-tech-pink/20';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-card to-secondary/20 border-border/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-processing">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">MapReduce Processing</h3>
            <p className="text-sm text-muted-foreground">Real-time hashtag processing pipeline</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Processing Stage: {currentStep.toUpperCase()}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Pipeline Stages */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-background/30">
          {['input', 'map', 'shuffle', 'reduce', 'output'].map((stage, index) => (
            <div key={stage} className="flex items-center">
              <div
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  currentStep === stage
                    ? 'animate-pulse-glow ' + getStageColor(stage)
                    : 'bg-muted/30 border-muted'
                }`}
              >
                {getStageIcon(stage)}
              </div>
              {index < 4 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Processing Steps */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="p-4 rounded-lg bg-background/50 border border-border/30 animate-slide-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={getStageColor(step.stage)}>
                    {getStageIcon(step.stage)}
                    <span className="ml-1 capitalize">{step.stage}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">{step.timestamp}</span>
                </div>
              </div>

              <div className="text-sm">
                {step.stage === 'input' && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-muted-foreground">Input:</span>
                    {Array.isArray(step.data) && step.data.map((hashtag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                )}

                {step.stage === 'map' && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Mapped pairs:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.isArray(step.data) && step.data.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          ({item.hashtag}, {item.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {step.stage === 'shuffle' && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Grouped by key:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {typeof step.data === 'object' && Object.entries(step.data).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {value as number}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(step.stage === 'reduce' || step.stage === 'output') && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Final counts:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.isArray(step.data) && step.data.map((item, i) => (
                        <Badge key={i} className="text-xs bg-tech-green/10 text-tech-green border-tech-green/20">
                          {item.hashtag}: {item.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};