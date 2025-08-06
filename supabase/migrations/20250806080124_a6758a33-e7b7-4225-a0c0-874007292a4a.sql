-- Create tables for storing tweets and MapReduce results
CREATE TABLE public.tweets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tweet_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN NOT NULL DEFAULT false
);

-- Create table for hashtag counts (MapReduce results)
CREATE TABLE public.hashtag_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hashtag TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  hour_window TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hashtag, hour_window)
);

-- Create table for MapReduce job status
CREATE TABLE public.mapreduce_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  tweets_processed INTEGER NOT NULL DEFAULT 0,
  hashtags_extracted INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapreduce_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo)
CREATE POLICY "Public access to tweets" ON public.tweets FOR ALL USING (true);
CREATE POLICY "Public access to hashtag_counts" ON public.hashtag_counts FOR ALL USING (true);
CREATE POLICY "Public access to mapreduce_jobs" ON public.mapreduce_jobs FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_tweets_processed ON public.tweets(processed);
CREATE INDEX idx_tweets_created_at ON public.tweets(created_at);
CREATE INDEX idx_hashtag_counts_hour ON public.hashtag_counts(hour_window);
CREATE INDEX idx_hashtag_counts_hashtag ON public.hashtag_counts(hashtag);