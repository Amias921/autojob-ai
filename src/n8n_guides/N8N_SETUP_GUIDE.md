# Fix N8N Resume Generation - Use Actual Resume Content

## Current Problem

The Ollama AI is generating **generic resumes** instead of using your **uploaded resume content**. This is because the current N8N Code node prompt doesn't include the resume data.

## Solution

Update your **"Code in JavaScript"** node in N8N with this improved code:

### Complete Updated Code:

```javascript
// Get data from previous nodes
const webhookData = $node['Webhook'].json.body;
const jobData = $node['Get Job Details'].json;
const resumeData = $node['Get Resume'].json;

// Build a comprehensive prompt with ACTUAL resume content
const prompt = `You are a professional resume writer. Tailor the following resume for the job listed below.

ORIGINAL RESUME:
${resumeData.content}

JOB POSITION:
Title: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}

INSTRUCTIONS:
- Keep the same overall structure and format
- Emphasize skills and experience relevant to this specific job
- Use keywords from the job description
- Keep it professional and ATS-friendly
- Maintain truthfulness - don't add fake experience

TAILORED RESUME:`;

// Make request to Ollama
const response = await this.helpers.request({
  method: 'POST',
  url: 'http://ollama:11434/api/generate',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    model: 'llama3',
    prompt: prompt,
    stream: false  // Boolean, not string!
  },
  json: true
});

// Return the generated response
return { json: response };
```

## How to Update in N8N:

1. **Open** your "Resume Generation Automation" workflow
2. **Click** the "Code in JavaScript" node (previously named "Generate Tailored")
3. **Delete** all existing code
4. **Paste** the complete code above
5. **Execute Workflow** to test

## What Changed:

**Before:**
```javascript
const prompt = `Tailor this resume for: ${jobData.title} at ${jobData.company}. Focus on relevant skills.`;
```

**After:**
```javascript
const prompt = `You are a professional resume writer. Tailor the following resume for the job listed below.

ORIGINAL RESUME:
${resumeData.content}
...
`;
```

Now Ollama will **actually use your uploaded resume** and tailor it specifically for each job! 🎯
