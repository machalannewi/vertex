# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for the project: Session Replay and Error Tracking were already enabled, Support was enabled, and health, error, and support signal sources were enabled. The scout troop, two custom scouts, and two Replay Vision monitors are active.

Findings will begin appearing in the [Self-driving inbox](https://eu.posthog.com/project/258185/inbox) within about 30 minutes as scouts run and recordings arrive.

## AI data processing

Approved by the setup wizard.

## GitHub

The PostHog GitHub App was already connected before this run. GitHub Issues was not selected as a connected-tool source, so no GitHub Issues responder was enabled.

## Products enabled

| Product | Result | Notes |
|---|---|---|
| Session Replay | Already enabled | Browser initialization does not disable recording. No recordings were found yet. |
| Error Tracking | Already enabled | Browser initialization explicitly enables exception capture. |
| Support (Conversations) | Enabled | An inbound email, inbox, or Slack channel is still required before support tickets can arrive. |

## Signal sources

| Signal source | Action | Notes |
|---|---|---|
| `health_checks` / `health_issue` | Enabled | Watches PostHog setup and instrumentation health. |
| `error_tracking` / `issue_created` | Enabled | Routes newly created error issues. |
| `error_tracking` / `issue_reopened` | Enabled | Routes recurring error issues. |
| `error_tracking` / `issue_spiking` | Enabled | Routes material error-volume spikes. |
| `conversations` / `ticket` | Enabled | Dormant until a Support channel is connected. |
| `signals_scout` / `cross_source_issue` | Skipped | Scout findings are enabled by default; no row is needed. |
| `session_replay` / `session_analysis_cluster` | Skipped | Retired route; Replay Vision scanners provide replay coverage. |

## Connected tools

No external connected tool was selected. No warehouse source or external-tool responder was created in this run.

| Tool | Status |
|---|---|
| GitHub Issues, Linear, Jira, Sentry, Zendesk, and all other catalog connectors | Not used |

## Scout troop

**Active scouts (6):**

| Scout | Why it is active |
|---|---|
| General | Cross-product patterns and gaps. |
| Product analytics | Learning-product engagement and saved flow regressions. |
| Web analytics | Traffic, attribution, landing-page health, and 404 patterns. |
| Web vitals | Page-experience and Core Web Vitals regressions. |
| Learner journey health | Custom monitor for course discovery through lesson completion. |
| Search quality and unmet learning demand | Custom monitor for search-to-lesson engagement and sustained unmet demand. |

**Paused scouts (23):**

| Scout | Reason paused |
|---|---|
| AI observability | No LLM observability usage was found. |
| Anomaly detection | Fresh project has no established insight/dashboard baseline. |
| APM | No trace-based backend monitoring evidence was found. |
| Conversations | No inbound Support channel is connected yet. |
| CSP violations | No CSP-reporting evidence was found. |
| Customer analytics | No account/group analytics evidence was found. |
| Data pipelines | No CDP or pipeline usage was found. |
| Data warehouse | No warehouse source was connected. |
| Error tracking | Covered by the native Error Tracking signal sources. |
| Experiments | No active experiment usage was found. |
| Feature flags | No active feature-flag usage was found. |
| Inbox validation | Fresh setup has no shipped inbox fixes to validate. |
| Insight alerts | No saved insight-alert usage was found. |
| Logs | No PostHog Logs usage was found. |
| MCP tool calls | No relevant MCP telemetry surface was identified. |
| Observability gaps | General scout provides broad coverage while the project establishes data. |
| PR follow-up | No delivered Self-driving fixes exist yet to assess. |
| Replay Vision | No accumulated scanner observations yet; the scanners themselves provide current replay coverage. |
| Revenue analytics | No payment or revenue-data surface was found. |
| Session replay | Covered by Replay Vision scanners. |
| Skills store | No skills-store maintenance surface was identified. |
| Surveys | No survey usage was found. |
| Tasks | No PostHog Tasks usage was found. |

**Scout-run budget:** 100 runs/day maximum; 0 used today and 100 remaining when checked. The project banner states: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

## Custom scouts

| Custom scout | Watches | Discriminator | Why it is separate |
|---|---|---|---|
| `signals-scout-learner-journey-health` | Course discovery, lesson entry, video engagement, and completion | A sustained step-to-step progression failure while the upstream step remains active | Product analytics watches generic saved flows; this scout understands the learning journey and also catches stage-volume failures. |
| `signals-scout-search-quality-demand` | Search-to-result-selection and search-to-lesson engagement | Sustained, demand-weighted absence of useful onward engagement or confirmed zero-result demand | Web and product analytics do not own unmet learning-content demand or search-quality failure patterns. |

The scouts first inspect the live event schema and close quietly until the required events exist. They do not store or report raw search terms or other user-entered content.

Surfaces ruled out: error tracking and session replay are already covered by their dedicated native/replay routes; revenue, surveys, AI observability, logs, flags, experiments, and warehouse monitoring had no usage evidence.

If a custom scout becomes noisy, set `emit: false` on its scout configuration in PostHog to keep it running in dry-run mode without filing inbox reports.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes confirmed findings to the inbox. Replay Vision scanners are the only configuration in this setup that consumes Replay Vision quota; findings arrive at half weight and need independent corroboration before promotion into a report.

| Status | Scanner | Watches | Query scope | Sampling | Estimate |
|---|---|---|---|---|---|
| Created | [Course experience breakage](https://eu.posthog.com/project/258185/replay-vision/01a0e136-329a-7153-ae8e-164bb59b2d2b) | Visible breakage while browsing courses, expanding modules, or starting lessons | URLs containing `/courses`, covering the implemented course catalog and course-detail/start flow | 50% | 0 observations/month; 0 credits/month from the current 7-day sample |
| Created | [Course browsing frustration](https://eu.posthog.com/project/258185/replay-vision/01a0e136-32bf-73e4-aad6-68ac5127b86f) | Clear on-screen struggle such as repeated clicks, non-responsive controls, and abandoned navigation | `$rageclick` only; intentionally no URL filter to avoid widening overlap with the breakage monitor | 100% | 0 observations/month; 0 credits/month from the current 7-day sample |

Replay Vision quota had 2,500 credits remaining when checked, with no usage or projected scanner spend. No session recordings were found yet, so both scanners are armed and will start working as soon as recordings begin.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so the enabled Support responder can receive tickets.
- [ ] Generate browser traffic with Session Replay enabled; the new Replay Vision scanners and replay-driven Self-driving findings begin once recordings arrive.
- [ ] Reauthorize the MCP connection with `property_definition:read` if you want future setup runs to independently inspect event-schema details. This run created the required `$rageclick`-gated monitor from the locked Replay Vision brief, but could not verify that event through the schema endpoint.
- [ ] Rate the first scanner observations in Replay Vision to help PostHog generate configuration recommendations.

## What happens next

The scout coordinator picks up fresh configurations within about 30 minutes. Scout runs draw from the project’s daily budget, findings cluster into reports in the [Self-driving inbox](https://eu.posthog.com/project/258185/inbox), and immediately actionable findings can start coding tasks.

## Files created

- `posthog-self-driving-report.md`
