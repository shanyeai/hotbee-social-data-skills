import json
import re
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SKILLS_ROOT = REPO_ROOT / "skills"
EXPECTED_SKILLS = {
    "hotbee-bilibili-collect",
    "hotbee-douyin-collect",
    "hotbee-douyin-video-report",
    "hotbee-hot-rankings",
    "hotbee-rednote-collect",
    "hotbee-transcript",
}


class RepositoryContractTests(unittest.TestCase):
    def test_exact_public_skill_set(self):
        actual = {path.name for path in SKILLS_ROOT.iterdir() if path.is_dir()}
        self.assertEqual(actual, EXPECTED_SKILLS)

    def test_each_skill_has_valid_frontmatter_and_ui_metadata(self):
        for skill_name in sorted(EXPECTED_SKILLS):
            with self.subTest(skill=skill_name):
                skill_file = SKILLS_ROOT / skill_name / "SKILL.md"
                source = skill_file.read_text(encoding="utf-8")
                match = re.match(r"^---\s*\n(.*?)\n---\s*\n", source, re.DOTALL)
                self.assertIsNotNone(match)
                frontmatter = match.group(1)
                self.assertRegex(frontmatter, rf"(?m)^name:\s*{re.escape(skill_name)}\s*$")
                self.assertRegex(frontmatter, r"(?m)^description:\s*\S.+$")
                self.assertTrue((SKILLS_ROOT / skill_name / "agents" / "openai.yaml").is_file())

    def test_public_docs_do_not_reference_hidden_runtimes(self):
        forbidden = ("hotbee-api-skills", "hotbee-douyin-api-skill")
        text_files = [REPO_ROOT / "README.md"] + list(SKILLS_ROOT.rglob("*.md"))
        combined = "\n".join(path.read_text(encoding="utf-8") for path in text_files)
        for value in forbidden:
            self.assertNotIn(value, combined)

    def test_package_exposes_the_public_cli(self):
        package = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
        self.assertEqual(package["name"], "hotbee-social-data-skills")
        self.assertEqual(package["version"], "1.1.0")
        self.assertEqual(package["bin"]["hotbee-social-skills"], "bin/hotbee-skills.mjs")


if __name__ == "__main__":
    unittest.main()
