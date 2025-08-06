import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      tweets: {
        Row: {
          id: string;
          tweet_id: string;
          user_name: string;
          content: string;
          hashtags: string[];
          created_at: string;
          processed: boolean;
        };
        Insert: {
          tweet_id: string;
          user_name: string;
          content: string;
          hashtags?: string[];
          processed?: boolean;
        };
        Update: {
          processed?: boolean;
        };
      };
      hashtag_counts: {
        Row: {
          id: string;
          hashtag: string;
          count: number;
          hour_window: string;
          created_at: string;
        };
        Insert: {
          hashtag: string;
          count: number;
          hour_window: string;
        };
      };
      mapreduce_jobs: {
        Row: {
          id: string;
          job_type: string;
          status: string;
          tweets_processed: number;
          hashtags_extracted: number;
          error_message?: string;
          started_at: string;
          completed_at?: string;
        };
        Insert: {
          job_type: string;
          status: string;
          tweets_processed?: number;
          hashtags_extracted?: number;
        };
        Update: {
          status?: string;
          tweets_processed?: number;
          hashtags_extracted?: number;
          error_message?: string;
          completed_at?: string;
        };
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      'https://rnfbqabzbdkveqmqrffj.supabase.co',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    console.log('Starting MapReduce job...');

    // Create a new job record
    const { data: job, error: jobError } = await supabaseClient
      .from('mapreduce_jobs')
      .insert({
        job_type: 'hashtag_processing',
        status: 'running',
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      throw jobError;
    }

    console.log('Created job:', job.id);

    // MAP PHASE: Fetch unprocessed tweets and extract hashtags
    const { data: tweets, error: tweetsError } = await supabaseClient
      .from('tweets')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(100); // Process in batches

    if (tweetsError) {
      console.error('Error fetching tweets:', tweetsError);
      throw tweetsError;
    }

    console.log(`Processing ${tweets?.length || 0} tweets`);

    if (!tweets || tweets.length === 0) {
      await supabaseClient
        .from('mapreduce_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      return new Response(
        JSON.stringify({ message: 'No tweets to process', job_id: job.id }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // MAP: Extract hashtags from each tweet
    const hashtagMap = new Map<string, number>();
    let totalHashtags = 0;

    for (const tweet of tweets) {
      // Extract hashtags from tweet content
      const hashtags = extractHashtags(tweet.content);
      
      // Update the tweet with extracted hashtags if empty
      if (tweet.hashtags.length === 0 && hashtags.length > 0) {
        await supabaseClient
          .from('tweets')
          .update({ hashtags: hashtags })
          .eq('id', tweet.id);
      }

      // Use existing hashtags or newly extracted ones
      const tweetHashtags = tweet.hashtags.length > 0 ? tweet.hashtags : hashtags;
      
      // Count hashtags
      for (const hashtag of tweetHashtags) {
        hashtagMap.set(hashtag, (hashtagMap.get(hashtag) || 0) + 1);
        totalHashtags++;
      }

      // Mark tweet as processed
      await supabaseClient
        .from('tweets')
        .update({ processed: true })
        .eq('id', tweet.id);
    }

    console.log(`Extracted ${totalHashtags} hashtags, ${hashtagMap.size} unique`);

    // REDUCE PHASE: Aggregate hashtag counts by hour window
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);
    const hourWindow = currentHour.toISOString();

    // Insert or update hashtag counts
    for (const [hashtag, count] of hashtagMap.entries()) {
      // Try to insert, if conflict then update
      const { error: insertError } = await supabaseClient
        .from('hashtag_counts')
        .insert({
          hashtag,
          count,
          hour_window: hourWindow,
        });

      if (insertError && insertError.code === '23505') {
        // Unique constraint violation, update existing record
        const { data: existing } = await supabaseClient
          .from('hashtag_counts')
          .select('count')
          .eq('hashtag', hashtag)
          .eq('hour_window', hourWindow)
          .single();

        if (existing) {
          await supabaseClient
            .from('hashtag_counts')
            .update({ count: existing.count + count })
            .eq('hashtag', hashtag)
            .eq('hour_window', hourWindow);
        }
      } else if (insertError) {
        console.error('Error inserting hashtag count:', insertError);
      }
    }

    // Update job status
    await supabaseClient
      .from('mapreduce_jobs')
      .update({
        status: 'completed',
        tweets_processed: tweets.length,
        hashtags_extracted: totalHashtags,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    console.log('MapReduce job completed successfully');

    return new Response(
      JSON.stringify({
        message: 'MapReduce job completed successfully',
        job_id: job.id,
        tweets_processed: tweets.length,
        hashtags_extracted: totalHashtags,
        unique_hashtags: hashtagMap.size,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('MapReduce job failed:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}