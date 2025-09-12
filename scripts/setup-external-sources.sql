-- Setup script for external sources support
-- Run this in your Supabase SQL editor to add external source support

-- First, check if the columns already exist
DO $$
BEGIN
    -- Add new columns to ai_knowledge_sources table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'source_type') THEN
        ALTER TABLE ai_knowledge_sources 
        ADD COLUMN source_type VARCHAR(20) DEFAULT 'internal' CHECK (source_type IN ('internal', 'external', 'forum', 'webpage', 'api'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'source_url') THEN
        ALTER TABLE ai_knowledge_sources ADD COLUMN source_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'fetch_frequency') THEN
        ALTER TABLE ai_knowledge_sources 
        ADD COLUMN fetch_frequency VARCHAR(20) DEFAULT 'manual' CHECK (fetch_frequency IN ('manual', 'daily', 'weekly', 'monthly'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'last_fetched') THEN
        ALTER TABLE ai_knowledge_sources ADD COLUMN last_fetched TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'fetch_status') THEN
        ALTER TABLE ai_knowledge_sources 
        ADD COLUMN fetch_status VARCHAR(20) DEFAULT 'pending' CHECK (fetch_status IN ('pending', 'success', 'failed', 'disabled'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'fetch_error') THEN
        ALTER TABLE ai_knowledge_sources ADD COLUMN fetch_error TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'auto_fetch') THEN
        ALTER TABLE ai_knowledge_sources ADD COLUMN auto_fetch BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'content_selector') THEN
        ALTER TABLE ai_knowledge_sources ADD COLUMN content_selector TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'max_content_length') THEN
        ALTER TABLE ai_knowledge_sources ADD COLUMN max_content_length INTEGER DEFAULT 10000;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'requires_auth') THEN
        ALTER TABLE ai_knowledge_sources ADD COLUMN requires_auth BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_knowledge_sources' AND column_name = 'auth_config') THEN
        ALTER TABLE ai_knowledge_sources ADD COLUMN auth_config JSONB;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_type ON ai_knowledge_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_fetch_status ON ai_knowledge_sources(fetch_status);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_auto_fetch ON ai_knowledge_sources(auto_fetch);

-- Create fetch history table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_source_fetch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES ai_knowledge_sources(id) ON DELETE CASCADE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    content_length INTEGER,
    error_message TEXT,
    fetch_duration_ms INTEGER,
    content_hash VARCHAR(64)
);

-- Create indexes for fetch history
CREATE INDEX IF NOT EXISTS idx_ai_source_fetch_history_source_id ON ai_source_fetch_history(source_id);
CREATE INDEX IF NOT EXISTS idx_ai_source_fetch_history_fetched_at ON ai_source_fetch_history(fetched_at);

-- Create external source configs table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_external_source_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES ai_knowledge_sources(id) ON DELETE CASCADE,
    config_type VARCHAR(50) NOT NULL,
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for external source configs
CREATE INDEX IF NOT EXISTS idx_ai_external_source_configs_source_id ON ai_external_source_configs(source_id);
CREATE INDEX IF NOT EXISTS idx_ai_external_source_configs_type ON ai_external_source_configs(config_type);

-- Create trigger for updated_at on external source configs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ai_external_source_configs_updated_at ON ai_external_source_configs;
CREATE TRIGGER update_ai_external_source_configs_updated_at 
    BEFORE UPDATE ON ai_external_source_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Display success message
SELECT 'External sources support has been successfully added to the database!' as status;
