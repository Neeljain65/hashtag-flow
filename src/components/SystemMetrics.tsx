import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Network, 
  Activity,
  Gauge,
  Zap,
  Database
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export const SystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'good', trend: 'stable' },
    { name: 'Memory Usage', value: 67, unit: '%', status: 'good', trend: 'up' },
    { name: 'Disk I/O', value: 23, unit: 'MB/s', status: 'good', trend: 'down' },
    { name: 'Network', value: 156, unit: 'MB/s', status: 'good', trend: 'up' },
    { name: 'MapReduce Jobs', value: 12, unit: 'active', status: 'good', trend: 'stable' },
    { name: 'Queue Size', value: 3420, unit: 'tweets', status: 'warning', trend: 'up' },
    { name: 'Throughput', value: 892, unit: 'tweets/s', status: 'good', trend: 'up' },
    { name: 'Latency', value: 34, unit: 'ms', status: 'good', trend: 'stable' },
  ]);

  const [clusterStats, setClusterStats] = useState({
    totalNodes: 8,
    activeNodes: 7,
    failedNodes: 1,
    totalJobs: 156,
    completedJobs: 142,
    failedJobs: 3,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
        status: metric.value > 80 ? 'critical' : metric.value > 60 ? 'warning' : 'good'
      })));

      setClusterStats(prev => ({
        ...prev,
        totalJobs: prev.totalJobs + Math.floor(Math.random() * 3),
        completedJobs: prev.completedJobs + Math.floor(Math.random() * 2),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-tech-green';
      case 'warning': return 'text-tech-orange';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-tech-green/10 text-tech-green border-tech-green/20';
      case 'warning': return 'bg-tech-orange/10 text-tech-orange border-tech-orange/20';
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'cpu usage': return <Cpu className="w-4 h-4" />;
      case 'memory usage': return <HardDrive className="w-4 h-4" />;
      case 'disk i/o': return <Database className="w-4 h-4" />;
      case 'network': return <Network className="w-4 h-4" />;
      case 'throughput': return <Zap className="w-4 h-4" />;
      case 'latency': return <Gauge className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-card to-secondary/20 border-border/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-processing">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">System Metrics</h3>
            <p className="text-sm text-muted-foreground">Cluster health & performance</p>
          </div>
        </div>

        {/* Cluster Overview */}
        <div className="mb-6 p-4 rounded-lg bg-background/50 border border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-3">Cluster Status</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Nodes</span>
                <span className="text-tech-green font-semibold">
                  {clusterStats.activeNodes}/{clusterStats.totalNodes}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Failed Nodes</span>
                <span className="text-destructive font-semibold">{clusterStats.failedNodes}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Jobs</span>
                <span className="text-foreground font-semibold">{clusterStats.totalJobs}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="text-tech-green font-semibold">
                  {Math.round((clusterStats.completedJobs / clusterStats.totalJobs) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
          {metrics.map((metric, index) => (
            <div
              key={metric.name}
              className="p-4 rounded-lg bg-background/50 border border-border/30 hover:bg-background/70 transition-all duration-200 animate-slide-right"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`${getStatusColor(metric.status)}`}>
                    {getMetricIcon(metric.name)}
                  </div>
                  <span className="text-sm font-medium text-foreground">{metric.name}</span>
                  <Badge className={getStatusBadgeColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {typeof metric.value === 'number' ? Math.round(metric.value) : metric.value} {metric.unit}
                  </span>
                  <span className="text-xs">{getTrendIcon(metric.trend)}</span>
                </div>
              </div>
              
              {typeof metric.value === 'number' && metric.unit === '%' && (
                <Progress
                  value={Math.min(100, metric.value)}
                  className="h-2"
                />
              )}
              
              {typeof metric.value === 'number' && metric.unit !== '%' && (
                <div className="text-xs text-muted-foreground">
                  Performance: {metric.status === 'good' ? 'Optimal' : metric.status === 'warning' ? 'Moderate' : 'Needs attention'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* System Health Summary */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-tech-green animate-pulse" />
              <span className="text-sm text-muted-foreground">System Health</span>
            </div>
            <Badge className="bg-tech-green/10 text-tech-green border-tech-green/20">
              Operational
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};