# Speech To Text API

Verified from HotBee public bundle:

- Endpoint: `POST https://www.smsz.xyz/prod-api/tool/speech/speechToText`
- Parameters: `key`, and one of:
  - `file_url`
  - `video_url`
- Transport in the package CLI: query parameters with POST.

Example:

```bash
npx -y github:shanye1402-hash/hotbee-api-skills#v1.0.5 call transcript --dry-run --file-url "https://example.com/audio.mp3"
```
