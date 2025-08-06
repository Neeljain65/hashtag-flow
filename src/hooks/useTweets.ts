import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Tweet {
  id: string;
  tweet_id: string;
  user_name: string;
  content: string;
  hashtags: string[];
  created_at: string;
  processed: boolean;
}

export const useTweets = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTweets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tweets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTweets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
    } finally {
      setLoading(false);
    }
  };

  const addTweet = async (tweetData: {
    tweet_id: string;
    user_name: string;
    content: string;
    hashtags?: string[];
  }) => {
    try {
      // Extract hashtags from content using regex
      const hashtagRegex = /#[a-zA-Z0-9_]+/g;
      const extractedHashtags = tweetData.content.match(hashtagRegex)?.map(tag => tag.toLowerCase()) || [];
      
      const { data, error } = await supabase
        .from('tweets')
        .insert({
          ...tweetData,
          hashtags: tweetData.hashtags || extractedHashtags,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add to local state
      setTweets(prev => [data, ...prev.slice(0, 19)]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add tweet');
    }
  };

  useEffect(() => {
    fetchTweets();

    // Set up real-time subscription
    const channel = supabase
      .channel('tweets-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tweets'
        },
        (payload) => {
          setTweets(prev => [payload.new as Tweet, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tweets,
    loading,
    error,
    addTweet,
    refetch: fetchTweets,
  };
};