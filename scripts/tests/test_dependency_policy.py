"""BA-SEC-DEP-001: estate-local manifest and policy-negative source checks.

This is a source gate, NOT proof of current GitHub vulnerability alerts,
Dependabot service runs, scanner coverage, or protected deployments.
Requires pinned PyYAML fixture runtime; contains no network calls/secrets.
"""
from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import re
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[2]
CONFIG = ROOT / ".github/dependabot.yml"
WORKSPACE = ROOT / "pnpm-workspace.yaml"
PACKAGE = ROOT / "package.json"
DOCKERFILE = ROOT / "Dockerfile"
SECURITY = ROOT / ".github/workflows/security.yml"
POLICY_CALLER = ROOT / ".github/workflows/enforce-dependabot-config.yml"
OWNERS = ROOT / ".github/CODEOWNERS"
DOC = ROOT / "docs/security/dependency-maintenance.md"
REQUIRED = {("github-actions", "/"), ("npm", "/"), ("docker", "/")}
POLICY_ID = "BA-SEC-DEP-001"


def policy_violations(doc: object) -> list[str]:
    """Reject unsafe version-update automation and false config coverage."""
    errors: list[str] = []
    if not isinstance(doc, dict) or doc.get("version") != 2:
        return ["version"]
    updates = doc.get("updates")
    if not isinstance(updates, list) or not updates:
        return ["updates"]
    seen = set()
    for index, update in enumerate(updates):
        if not isinstance(update, dict):
            errors.append(f"entry:{index}")
            continue
        ecosystem = update.get("package-ecosystem")
        path = update.get("directory")
        if not isinstance(ecosystem, str) or not isinstance(path, str):
            errors.append("missing ecosystem/directory")
            continue
        key = (ecosystem, path)
        if key in seen:
            errors.append("duplicate ecosystem")
        seen.add(key)
        if not path.startswith("/") or ".." in path.split("/"):
            errors.append("unsafe directory")
        if "target-branch" in update:
            errors.append("target-branch disables security-update routing")
        schedule = update.get("schedule")
        if not isinstance(schedule, dict) or schedule.get("interval") not in (
            "daily", "weekly", "monthly", "quarterly"
        ):
            errors.append("schedule")
        elif schedule.get("interval") == "weekly" and (
            schedule.get("timezone") != "Africa/Johannesburg"
            or not schedule.get("day") or not schedule.get("time")
        ):
            errors.append("schedule metadata")
        limit = update.get("open-pull-requests-limit")
        if type(limit) is not int or limit <= 0:
            errors.append("PR limit")
        if not isinstance(update.get("labels"), list) or not update.get("labels"):
            errors.append("labels")
        message = update.get("commit-message")
        if not isinstance(message, dict) or not message.get("prefix"):
            errors.append("commit-message")
        groups = update.get("groups", {})
        if not isinstance(groups, dict):
            errors.append("groups")
            groups = {}
        for group in groups.values():
            if not isinstance(group, dict) or group.get("applies-to") != "version-updates":
                errors.append("unscoped grouping")
                continue
            types = group.get("update-types")
            if not isinstance(types, list) or not types or "major" in types:
                errors.append("unbounded grouping")
            elif any(x not in ("patch", "minor") for x in types):
                errors.append("unknown update-type")
            if not isinstance(group.get("patterns"), list) or not group["patterns"]:
                errors.append("empty patterns")
        for ignore in update.get("ignore", []):
            if not isinstance(ignore, dict) or not ignore.get("update-types"):
                errors.append("unconditional ignore")
            elif not set(ignore["update-types"]).issubset({
                "version-update:semver-major",
                "version-update:semver-minor",
                "version-update:semver-patch",
            }):
                errors.append("invalid ignore types")
        manifest_dir = ROOT / path.lstrip("/")
        if not manifest_dir.is_dir():
            errors.append("missing directory")
        elif ecosystem == "npm" and not (manifest_dir / "package.json").is_file():
            errors.append("missing npm manifest")
        elif ecosystem == "docker" and not (manifest_dir / "Dockerfile").is_file():
            errors.append("missing Dockerfile")
        elif ecosystem == "github-actions" and not (ROOT / ".github/workflows").is_dir():
            errors.append("missing Actions workflow")
    if not REQUIRED.issubset(seen):
        errors.append("missing mandatory manifest ecosystem")
    return errors


class EstateDependencyMaintenancePolicyTests(unittest.TestCase):
    def setUp(self):
        self.actual = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))

    def reject(self, category: str, mutation):
        candidate = deepcopy(self.actual)
        mutation(candidate)
        self.assertIn(category, policy_violations(candidate))

    def test_real_config_covers_observed_ecosystems(self):
        self.assertEqual(policy_violations(self.actual), [])

    def test_no_redundant_target_branch(self):
        self.reject("target-branch disables security-update routing",
                    lambda c: c["updates"][0].update({"target-branch": "main"}))

    def test_missing_ecosystem_is_rejected(self):
        self.reject("missing mandatory manifest ecosystem",
                    lambda c: c.update({"updates": [
                        u for u in c["updates"] if u["package-ecosystem"] != "docker"
                    ]}))

    def test_major_version_auto_group_is_rejected(self):
        def mutate(c):
            u = c["updates"][0]
            u["groups"] = {"all": {
                "applies-to": "version-updates",
                "patterns": ["*"],
                "update-types": ["major", "minor", "patch"],
            }}
        self.reject("unbounded grouping", mutate)

    def test_unscoped_security_and_version_group_is_rejected(self):
        self.reject("unscoped grouping",
                    lambda c: c["updates"][0].update({
                        "groups": {"all": {"patterns": ["*"]}}
                    }))

    def test_unconditional_ignore_is_rejected(self):
        self.reject("unconditional ignore",
                    lambda c: c["updates"][0].update({
                        "ignore": [{"dependency-name": "vulnerable"}]
                    }))

    def test_invalid_directory_is_rejected(self):
        self.reject("missing directory",
                    lambda c: c["updates"][0].update({"directory": "/does-not-exist"}))

    def test_disabled_updates_are_rejected(self):
        self.reject("PR limit",
                    lambda c: c["updates"][0].update({"open-pull-requests-limit": 0}))

    def test_duplicate_ecosystem_route_is_rejected(self):
        self.reject("duplicate ecosystem",
                    lambda c: c["updates"].append(deepcopy(c["updates"][0])))

    def test_package_manager_and_lockfile_have_real_manifests(self):
        import json
        package = json.loads(PACKAGE.read_text(encoding="utf-8"))
        self.assertTrue(package["packageManager"].startswith("pnpm@"))
        self.assertTrue((ROOT / "pnpm-lock.yaml").is_file())
        self.assertTrue(DOCKERFILE.is_file())
        self.assertTrue((ROOT / ".github/workflows/ci.yml").is_file())

    def test_indefinite_ghsa_audit_suppression_does_not_return(self):
        text = WORKSPACE.read_text(encoding="utf-8")
        parsed = yaml.safe_load(text)
        self.assertNotIn("auditConfig", parsed, "Global audit exceptions require explicit approved expiry")

    def test_daily_full_dependency_audit_remains_active(self):
        source = SECURITY.read_text(encoding="utf-8")
        self.assertIn("pnpm audit --audit-level high", source)
        self.assertNotIn("pnpm audit --prod", source)
        self.assertRegex(source, r'cron:\s*["\']?\d+\s+\d+\s+\*\s+\*\s+\*')

    def test_pinned_reusable_validator_and_ecosystems(self):
        source = POLICY_CALLER.read_text(encoding="utf-8")
        self.assertRegex(source, r'enforce-dependabot-config\.yml@[a-f0-9]{40}')
        self.assertIn('required-ecosystems: "github-actions,npm,docker"', source)
        self.assertNotIn('policy-level: "strict"', source)

    def test_owners_include_independent_security_review(self):
        owners = OWNERS.read_text(encoding="utf-8")
        self.assertIn("/.github/ @baobab-platform/platform-engineering @baobab-platform/security", owners)
        self.assertIn("/docs/security/dependency-maintenance.md @baobab-platform/platform-engineering @baobab-platform/security", owners)

    def test_policy_document_classifies_evidence_without_runtime_approval(self):
        record = DOC.read_text(encoding="utf-8")
        self.assertIn("SOURCE_COMMITTED", record)
        self.assertIn("CI_VERIFIED", record)
        self.assertIn("SECURITY_ALERT_PATH_VERIFIED", record)
        self.assertIn("BLOCKED", record)
        self.assertIn(POLICY_ID, record)

    def test_zuribeans_corepack_is_not_mutable_latest(self):
        if ROOT.name == "zuribeans":
            docker = DOCKERFILE.read_text(encoding="utf-8")
            self.assertNotIn("corepack@latest", docker)
            self.assertIn("corepack@0.36.0", docker)


if __name__ == "__main__":
    unittest.main()
