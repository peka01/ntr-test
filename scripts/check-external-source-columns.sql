-- Check if external source columns exist in ai_knowledge_sources table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ai_knowledge_sources' 
AND column_name IN (
  'source_type', 
  'source_url', 
  'fetch_frequency', 
  'last_fetched', 
  'fetch_status', 
  'fetch_error', 
  'auto_fetch', 
  'content_selector', 
  'max_content_length', 
  'requires_auth', 
  'auth_config'
)
ORDER BY column_name;
