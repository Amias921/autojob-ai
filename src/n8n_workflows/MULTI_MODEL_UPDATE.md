# N8N Workflow Update Instructions

## Multi-Model Support Integration

The N8N workflow needs to be updated to support model selection. Here's what needs to change:

### Webhook Node
The webhook should now receive a `model` parameter from the frontend:

```json
{
  "job_id": 123,
  "resume_id": 456,
  "model": "llama3"  // NEW: AI model to use
}
```

### Code Node (AI Generation)
Update the Code node that calls Ollama to use the model parameter:

**Changes needed:**
1. Extract model from webhook data: `const modelName = webhookData.model || 'tinyllama';`
2. Use the model in the Ollama API call:

```javascript
const response = await this.helpers.request({
  method: 'POST',
  url: 'http://ollama:11434/api/generate',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    model: modelName,  // Use the selected model
    prompt: prompt,
    stream: false,
    options: {
      num_predict: 800,
      temperature: 0.7,
      top_p: 0.9
    }
  },
  json: true,
  timeout: 60000
});
```

### Backend API Call Node
When creating/updating the application record via the backend API, pass the model info:

```javascript
{
  "job_id": webhookData.job_id,
  "resume_id": webhookData.resume_id,
  "tailored_content": generatedContent,
  "status": "Generated"
}
```

The backend will automatically track the model metadata when called through the `/applications/generate` endpoint.

### Backward Compatibility
- If no `model` parameter is provided, default to `'tinyllama'` for N8N workflows
- Existing workflows will continue to work without modification

## Testing the Workflow

1. **Pull required models in Ollama:**
   ```bash
   docker exec -it container-ollama-1 ollama pull llama3
   docker exec -it container-ollama-1 ollama pull mistral
   docker exec -it container-ollama-1 ollama pull phi3
   ```

2. **Test the webhook with curl:**
   ```bash
   curl -X POST http://localhost:5679/webhook/resume-generation \
     -H "Content-Type: application/json" \
     -d '{"job_id": 1, "resume_id": 1, "model": "llama3"}'
   ```

3. **Verify in N8N:**
   - Check execution logs
   - Confirm correct model was used
   - Check that application was created with model metadata

## Notes
- The model name must match exactly what's available in Ollama
- Invalid model names will fall back to the default model
- Generation time and token count are automatically tracked by the backend
