# Contributing

Thanks for improving HotBee Social Data Skills.

## Before opening a change

- Keep changes limited to public social-data collection, rankings, transcription, or report generation.
- Never commit API keys, private URLs, unredacted API responses, collected comments, transcripts, or generated user reports.
- Use synthetic fixtures for tests and examples.
- Preserve the safety and cost-confirmation boundaries in each `SKILL.md`.

## Validate locally

Run:

```bash
npm test
python -X utf8 -m unittest discover -s tests -v
python -X utf8 examples/douyin-video-report/generate_demo.py
git diff --check
```

Pull requests should explain the user impact, list the affected skills, and include the validation results. Report vulnerabilities through GitHub private vulnerability reporting rather than a public issue.
