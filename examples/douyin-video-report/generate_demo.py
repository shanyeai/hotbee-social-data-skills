import importlib.util
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
EXAMPLE_DIR = Path(__file__).resolve().parent
SCRIPT_PATH = REPO_ROOT / "skills" / "hotbee-douyin-video-report" / "scripts" / "douyin_video_report.py"
PREVIEW_PATH = REPO_ROOT / "docs" / "assets" / "report-preview.svg"

SPEC = importlib.util.spec_from_file_location("douyin_video_report", SCRIPT_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


def main() -> None:
    video = {
        "platform": "douyin",
        "title": "把一条公开视频拆成可复用的内容增长报告",
        "description": "从数据、脚本、评论意图和高频需求四个角度复盘内容。",
        "authorName": "示例创作者",
        "authorId": "demo_creator",
        "publishedAt": "2026-08-16 10:00:00",
        "duration": "38",
        "videoId": "demo-video-001",
        "originalUrl": "https://www.douyin.com/video/demo-video-001",
        "resolvedUrl": "https://www.douyin.com/video/demo-video-001",
        "coverUrl": "",
        "musicTitle": "示例音乐",
        "imageCount": 0,
        "playCount": 1280000,
        "likeCount": 76000,
        "commentCount": 4860,
        "shareCount": 9200,
        "collectCount": 31800,
    }
    transcript = (
        "别再只看播放量了。先拆开头三秒为什么能抓住人，"
        "再看中段如何证明价值，最后从评论里找到用户真正追问的问题。"
        "收藏这份方法，下次复盘任何公开视频都能直接套用。"
    )
    comments = [
        {"author": "用户甲", "text": "这个报告入口在哪里？想拿来复盘自己的视频。", "intent": "求入口", "location": "北京", "likeCount": 328, "time": "刚刚"},
        {"author": "用户乙", "text": "能不能出一期完整教程，特别想看评论需求怎么分类。", "intent": "求教程", "location": "上海", "likeCount": 215, "time": "2分钟前"},
        {"author": "用户丙", "text": "收藏了，数据和脚本放在一起比只看点赞有用。", "intent": "正向反馈", "location": "广东", "likeCount": 186, "time": "5分钟前"},
        {"author": "用户丁", "text": "适合小团队吗？想知道价格和使用门槛。", "intent": "问价格", "location": "浙江", "likeCount": 94, "time": "8分钟前"},
        {"author": "用户戊", "text": "建议增加同赛道视频对比，这样选题判断更直观。", "intent": "提建议", "location": "江苏", "likeCount": 73, "time": "12分钟前"},
    ]

    report = MODULE.build_report_model(video, transcript, comments)
    html = MODULE.render_html(video, report, transcript, comments, [], ["这是离线生成的合成演示，不包含真实 API 数据。"])
    html = "\n".join(line.rstrip() for line in html.splitlines()) + "\n"

    EXAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    MODULE.write_text(EXAMPLE_DIR / "report.html", html)
    MODULE.write_text(EXAMPLE_DIR / "sample-transcript.md", f"# 示例视频文案\n\n{transcript}\n")
    MODULE.write_json(EXAMPLE_DIR / "sample-comments.json", comments)
    MODULE.render_report_card_svg(EXAMPLE_DIR / "report-card.svg", video, report, comments)
    MODULE.render_report_card_svg(PREVIEW_PATH, video, report, comments)


if __name__ == "__main__":
    main()
