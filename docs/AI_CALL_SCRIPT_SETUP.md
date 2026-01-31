# AI Call Script Configuration

## OpenAI Integration Setup

To enable AI-generated call scripts, add your OpenAI API key to your environment variables:

### Local Development (.env.local)
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Production Deployment (Vercel/Railway/etc)
Add the environment variable through your hosting platform's dashboard:
- Variable name: `OPENAI_API_KEY`
- Value: Your OpenAI API key

## Getting an OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign in or create an OpenAI account
3. Click "Create new secret key"
4. Copy the key and add it to your environment variables

## Fallback Behavior

If no OpenAI API key is configured, the system will automatically fall back to enhanced template-based script generation. The fallback scripts are more natural and conversational than the original hard-coded templates.

## Cost Optimization

The system uses `gpt-4o-mini` which is cost-effective for script generation. Typical usage:
- ~500-1000 tokens per script generation
- Very low cost per script (fractions of a penny)
- Fallback ensures functionality without API dependency

## Troubleshooting

- **Scripts not generating**: Check your API key is correctly set
- **Generic scripts**: Verify the API key is valid and has credits
- **Errors in console**: Enable debug mode to see detailed error messages

The AI-generated scripts will be:
- More natural and conversational
- Personalized to the specific lead
- Adapted to the selected agent personality
- Include natural speech patterns and empathy