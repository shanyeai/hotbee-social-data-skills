# HotBee Social Data Skills

[![License: MIT-0](https://img.shields.io/badge/License-MIT--0-blue.svg)](LICENSE)

Five focused Agent Skills for public social-media data collection, hot rankings, and media transcription through HotBee.

HotBee 社媒数据精选技能包：只包含第一批五个数据 Skill，不包含图片或视频生成能力。

官网：[HotBee.cn](https://www.hotbee.cn) · [Skills 页面](https://www.hotbee.cn/skills)

## Included Skills

| Skill | 中文能力 | Verified scope |
| --- | --- | --- |
| `hotbee-douyin-collect` | 抖音数据采集 | 视频、评论、达人、粉丝画像、话题等已确认接口 |
| `hotbee-rednote-collect` | 小红书数据采集 | 公开笔记内容解析 |
| `hotbee-bilibili-collect` | B站数据采集 | 公开视频数据解析 |
| `hotbee-hot-rankings` | 全网热榜 | 小红书、抖音、百度、微博、B站 |
| `hotbee-transcript` | 音视频转文字 | 用户提供的音视频 URL |

## Install

Install all five with the Agent Skills CLI:

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

## Credential and cost boundary

- Paid endpoints read only `HOTBEE_API_KEY` from the local environment.
- Start with `--dry-run` and confirm the user's quota/cost intent before a paid live call.
- Never put a key in a prompt, command argument, repository, report, or public issue.
- Only process public links or media the user is authorized to submit. Do not bypass access controls, login gates, rate limits, or paywalls.
- Outputs may contain public usernames, posts, comments, ranking topics, or transcripts. Review applicable laws and platform rules before redistributing them.

## License

The repository is distributed under [MIT-0](LICENSE). HotBee's hosted API, plans, trademarks, and service terms remain separate.
