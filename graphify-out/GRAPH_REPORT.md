# Graph Report - .  (2026-07-01)

## Corpus Check
- Corpus is ~40,859 words - fits in a single context window. You may not need a graph.

## Summary
- 165 nodes · 296 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 500 input · 1,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]

## God Nodes (most connected - your core abstractions)
1. `Member` - 22 edges
2. `compilerOptions` - 16 edges
3. `Transaction` - 14 edges
4. `ChurchEvent` - 14 edges
5. `UserRole` - 13 edges
6. `AppView` - 10 edges
7. `User` - 8 edges
8. `Server Backend (server/)` - 8 edges
9. `FinanceReportingProps` - 6 edges
10. `MemberPortalProps` - 6 edges

## Surprising Connections (you probably didn't know these)
- `CommunicationCenterProps` --references--> `Member`  [EXTRACTED]
  components/CommunicationCenter.tsx → types.ts
- `DashboardProps` --references--> `ChurchEvent`  [EXTRACTED]
  components/Dashboard.tsx → types.ts
- `DashboardProps` --references--> `Member`  [EXTRACTED]
  components/Dashboard.tsx → types.ts
- `DashboardProps` --references--> `Transaction`  [EXTRACTED]
  components/Dashboard.tsx → types.ts
- `DemographicsAnalysisProps` --references--> `Member`  [EXTRACTED]
  components/DemographicsAnalysis.tsx → types.ts

## Import Cycles
- None detected.

## Communities (12 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (10): AuditLogsProps, CompliancePortalProps, NotificationsPanelProps, PrivacyPolicyProps, SecurityOverviewProps, root, rootElement, AppNotification (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (16): FinanceReportingProps, MembershipProps, MessagingTarget, MyGivingProps, SettingsProps, SettingTab, Budget, MaritalStatus (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (21): dependencies, @google/genai, lucide-react, react, react-dom, recharts, devDependencies, @types/node (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (11): MemberPortalProps, ReportsCenterProps, ReportType, SermonHistoryProps, analyzeFinances(), generateDailyVerse(), generateSermonOutline(), getBibleScriptureAndReflection() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (9): DashboardProps, EventsManagementProps, AuthMode, FALLBACK_VERSES, LoginProps, ImaniLogoIcon(), SidebarProps, AppView (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (10): AnalyticsTab, DemographicsAnalysisProps, LOCATION_COORDS, EVENT_TYPE_CONFIG, ChurchGroup, GroupsManagementProps, scoutOutreachLocations(), ChurchEventType (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (13): API Routes, Backend Integration, BetterAuth, Drizzle ORM, Express 5, Frontend API Layer, Frontend SPA (src/), Imani CMS (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.40
Nodes (4): CommunicationCenterProps, generateShortInspirationalSermon(), CommunicationLog, CommunicationTemplate

## Knowledge Gaps
- **59 isolated node(s):** `CompliancePortalProps`, `AnalyticsTab`, `LOCATION_COORDS`, `EVENT_TYPE_CONFIG`, `ChurchGroup` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Member` connect `Community 6` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 8`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `UserRole` connect `Community 1` to `Community 0`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `ChurchEvent` connect `Community 3` to `Community 0`, `Community 1`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `CompliancePortalProps`, `AnalyticsTab`, `LOCATION_COORDS` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09333333333333334 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._