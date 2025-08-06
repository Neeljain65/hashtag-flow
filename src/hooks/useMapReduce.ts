import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MapReduceJob {
  id: string;
  job_type: string;
  status: string;
  tweets_processed: number;
  hashtags_extracted: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface HashtagCount {
  id: string;
  hashtag: string;
  count: number;
  hour_window: string;
  created_at: string;
}

export const useMapReduce = () => {
  const [jobs, setJobs] = useState<MapReduceJob[]>([]);
  const [hashtagCounts, setHashtagCounts] = useState<HashtagCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startMapReduceJob = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('tweet-processor');
      
      if (functionError) throw functionError;
      
      console.log('MapReduce job started:', data);
      await fetchJobs(); // Refresh jobs list
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start MapReduce job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('mapreduce_jobs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchHashtagCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('hashtag_counts')
        .select('*')
        .order('count', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHashtagCounts(data || []);
    } catch (err) {
      console.error('Error fetching hashtag counts:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchHashtagCounts();

    // Set up real-time subscriptions
    const jobsChannel = supabase
      .channel('mapreduce-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mapreduce_jobs'
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    const hashtagsChannel = supabase
      .channel('hashtag-counts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hashtag_counts'
        },
        () => {
          fetchHashtagCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(hashtagsChannel);
    };
  }, []);

  return {
    jobs,
    hashtagCounts,
    loading,
    error,
    startMapReduceJob,
    refetch: () => {
      fetchJobs();
      fetchHashtagCounts();
    },
  };
};