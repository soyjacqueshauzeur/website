# Graph Report - .  (2026-07-13)

## Corpus Check
- 42 files · ~324,685 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 151 nodes · 141 edges · 43 communities (24 shown, 19 thin omitted)
- Extraction: 52% EXTRACTED · 45% INFERRED · 4% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- CSS Components & Studio Identity
- Work Portfolio & Projects
- Contact & Team Pages
- Production Process & Services
- Design System & Tokens
- Service Tiers & Disciplines
- README & Project Metadata
- Contact FAQ & Legal
- Awards Strip & Studio Recognition
- Service FAQ Grid
- Cap Bento Component
- Stat Strip Component
- AI Imagery FAQ
- Revisions FAQ
- Studio Rental FAQ
- Travel FAQ
- Usage Rights FAQ
- TDC Award Recognition
- Colour Managed Principle
- Daylight First Principle
- Never Ship Principle
- One Producer Principle
- Retouching Editing Principle
- Third Frame Principle
- Iris Tornsen Team Member
- Rosa Linder Team Member
- Tomas Brivon Team Member

## God Nodes (most connected - your core abstractions)
1. `Brivon Studio` - 33 edges
2. `Archive 2023-2025` - 10 edges
3. `Hero Component` - 6 edges
4. `New Project Intake Channel` - 4 edges
5. `Campaign Tier` - 4 edges
6. `Brivon Photography Studio Template` - 3 edges
7. `Brooklyn Studio` - 3 edges
8. `Berlin Studio` - 3 edges
9. `Editorial Tier` - 3 edges
10. `Marque Tier` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Button Component System` --used_by--> `Brivon Studio`  [INFERRED]
  assets/css/styles.css → index.html
- `Closing CTA Component` --implements_ui_for--> `Brivon Studio`  [INFERRED]
  assets/css/styles.css → index.html
- `Footer Component` --implements_ui_for--> `Brivon Studio`  [INFERRED]
  assets/css/styles.css → index.html
- `Hero Component` --implements_ui_for--> `Brivon Studio`  [INFERRED]
  assets/css/styles.css → index.html
- `Navigation Component` --implements_ui_for--> `Brivon Studio`  [INFERRED]
  assets/css/styles.css → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Brivon Studio Core Entity Cluster** — index_brivon_studio, studio_founding_chapter, studio_team_mira_halden, studio_team_joon_park, studio_team_tomas_brivon, studio_brooklyn_room, studio_berlin_room [INFERRED 0.85]
- **Three-Tier Service System** — services_tier_editorial, services_tier_campaign, services_tier_marque, services_process_discovery, services_process_scope, services_process_preproduction, services_process_kickoff, services_process_shoot, services_process_selects, services_process_retouch, services_process_delivery [INFERRED 0.90]
- **Brivon Design System Component Library** — assets_css_styles_css_design_tokens, assets_css_styles_css_palette, assets_css_styles_css_typography, assets_css_styles_css_spacing, assets_css_styles_css_components_hero, assets_css_styles_css_components_stat_strip, assets_css_styles_css_components_work_grid, assets_css_styles_css_components_tier_grid, assets_css_styles_css_components_process_grid, assets_css_styles_css_components_split, assets_css_styles_css_components_cap_bento, assets_css_styles_css_components_channel_grid, assets_css_styles_css_components_team_grid, assets_css_styles_css_components_journal_grid, assets_css_styles_css_components_awards_strip, assets_css_styles_css_components_form_card, assets_css_styles_css_components_faq_grid, assets_css_styles_css_components_closing_cta, assets_css_styles_css_components_footer, assets_css_styles_css_components_nav, assets_css_styles_css_components_button [EXTRACTED 1.00]
- **Team Member Photos** — assets_img_team_anya, assets_img_team_eli, assets_img_team_felix, assets_img_team_iris, assets_img_team_joon, assets_img_team_mira [INFERRED 0.95]
- **Studio Location Photos** — assets_img_studio_berlin, assets_img_studio_brooklyn, assets_img_studio_room, assets_img_studio_hero [INFERRED 0.85]
- **Journal/Blog Images** — assets_img_journal_archive, assets_img_journal_colour, assets_img_journal_light [INFERRED 0.85]
- **Team Portrait Photos (Chunk 3)** — assets_img_team_rosa, assets_img_team_tomas [INFERRED 0.75]
- **Architecture Portfolio Work (Chunk 3)** — assets_img_work_arch, assets_img_work_arch_2, assets_img_work_atrium [INFERRED 0.75]
- **Food Photography Series (Chunk 3)** — assets_img_work_food, assets_img_work_food_2 [INFERRED 0.75]

## Communities (43 total, 19 thin omitted)

### Community 0 - "CSS Components & Studio Identity"
Cohesion: 0.08
Nodes (25): Button Component System, Closing CTA Component, Footer Component, Journal Grid Component, Navigation Component, Split Image Chapter Component, Work Grid Component, Architecture Photography Discipline (+17 more)

### Community 1 - "Work Portfolio & Projects"
Cohesion: 0.11
Nodes (19): Aldo & Marlow FW24 Product, Atrium SS25 Lookbook, Form House Knitwear, Henning Vorstad Portrait, Kunsthaus Folder Yearbook, Maison Stól Catalogue, Salt & Ember Cookbook, Aldo & Marlow FW24 Product (No. 129) (+11 more)

### Community 2 - "Contact & Team Pages"
Cohesion: 0.11
Nodes (18): Channel Grid Component, Form Card Component, Team Grid Component, Anya Stenmark, Careers Channel, Eli Wender, Felix Vahl, Joon Park (+10 more)

### Community 3 - "Production Process & Services"
Cohesion: 0.20
Nodes (10): Process Grid Component, Six-Step Production Process, Delivery Phase, Discovery Phase, Kickoff Phase, Pre-production Phase, Retouch Phase, Scope Phase (+2 more)

### Community 4 - "Design System & Tokens"
Cohesion: 0.38
Nodes (7): Hero Component, Brivon Design Tokens, Colour Palette (Charcoal Ground + Electric Lime), Reduced Motion Support, Responsive Breakpoints (1100px, 720px), Spacing Scale, Typography System (Boldonse, Inter Tight, Geist Mono)

### Community 5 - "Service Tiers & Disciplines"
Cohesion: 0.38
Nodes (7): Tier Grid Component, Campaign Photography Discipline, Editorial Photography Discipline, In-House Retouching & Colour Management, Campaign Tier, Editorial Tier, Marque Tier

### Community 8 - "README & Project Metadata"
Cohesion: 0.50
Nodes (4): Brivon Photography Studio Template, HTML Design, MIT License, ThemeWagon

### Community 11 - "Contact FAQ & Legal"
Cohesion: 0.67
Nodes (3): Founder Bios, Image Licensing, Press Kit

## Ambiguous Edges - Review These
- `team-rosa.jpg` → `team-tomas.jpg`  [AMBIGUOUS]
  assets/img/team-rosa.jpg · relation: semantically_similar_to
- `work-arch-2.jpg` → `work-arch.jpg`  [AMBIGUOUS]
  assets/img/work-arch.jpg · relation: semantically_similar_to
- `work-food-2.jpg` → `work-food.jpg`  [AMBIGUOUS]
  assets/img/work-food.jpg · relation: semantically_similar_to
- `work-portrait-1.jpg` → `work-portrait-2.jpg`  [AMBIGUOUS]
  assets/img/work-portrait-1.jpg · relation: semantically_similar_to
- `work-still-1.jpg` → `work-still-2.jpg`  [AMBIGUOUS]
  assets/img/work-still-1.jpg · relation: semantically_similar_to

## Knowledge Gaps
- **60 isolated node(s):** `ThemeWagon`, `HTML Design`, `MIT License`, `Catalogue Stills Discipline`, `Architecture Photography Discipline` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `team-rosa.jpg` and `team-tomas.jpg`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `work-arch-2.jpg` and `work-arch.jpg`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `work-food-2.jpg` and `work-food.jpg`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `work-portrait-1.jpg` and `work-portrait-2.jpg`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `work-still-1.jpg` and `work-still-2.jpg`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `Brivon Studio` connect `CSS Components & Studio Identity` to `Work Portfolio & Projects`, `Contact & Team Pages`, `Production Process & Services`, `Design System & Tokens`, `Service Tiers & Disciplines`?**
  _High betweenness centrality (0.286) - this node is a cross-community bridge._
- **Why does `Mira Halden` connect `Contact & Team Pages` to `CSS Components & Studio Identity`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._