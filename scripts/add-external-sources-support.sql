-- Add support for external knowledge sources
-- This script extends the AI knowledge sources system to support external sources like forums and webpages

-- Add new columns to ai_knowledge_sources table
ALTER TABLE ai_knowledge_sources 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'internal' CHECK (source_type IN ('internal', 'external', 'forum', 'webpage', 'api')),
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS fetch_frequency VARCHAR(20) DEFAULT 'manual' CHECK (fetch_frequency IN ('manual', 'daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS last_fetched TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fetch_status VARCHAR(20) DEFAULT 'pending' CHECK (fetch_status IN ('pending', 'success', 'failed', 'disabled')),
ADD COLUMN IF NOT EXISTS fetch_error TEXT,
ADD COLUMN IF NOT EXISTS auto_fetch BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS content_selector TEXT, -- CSS selector for extracting specific content
ADD COLUMN IF NOT EXISTS max_content_length INTEGER DEFAULT 10000, -- Maximum content length to store
ADD COLUMN IF NOT EXISTS requires_auth BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auth_config JSONB; -- Store authentication configuration

-- Create index for external sources
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_type ON ai_knowledge_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_fetch_status ON ai_knowledge_sources(fetch_status);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_auto_fetch ON ai_knowledge_sources(auto_fetch);

-- Create a table for tracking fetch history
CREATE TABLE IF NOT EXISTS ai_source_fetch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES ai_knowledge_sources(id) ON DELETE CASCADE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    content_length INTEGER,
    error_message TEXT,
    fetch_duration_ms INTEGER,
    content_hash VARCHAR(64) -- To detect if content actually changed
);

-- Create index for fetch history
CREATE INDEX IF NOT EXISTS idx_ai_source_fetch_history_source_id ON ai_source_fetch_history(source_id);
CREATE INDEX IF NOT EXISTS idx_ai_source_fetch_history_fetched_at ON ai_source_fetch_history(fetched_at);

-- Create a table for external source configurations
CREATE TABLE IF NOT EXISTS ai_external_source_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES ai_knowledge_sources(id) ON DELETE CASCADE,
    config_type VARCHAR(50) NOT NULL, -- 'auth', 'parser', 'filter', etc.
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for external source configs
CREATE INDEX IF NOT EXISTS idx_ai_external_source_configs_source_id ON ai_external_source_configs(source_id);
CREATE INDEX IF NOT EXISTS idx_ai_external_source_configs_type ON ai_external_source_configs(config_type);

-- Add trigger for updated_at on external source configs
CREATE TRIGGER update_ai_external_source_configs_updated_at 
    BEFORE UPDATE ON ai_external_source_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some example external sources
INSERT INTO ai_knowledge_sources (
    name, 
    description, 
    content, 
    keywords, 
    category, 
    priority, 
    language, 
    source_type,
    source_url,
    auto_fetch,
    fetch_frequency,
    content_selector,
    max_content_length,
    created_by
) VALUES 
(
    'Training Management Forum',
    'Community discussions about training management best practices',
    'This is a placeholder for forum content that will be fetched automatically.',
    '{"forum", "community", "discussions", "best practices", "training management"}',
    'community',
    5,
    'both',
    'forum',
    'https://example-forum.com/training-management',
    true,
    'weekly',
    '.forum-content, .post-content',
    5000,
    'system'
),
(
    'Training Documentation Wiki',
    'Official documentation and guides for training management',
    'This is a placeholder for wiki content that will be fetched automatically.',
    '{"documentation", "wiki", "guides", "official", "training"}',
    'documentation',
    7,
    'both',
    'webpage',
    'https://example-wiki.com/training-guides',
    true,
    'daily',
    '.wiki-content, .documentation-content',
    8000,
    'system'
),
(
    'Training API Documentation',
    'API documentation for training management endpoints',
    'This is a placeholder for API documentation that will be fetched automatically.',
    '{"api", "documentation", "endpoints", "integration", "training"}',
    'technical',
    6,
    'both',
    'api',
    'https://api.example.com/docs/training',
    true,
    'weekly',
    '.api-docs, .endpoint-docs',
    6000,
    'system'
);

-- Create a function to fetch external content
CREATE OR REPLACE FUNCTION fetch_external_source_content(source_id UUID)
RETURNS JSONB AS $$
DECLARE
    source_record RECORD;
    fetch_result JSONB;
BEGIN
    -- Get source information
    SELECT * INTO source_record 
    FROM ai_knowledge_sources 
    WHERE id = source_id AND source_type != 'internal';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Source not found or not external');
    END IF;
    
    -- Update fetch status to pending
    UPDATE ai_knowledge_sources 
    SET fetch_status = 'pending', last_fetched = NOW()
    WHERE id = source_id;
    
    -- In a real implementation, this would call an external service
    -- For now, we'll simulate a successful fetch
    fetch_result := jsonb_build_object(
        'success', true,
        'content_length', 1000,
        'fetch_duration_ms', 500,
        'content_hash', md5('simulated content from ' || source_record.source_url)
    );
    
    -- Update source with successful fetch
    UPDATE ai_knowledge_sources 
    SET 
        fetch_status = 'success',
        last_fetched = NOW(),
        content = 'Content fetched from: ' || source_record.source_url || E'\n\n' || 
                  'This is simulated content that would normally be fetched from the external source.',
        fetch_error = NULL
    WHERE id = source_id;
    
    -- Record fetch history
    INSERT INTO ai_source_fetch_history (
        source_id, 
        status, 
        content_length, 
        fetch_duration_ms, 
        content_hash
    ) VALUES (
        source_id,
        'success',
        1000,
        500,
        md5('simulated content from ' || source_record.source_url)
    );
    
    RETURN fetch_result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get external sources that need fetching
CREATE OR REPLACE FUNCTION get_sources_needing_fetch()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    source_url TEXT,
    fetch_frequency VARCHAR,
    last_fetched TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ks.id,
        ks.name,
        ks.source_url,
        ks.fetch_frequency,
        ks.last_fetched
    FROM ai_knowledge_sources ks
    WHERE ks.auto_fetch = true 
    AND ks.source_type != 'internal'
    AND (
        ks.last_fetched IS NULL 
        OR (
            ks.fetch_frequency = 'daily' AND ks.last_fetched < NOW() - INTERVAL '1 day'
        )
        OR (
            ks.fetch_frequency = 'weekly' AND ks.last_fetched < NOW() - INTERVAL '1 week'
        )
        OR (
            ks.fetch_frequency = 'monthly' AND ks.last_fetched < NOW() - INTERVAL '1 month'
        )
    )
    ORDER BY ks.priority DESC, ks.last_fetched ASC NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- Display setup summary
SELECT 
    'External Sources Support Added' as status,
    (SELECT COUNT(*) FROM ai_knowledge_sources WHERE source_type != 'internal') as external_sources_created,
    (SELECT COUNT(*) FROM ai_knowledge_sources WHERE auto_fetch = true) as auto_fetch_sources,
    (SELECT COUNT(*) FROM ai_source_fetch_history) as fetch_history_records;
