# Upwork Job Application Assistant

A Firefox browser extension that automates the process of applying to Upwork jobs by auto-filling cover letters and answering common questions.

## Features

- Automatically fills cover letters
- Auto-fills common questions
- Real-time status updates
- Customizable responses based on job type

## Installation

1. Build the extension:
```bash
npm install
npm run build
```

2. Load in Firefox:
- Open Firefox
- Go to `about:debugging#/runtime/this-firefox`
- Click "Load Temporary Add-on"
- Select `dist/manifest.json` from the build directory

## Configuration

### API Setup
Replace the API endpoint in `src/background.js`:

```javascript
const API_ENDPOINT = 'YOUR_API_ENDPOINT_HERE';
```

The API should return data in this format:
```json
{
  "coverLetter": "Your cover letter text...",
  "questions": [
    {
      "question": "How many years of experience do you have?",
      "answer": "Your answer..."
    }
  ]
}
```

## Usage

1. Navigate to an Upwork job posting
2. Click the extension icon
3. Click "Start Application"
4. The extension will automatically:
   - Fill the cover letter
   - Answer matching questions

## Development

### Project Structure
- `src/Popup.jsx`: Extension popup interface
- `src/background.js`: Handles API communication
- `src/content.js`: Handles form filling
- `src/main.jsx`: Main entry point

### Building
```bash
npm run build
```

### Testing
1. Make sure your API endpoint is configured
2. Load the extension in Firefox
3. Navigate to an Upwork job posting
4. Test the auto-fill functionality

## Troubleshooting

Common issues and solutions:
1. If form fields aren't being filled:
   - Check console for error messages
   - Verify API response format
   - Ensure you're on an Upwork job page

2. If API connection fails:
   - Verify API endpoint is correct
   - Check network permissions in manifest.json

## Security Notes

- API keys should be stored securely
- The extension only runs on Upwork.com domains
- Form filling is limited to specific fields

## Dependencies

- React 18.2.0
- Vite 4.4.5
- Firefox Browser APIs
