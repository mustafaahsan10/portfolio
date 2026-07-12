---
title: "LLM Evaluation Harness"
summary: "An automated eval framework that scores prompt and model changes against a golden dataset before they ship."
tech: ["Python", "Anthropic API", "Pytest", "Streamlit"]
role: "Designed and built the eval framework and dashboard"
outcome: "Caught regressions pre-deploy and made model/prompt changes data-driven."
demoUrl: ""
githubUrl: "https://github.com/mustafaahsan10"
youtubeId: ""
featured: true
order: 2
---

<!-- EDIT ME: this is placeholder copy. Replace with your real project. -->

## Problem

Prompt and model changes shipped on vibes. A tweak that improved one case would
silently break three others, and nobody noticed until users complained.

## Approach

I built an evaluation harness that runs every candidate prompt/model against a
curated golden dataset, scoring outputs with a mix of exact-match, semantic
similarity, and LLM-as-judge metrics. Results surface in a Streamlit dashboard
with per-case diffs, and the suite runs in CI so regressions block the merge.

## Outcome

Prompt and model changes became measurable instead of anecdotal, and regressions
were caught before they reached production.
