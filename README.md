# HotBee Social Data Skills

[![License: MIT-0](https://img.shields.io/badge/License-MIT--0-blue.svg)](LICENSE)

Six focused Agent Skills for public social-media data collection, hot rankings, media transcription, and Douyin video reporting through HotBee.

HotBee 社媒数据精选技能包：包含六个数据与分析 Skill，不包含图片或视频生成能力。

官网：[HotBee.cn](https://www.hotbee.cn) · [Skills 页面](https://www.hotbee.cn/skills)

## Included Skills

| Skill | 中文能力 | Verified scope |
| --- | --- | --- |
| `hotbee-douyin-collect` | 抖音数据采集 | 视频、评论、达人、粉丝画像、话题等已确认接口 |
| `hotbee-rednote-collect` | 小红书数据采集 | 公开笔记内容解析 |
| `hotbee-bilibili-collect` | B站数据采集 | 公开视频数据解析 |
| `hotbee-hot-rankings` | 全网热榜 | 小红书、抖音、百度、微博、B站 |
| `hotbee-transcript` | 音视频转文字 | 用户提供的音视频 URL |
| `hotbee-douyin-video-report` | 抖音视频报告 | 视频数据、评论、转写、HTML 拆解报告和 SVG 报告卡片 |

## Install

Install all six with the Agent Skills CLI:

```bash
npx skills add shanye1402-hash/hotbee-social-data-skills
```

The Skills call the versioned HotBee API CLI when execution is requested:

```bash
npx -y github:shanye1402-hash/hotbee-api-skills#v1.0.5 install douyin
npx -y github:shanye1402-hash/hotbee-api-skills#v1.0.5 install rednote
npx -y github:shanye1402-hash/hotbee-api-skills#v1.0.5 install bilibili
npx -y github:shanye1402-hash/hotbee-api-skills#v1.0.5 install hot-rankings
npx -y github:shanye1402-hash/hotbee-api-skills#v1.0.5 install transcript
```

The bundled Douyin video-report skill runs directly from its own Python script and does not use the package CLI above:

```bash
python skills/hotbee-douyin-video-report/scripts/douyin_video_report.py --url "抖音视频链接" --output-dir "./output/douyin-video-report"
```

In a compatible Agent Skills client, use:

```text
使用 $hotbee-douyin-video-report 解析这个抖音视频链接，并生成 HTML 报告、报告图片、评论 CSV/JSON 和视频文案。视频链接：{请粘贴抖音视频链接}
```

## Credential and cost boundary

- The collection, ranking, and transcription skills read paid-endpoint credentials from `HOTBEE_API_KEY`.
- `hotbee-douyin-video-report` reads its credential from `HOTBEE_DOUYIN_KEY` and can still generate a partial report when optional paid data is unavailable.
- Start with `--dry-run` and confirm the user's quota/cost intent before a paid live call.
- Never put a key in a prompt, command argument, repository, report, or public issue.
- Only process public links or media the user is authorized to submit. Do not bypass access controls, login gates, rate limits, or paywalls.
- Outputs may contain public usernames, posts, comments, ranking topics, or transcripts. Review applicable laws and platform rules before redistributing them.

## License

The repository is distributed under [MIT-0](LICENSE). HotBee's hosted API, plans, trademarks, and service terms remain separate.
