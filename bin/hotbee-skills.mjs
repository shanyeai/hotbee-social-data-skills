#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const API_BASE = "https://www.smsz.xyz/prod-api";
const PACKAGE_SPEC = "github:shanye1402-hash/hotbee-social-data-skills#v1.1.0";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const skillsDir = path.join(rootDir, "skills");
const args = process.argv.slice(2);
const command = args[0] || "help";

const FEATURES = {
  douyin: {
    skill: "hotbee-douyin-collect",
    title: "Douyin Collect",
    zhName: "HotBee 抖音数据采集",
    keyEnv: ["HOTBEE_API_KEY"],
    summary: "Douyin video, comments, creator, hashtag data.",
    summaryZh: "按中文需求解析抖音视频链接或主页链接，返回视频、评论、达人、粉丝画像、话题等数据。",
    example: 'call douyin --text "解析这个视频的播放量和评论 https://v.douyin.com/xxxx/" --dry-run',
    aiExample: "$hotbee-douyin-collect 解析这个视频的播放量和评论 https://v.douyin.com/xxxx/",
  },
  rednote: {
    skill: "hotbee-rednote-collect",
    title: "Rednote Collect",
    zhName: "HotBee 小红书数据采集",
    keyEnv: ["HOTBEE_API_KEY"],
    summary: "Xiaohongshu/Rednote note content collection.",
    summaryZh: "解析小红书笔记链接，返回笔记内容和已验证接口支持的数据。",
    example: 'call rednote --url "https://www.xiaohongshu.com/explore/xxxx" --dry-run',
    aiExample: "$hotbee-rednote-collect 解析这篇小红书笔记 https://www.xiaohongshu.com/explore/xxxx",
  },
  bilibili: {
    skill: "hotbee-bilibili-collect",
    title: "Bilibili Collect",
    zhName: "HotBee B站数据采集",
    keyEnv: ["HOTBEE_API_KEY"],
    summary: "Bilibili video data collection.",
    summaryZh: "解析 B站视频链接，返回视频数据。",
    example: 'call bilibili --url "https://www.bilibili.com/video/BV..." --dry-run',
    aiExample: "$hotbee-bilibili-collect 解析这个 B站视频 https://www.bilibili.com/video/BV...",
  },
  transcript: {
    skill: "hotbee-transcript",
    title: "Audio/Video Transcript",
    zhName: "HotBee 音视频转文字",
    keyEnv: ["HOTBEE_API_KEY"],
    summary: "Audio/video to text through HotBee speechToText.",
    summaryZh: "把音频或视频 URL 转成文字稿。",
    example: 'call transcript --file-url "https://example.com/video.mp4" --dry-run',
    aiExample: "$hotbee-transcript 把这个视频转成文字稿 https://example.com/video.mp4",
  },
  "hot-rankings": {
    skill: "hotbee-hot-rankings",
    title: "All-Web Hot Rankings",
    zhName: "HotBee 全网热榜",
    keyEnv: ["HOTBEE_API_KEY"],
    summary: "Hot ranking workflow with verified Xiaohongshu, Douyin, Baidu, Weibo, and Bilibili hot endpoints.",
    summaryZh: "获取小红书、抖音、百度、微博、B站热榜数据；已确认 endpoint 为 /tool/hot/<platform>。",
    example: 'call hot-rankings --dry-run --text "获取百度和抖音热榜"',
    aiExample: "$hotbee-hot-rankings 获取今天百度、抖音、小红书热榜数据",
  },
  "douyin-video-report": {
    skill: "hotbee-douyin-video-report",
    title: "Douyin Video Report",
    zhName: "HotBee 抖音视频报告",
    keyEnv: ["HOTBEE_API_KEY"],
    summary: "Generate a local Douyin analysis report, comments, transcript, and report card.",
    summaryZh: "把抖音视频链接整理成 HTML 报告、评论、转写稿和报告卡片。",
    example: "guide douyin-video-report",
    aiExample: "$hotbee-douyin-video-report 解析这个抖音视频并生成完整报告 https://v.douyin.com/xxxx/",
  },
};

const ALIASES = {
  all: "all",
  dy: "douyin",
  xhs: "rednote",
  xiaohongshu: "rednote",
  rednote_collect: "rednote",
  b: "bilibili",
  bili: "bilibili",
  speech: "transcript",
  asr: "transcript",
  hot: "hot-rankings",
  rank: "hot-rankings",
  report: "douyin-video-report",
  "video-report": "douyin-video-report",
};

const HOT_RANKING_PLATFORMS = {
  xiaohongshu: {
    title: "小红书热搜榜",
    endpoint: "/tool/hot/xiaohongshu",
    patterns: [/小红书/i, /xiaohongshu/i, /rednote/i, /\bxhs\b/i],
    source: "OpenAPI contract",
  },
  douyin: {
    title: "抖音热榜",
    endpoint: "/tool/hot/douyin",
    patterns: [/抖音/i, /douyin/i, /\bdy\b/i],
    source: "no-key endpoint probe",
  },
  baidu: {
    title: "百度热榜",
    endpoint: "/tool/hot/baidu",
    patterns: [/百度/i, /baidu/i, /\bbd\b/i],
    source: "no-key endpoint probe",
  },
  weibo: {
    title: "微博热搜榜",
    endpoint: "/tool/hot/weibo",
    patterns: [/微博/i, /weibo/i, /\bwb\b/i],
    source: "no-key endpoint probe",
  },
  bilibili: {
    title: "B站热榜",
    endpoint: "/tool/hot/bilibili",
    patterns: [/B站/i, /哔哩/i, /bilibili/i, /\bbili\b/i],
    source: "no-key endpoint probe",
  },
};

function configureWindowsUtf8Console() {
  if (process.platform !== "win32" || process.env.HOTBEE_SKIP_UTF8_CONSOLE === "1") return;
  spawnSync("cmd.exe", ["/d", "/s", "/c", "chcp 65001 > nul"], { stdio: "ignore", windowsHide: true });
}

configureWindowsUtf8Console();

function normalizeFeature(name) {
  const raw = String(name || "").trim();
  return ALIASES[raw] || raw;
}

function allFeatureNames() {
  return Object.keys(FEATURES);
}

function hasFlag(argv, flag) {
  return argv.includes(flag);
}

function optionValue(argv, name, fallback = "") {
  const index = argv.indexOf(name);
  return index === -1 ? fallback : argv[index + 1] || fallback;
}

function optionValues(argv, name) {
  const values = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === name && argv[i + 1]) values.push(argv[i + 1]);
  }
  return values;
}

function parseOptions(argv) {
  return {
    dryRun: hasFlag(argv, "--dry-run"),
    raw: hasFlag(argv, "--raw"),
    format: optionValue(argv, "--format", "markdown"),
    text: optionValue(argv, "--text", ""),
    platform: optionValue(argv, "--platform", ""),
    platforms: optionValues(argv, "--platform"),
    prompt: optionValue(argv, "--prompt", optionValue(argv, "--text", "")),
    url: optionValue(argv, "--url", ""),
    fileUrl: optionValue(argv, "--file-url", ""),
    videoUrl: optionValue(argv, "--video-url", ""),
    out: optionValue(argv, "--out", ""),
    limit: Number(optionValue(argv, "--limit", "20")) || 20,
    chId: optionValue(argv, "--ch-id", optionValue(argv, "--ch_id", "")),
    page: optionValue(argv, "--page", "1"),
    keyword: optionValue(argv, "--keyword", ""),
    cursor: optionValue(argv, "--cursor", "0"),
    maxCursor: optionValue(argv, "--max-cursor", optionValue(argv, "--maxCursor", "0")),
    sortType: optionValue(argv, "--sort-type", optionValue(argv, "--sortType", "0")),
  };
}

function keyFor() {
  return process.env.HOTBEE_API_KEY || "";
}

function redact(value) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redact);
  return Object.fromEntries(Object.entries(value).map(([k, v]) => {
    const lower = k.toLowerCase();
    return [k, lower === "key" || lower.includes("authorization") || lower.includes("api-key") ? "****" : redact(v)];
  }));
}

function usage() {
  console.log(`HotBee Social Data Skills / HotBee 社媒数据技能包

安装全部技能:
  npx -y ${PACKAGE_SPEC} install

安装单个技能:
  npx -y ${PACKAGE_SPEC} install douyin
  npx -y ${PACKAGE_SPEC} install douyin-video-report

查看安装后的中文引导:
  npx -y ${PACKAGE_SPEC} guide
  npx -y ${PACKAGE_SPEC} guide douyin

直接调用功能:
  npx -y ${PACKAGE_SPEC} call douyin --text "解析这个视频的播放量 https://v.douyin.com/xxxx/" --dry-run

Commands:
  list
  guide [all|${allFeatureNames().join("|")}]
  install [all|${allFeatureNames().join("|")}]
  call <feature> [--dry-run] [--format markdown|json]
`);
}

function featureStatusLabel(opts) {
  if (opts?.dryRun) return "计划安装";
  if (opts?.guideOnly) return "可用";
  return "已安装";
}

function claudeExample(meta) {
  const prefix = `$${meta.skill}`;
  if (meta.aiExample.startsWith(prefix)) return `/${meta.skill}${meta.aiExample.slice(prefix.length)}`;
  return `/${meta.skill} ${meta.aiExample}`;
}

function selectedFeatures(target) {
  return target === "all" ? allFeatureNames() : [target];
}

function formatFeatureLines(features, opts = {}) {
  const label = featureStatusLabel(opts);
  return features.map((feature) => {
    const meta = FEATURES[feature];
    return `  - ${label}: ${meta.zhName} (${meta.skill})\n    功能: ${meta.summaryZh}`;
  }).join("\n");
}

function printInstallGuide(features, roots, opts = {}) {
  const rootLines = roots.map((root) => `  - ${root}`).join("\n");
  const selected = features.filter((feature) => FEATURES[feature]);
  const keyLine = "HOTBEE_API_KEY";
  const directLines = selected.map((feature) => `  - ${FEATURES[feature].zhName}: npx -y ${PACKAGE_SPEC} ${FEATURES[feature].example}`).join("\n");
  const aiLines = selected.map((feature) => {
    const meta = FEATURES[feature];
    return `  - Codex: ${meta.aiExample}\n    Claude Code: ${claudeExample(meta)}`;
  }).join("\n");
  const title = opts.dryRun
    ? "HotBee 社媒数据技能包 dry-run 完成，未写入文件。"
    : opts.guideOnly
      ? "HotBee 社媒数据技能包使用引导"
      : "HotBee 社媒数据技能包已安装完成。";

  console.log(`
${title}

1. 确认安装位置
${rootLines || "  - 未检测到安装目录"}

2. 确认可用技能和中文名
${formatFeatureLines(selected, opts)}

3. 设置 HotBee 卡密
   付费接口只读取 HOTBEE_API_KEY 环境变量，不会把真实卡密写进技能包。
   所有付费接口只读取: ${keyLine}

   PowerShell:
   [Environment]::SetEnvironmentVariable("HOTBEE_API_KEY", "YOUR_KEY", "User")

   macOS/Linux:
   export HOTBEE_API_KEY="YOUR_KEY"

   设置后请重启 Codex、Claude Code、终端或正在使用的 AI 客户端。

4. 在 AI 客户端里调用
${aiLines || "  - 先运行 list 查看可用技能。"}

   通用 AI 客户端:
   把 ~/.agents/skills/<skill-name>/SKILL.md 作为上下文，告诉 AI 使用对应技能处理你的中文需求。

5. 直接用命令调用
${directLines || "  - 先运行 list 查看可用命令。"}

6. 常见排查
   - 提示缺少 key: 先设置 HOTBEE_API_KEY，然后重启终端或 AI 客户端。
   - 中文乱码: Windows 终端建议使用 Windows Terminal / PowerShell 7；本安装器会自动切到 UTF-8 控制台。
   - 不想消耗点数: 先加 --dry-run 预览请求。
   - 只想看某个技能: npx -y ${PACKAGE_SPEC} guide douyin
   - 查看完整清单: npx -y ${PACKAGE_SPEC} list
`);
}

function commandExists(name) {
  const probe = process.platform === "win32" ? "where" : "command";
  const probeArgs = process.platform === "win32" ? [name] : ["-v", name];
  return spawnSync(probe, probeArgs, { stdio: "ignore", shell: process.platform !== "win32" }).status === 0;
}

function targetRoots() {
  const home = os.homedir();
  const roots = [path.join(home, ".agents", "skills")];
  if (fs.existsSync(path.join(home, ".claude")) || commandExists("claude") || hasFlag(args, "--claude")) {
    roots.push(path.join(home, ".claude", "skills"));
  }
  return roots;
}

function copySkill(skillName, root, opts) {
  const source = path.join(skillsDir, skillName);
  const target = path.join(root, skillName);
  if (opts.dryRun) {
    console.log(`[dry-run] Would install ${skillName} -> ${target}`);
    return;
  }
  if (!fs.existsSync(source)) throw new Error(`Missing skill directory: ${source}`);
  if (fs.existsSync(target)) {
    if (!opts.force) {
      console.log(`[skip] ${target} already exists. Use --force to replace.`);
      return;
    }
    fs.rmSync(target, { recursive: true, force: true });
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
  console.log(`[ok] Installed ${skillName} -> ${target}`);
}

function installCommand() {
  const targetArg = args.slice(1).find((arg) => !arg.startsWith("--")) || "all";
  const target = normalizeFeature(targetArg);
  const opts = { dryRun: hasFlag(args, "--dry-run"), force: hasFlag(args, "--force") };
  const features = selectedFeatures(target);
  const roots = targetRoots();
  for (const feature of features) {
    if (!FEATURES[feature]) throw new Error(`Unknown feature: ${feature}`);
    for (const root of roots) copySkill(FEATURES[feature].skill, root, opts);
  }
  printInstallGuide(features, roots, opts);
}

function listCommand() {
  for (const [id, meta] of Object.entries(FEATURES)) {
    console.log(`${id}`);
    console.log(`  中文名: ${meta.zhName}`);
    console.log(`  Skill: ${meta.skill}`);
    console.log(`  说明: ${meta.summaryZh}`);
    console.log(`  命令: npx -y ${PACKAGE_SPEC} ${meta.example}`);
    console.log("");
  }
}

function guideCommand() {
  const targetArg = args.slice(1).find((arg) => !arg.startsWith("--")) || "all";
  const target = normalizeFeature(targetArg);
  const features = selectedFeatures(target);
  for (const feature of features) {
    if (!FEATURES[feature]) throw new Error(`Unknown feature: ${feature}`);
  }
  printInstallGuide(features, targetRoots(), { guideOnly: true });
}

function urlWithParams(endpoint, params) {
  const url = new URL(`${API_BASE}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
    else url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function postQuery(endpoint, params) {
  const response = await fetch(urlWithParams(endpoint, params), { method: "POST" });
  return parseResponse(response);
}

async function getQuery(endpoint, params) {
  const response = await fetch(urlWithParams(endpoint, params), { method: "GET" });
  return parseResponse(response);
}

async function parseResponse(response) {
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { httpStatus: response.status, ok: response.ok, data };
}

function extractFirstUrl(text) {
  return (String(text || "").match(/https?:\/\/[^\s"'<>，。；、）)]+/i)?.[0] || "").replace(/[.,，。；;!?！？]+$/g, "");
}

function douyinPlan(opts, key) {
  const text = opts.text || opts.prompt;
  const url = opts.url || extractFirstUrl(text);
  const body = {};
  if (url) body.url = url;
  const endpoints = [];
  const isUser = /douyin\.com\/user\//i.test(url);
  if (opts.chId || /话题视频|话题列表/.test(text)) {
    endpoints.push({ title: "抖音话题视频列表", endpoint: "/tool/douyin/Dy_hashtag_video_list_VIP", body: { ch_id: opts.chId, maxCursor: opts.maxCursor, sortType: opts.sortType, key } });
  } else if (/话题/.test(text)) {
    endpoints.push({ title: "抖音话题详情", endpoint: "/tool/douyin/Dy_hashtag_detail_VIP", body: { ch_id: opts.chId, key } });
  } else if (/关键词|搜索/.test(text) && !url) {
    endpoints.push({
      title: "抖音关键词搜索",
      unsupported: true,
      reason: "HotBee public catalog lists Dy_search_video_VIP, but the current backend probe returns 404. Do not call this endpoint until HotBee provides an updated contract.",
    });
  } else if (isUser) {
    if (/粉丝画像|年龄|地域|性别|兴趣/.test(text)) endpoints.push({ title: "抖音粉丝画像", endpoint: "/tool/douyin/Dy_fans_portrai_VIP", body: { ...body, key } });
    if (/前20|小程序|免卡密/.test(text)) endpoints.push({ title: "抖音主页前20条视频及小程序", endpoint: "/tool/douyin/Dy_user_video_and_app", body });
    if (/达人资料|账号资料|主页资料|用户资料|基础资料/.test(text)) endpoints.push({ title: "抖音达人资料", endpoint: "/tool/douyin/Dy_user_profile_VIP", body: { ...body, userUrl: url, key } });
    if (/作品|视频|分页|增量|全量/.test(text)) endpoints.push({ title: "抖音达人主页作品列表", endpoint: "/tool/douyin/Dy_user_post_videos_Vip2", body: { ...body, userUrl: url, maxCursor: opts.maxCursor, key } });
    if (!endpoints.length) endpoints.push({ title: "抖音达人综合数据免卡密", endpoint: "/tool/douyin/Dy_user_videos_info", body });
  } else {
    if (/评论/.test(text)) endpoints.push({ title: "抖音全部评论采集", endpoint: "/tool/douyin/Dy_video_all_comments_VIP", body: { video_url: url, page: opts.page, key } });
    if (/二级评论|评论回复|回复/.test(text)) endpoints.push({
      title: "抖音二级评论旧接口",
      unsupported: true,
      reason: "HotBee public catalog lists Dy_video_comments_reply_VIP, but the current backend probe returns 404. The caller uses Dy_video_all_comments_VIP for confirmed comment collection.",
    });
    if (/播放量|点赞|评论数|核心数据/.test(text)) endpoints.push({ title: "抖音播放量", endpoint: "/tool/douyin/Dy_video_info_VIP", body: { ...body, key } });
    if (/基础信息|标题|作者|封面|详情/.test(text) || !endpoints.length) endpoints.push({ title: "抖音视频基础信息", endpoint: "/tool/douyin/Dy_video_info", body });
  }
  return endpoints;
}

function hotRankingsPlan(opts, key) {
  const text = opts.text || opts.prompt;
  const requested = new Set();
  const platformTokens = [
    ...opts.platforms,
    ...String(opts.platform || "").split(/[,\s，、]+/),
  ].filter(Boolean);

  for (const token of platformTokens) {
    const normalized = token.toLowerCase();
    if (normalized === "all" || normalized === "全部" || normalized === "全网") {
      Object.keys(HOT_RANKING_PLATFORMS).forEach((platform) => requested.add(platform));
      continue;
    }
    for (const [platform, meta] of Object.entries(HOT_RANKING_PLATFORMS)) {
      if (platform === normalized || meta.patterns.some((pattern) => pattern.test(token))) requested.add(platform);
    }
  }

  for (const [platform, meta] of Object.entries(HOT_RANKING_PLATFORMS)) {
    if (meta.patterns.some((pattern) => pattern.test(text))) requested.add(platform);
  }

  const unsupportedHints = [];
  const unsupportedPatterns = [
    [/知乎|zhihu/i, "知乎"],
    [/头条|toutiao|今日头条/i, "头条"],
    [/快手|kuaishou/i, "快手"],
    [/贴吧|tieba/i, "贴吧"],
  ];
  for (const [pattern, label] of unsupportedPatterns) {
    if (pattern.test(text) && !Array.from(requested).some((platform) => HOT_RANKING_PLATFORMS[platform].patterns.some((p) => p.test(label)))) {
      unsupportedHints.push(label);
    }
  }

  if (!requested.size && !unsupportedHints.length && /全网|全部|所有|各平台|多平台|这些|热榜|热搜|trending|ranking/i.test(text)) {
    Object.keys(HOT_RANKING_PLATFORMS).forEach((platform) => requested.add(platform));
  }
  if (!requested.size && !unsupportedHints.length) requested.add("xiaohongshu");

  const requests = Array.from(requested).map((platform) => {
    const meta = HOT_RANKING_PLATFORMS[platform];
    return { title: meta.title, transport: "get", endpoint: meta.endpoint, params: { key }, source: meta.source };
  });
  if (unsupportedHints.length) {
    requests.push({
      title: "未验证平台热榜",
      unsupported: true,
      reason: `暂未确认这些平台的 HotBee endpoint: ${unsupportedHints.join("、")}。已确认平台: 小红书、抖音、百度、微博、B站。`,
    });
  }
  return requests;
}

function buildRequests(feature, opts, key) {
  if (feature === "douyin") return douyinPlan(opts, key).map((item) => item.unsupported ? item : ({ ...item, transport: "query", params: item.body }));
  if (feature === "rednote") return [{ title: "小红书笔记采集", transport: "query", endpoint: "/tool/rednote/xhs_note_content", params: { key, note_url: opts.url || extractFirstUrl(opts.text) } }];
  if (feature === "bilibili") return [{ title: "B站视频数据采集", transport: "query", endpoint: "/tool/bilibili/bilibili_video_data", params: { key, video_url: opts.url || extractFirstUrl(opts.text) } }];
  if (feature === "transcript") return [{ title: "音视频转文字", transport: "query", endpoint: "/tool/speech/speechToText", params: { key, file_url: opts.fileUrl || "", video_url: opts.videoUrl || opts.url || extractFirstUrl(opts.text) } }];
  if (feature === "hot-rankings") return hotRankingsPlan(opts, key);
  throw new Error(`Unknown feature: ${feature}`);
}

function requestNeedsKey(request) {
  return JSON.stringify({ params: request.params || {}, fields: request.fields || {} }).includes('"key"');
}

async function executeRequest(request, opts) {
  if (request.transport === "get") return getQuery(request.endpoint, request.params || {});
  if (request.transport === "query") return postQuery(request.endpoint, request.params || {});
  throw new Error(`Unsupported transport: ${request.transport}`);
}

function render(result, opts) {
  const safe = redact(result);
  if (opts.format === "json") return `${JSON.stringify(safe, null, 2)}\n`;
  const lines = [`# ${safe.title}`, "", `- Feature: \`${safe.feature}\``, `- Mode: ${opts.dryRun ? "dry-run" : "live"}`];
  for (const item of safe.results) {
    lines.push("", `## ${item.title}`);
    if (item.unsupported) {
      lines.push(`- Status: unsupported`, `- Reason: ${item.reason}`);
      continue;
    }
    lines.push(`- Endpoint: \`${item.endpoint}\``, `- Transport: ${item.transport}`, `- Status: ${item.status || "ready"}`);
    if (item.skipped) lines.push(`- Reason: ${item.reason}`);
    lines.push("", "```json", JSON.stringify(item.request || item.response || {}, null, 2), "```");
  }
  return `${lines.join("\n")}\n`;
}

function writeOut(file, content, format) {
  const bom = process.platform === "win32" && format !== "json" ? "\uFEFF" : "";
  fs.writeFileSync(file, `${bom}${content}`, "utf8");
}

async function callCommand() {
  const feature = normalizeFeature(args[1] || "");
  if (!FEATURES[feature]) throw new Error(`Unknown feature: ${args[1] || ""}`);
  if (feature === "douyin-video-report") {
    throw new Error("抖音视频报告请通过安装后的 Skill 调用，或直接运行 skills/hotbee-douyin-video-report/scripts/douyin_video_report.py。");
  }
  const opts = parseOptions(args.slice(2));
  const key = keyFor(feature);
  const requests = buildRequests(feature, opts, key);
  const results = [];
  for (const request of requests) {
    if (request.unsupported) {
      results.push(request);
      continue;
    }
    const envelope = { title: request.title, endpoint: request.endpoint, transport: request.transport, request: { params: request.params, fields: request.fields } };
    if (requestNeedsKey(request) && !key && !opts.dryRun) {
      results.push({ ...envelope, skipped: true, status: "missing-key", reason: "缺少 HOTBEE_API_KEY。请先设置环境变量 HOTBEE_API_KEY，然后重启终端或 AI 客户端。" });
      continue;
    }
    if (opts.dryRun) {
      results.push({ ...envelope, status: "dry-run" });
      continue;
    }
    const response = await executeRequest(request, opts);
    results.push({ ...envelope, status: `HTTP ${response.httpStatus}`, response: response.data });
  }
  const output = { title: FEATURES[feature].zhName || FEATURES[feature].title, feature, results };
  const rendered = render(output, opts);
  if (opts.out) writeOut(opts.out, rendered, opts.format);
  process.stdout.write(rendered);
}

try {
  if (command === "help" || command === "--help" || command === "-h") usage();
  else if (command === "list") listCommand();
  else if (command === "guide") guideCommand();
  else if (command === "install") installCommand();
  else if (command === "call") await callCommand();
  else {
    usage();
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
