import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPT_PATH = (
    Path(__file__).resolve().parents[1]
    / "skills"
    / "hotbee-douyin-video-report"
    / "scripts"
    / "douyin_video_report.py"
)
SPEC = importlib.util.spec_from_file_location("douyin_video_report", SCRIPT_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class PublicSafetyTests(unittest.TestCase):
    def test_redacts_secret_values_and_query_parameters(self):
        secret = "hb-secret-12345"
        value = f"https://api.example.com/task?key={secret}&page=1"
        redacted = MODULE.redact_sensitive_text(value, [secret])
        self.assertNotIn(secret, redacted)
        self.assertIn("[REDACTED]", redacted)

    def test_write_json_scrubs_sensitive_fields(self):
        secret = "hb-secret-12345"
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "raw.json"
            MODULE.write_json(target, {"key": secret, "nested": {"url": f"https://api.example.com/?token={secret}"}})
            saved = target.read_text(encoding="utf-8")
        self.assertNotIn(secret, saved)
        self.assertEqual(json.loads(saved)["key"], "[REDACTED]")

    def test_base_url_requires_https_except_loopback(self):
        self.assertEqual(MODULE.validate_base_url("https://www.smsz.xyz/prod-api/"), "https://www.smsz.xyz/prod-api")
        self.assertEqual(MODULE.validate_base_url("http://127.0.0.1:8080/api"), "http://127.0.0.1:8080/api")
        with self.assertRaises(ValueError):
            MODULE.validate_base_url("http://api.example.com")
        with self.assertRaises(ValueError):
            MODULE.validate_base_url("https://user:pass@api.example.com")

    def test_media_url_rejects_local_and_non_https_sources(self):
        self.assertTrue(MODULE.is_allowed_media_url("https://cdn.example.com/image.jpg"))
        self.assertFalse(MODULE.is_allowed_media_url("http://cdn.example.com/image.jpg"))
        self.assertFalse(MODULE.is_allowed_media_url("https://127.0.0.1/image.jpg"))
        self.assertFalse(MODULE.is_allowed_media_url("file:///etc/passwd"))

    def test_no_third_party_unshortener(self):
        source = SCRIPT_PATH.read_text(encoding="utf-8")
        self.assertNotIn("unshorten.me", source)


if __name__ == "__main__":
    unittest.main()
