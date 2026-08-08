# Bilibili Collect API

Verified from HotBee public bundle:

- Endpoint: `POST https://www.smsz.xyz/prod-api/tool/bilibili/bilibili_video_data`
- Parameters: `key`, `video_url`
- Transport in the package CLI: query parameters with POST.

Example:

```bash
npx -y github:shanye1402-hash/hotbee-api-skills#v1.0.5 call bilibili --dry-run --url "https://www.bilibili.com/video/BV..."
```
