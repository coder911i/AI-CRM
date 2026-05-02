# Blueprint Functionalist Design System

## Brand & Style
- **Personality:** Utilitarian, precise, systematic.
- **Style:** Minimalism and High-Contrast Outlines (blueprint aesthetic).
- **Shadows/Depth:** No shadows. Uses bold borders and tonal layers.

## Colors
- **Background:** `#F5F5F5` (Level 0 depth) or `#FBF8FF` (Surface base)
- **Primary / Interactive:** `#4F6EF7` (Main action stroke/text), `#E8F0FF` (Primary button fill), `#EEF2FF` (Active sidebar fill)
- **Neutral / Wireframe:** `#FFFFFF` (Surface Level 1), `#CCCCCC` (1px stroke for containers, inputs, secondary buttons)
- **Warning / Placeholder:** `#FF9800` (Stroke/Text), `#FFF3E0` (Fill)
- **Table Headers:** `#EEEEEE` (Background)
- **Text:** `#1A1B23` (Main Text), `#444654` (Surface Variant Text), `#4F6EF7` (Primary Interactive Text)

## Typography
- **Font Family:** Inter
- **Header Main:** 14px, Bold (700), 20px line height
- **Label Standard:** 12px, Regular (400), 16px line height
- **Annotation Italic:** 11px, Regular (400), 14px line height (Italic)

## Spacing & Layout
- **Fixed Grid:** 1440px max width
- **Base Unit:** 4px
- **Gutters:** 16px
- **Margins:** 24px
- **Internal Padding:** 16px (standard for containers/wireframe boxes)

## Elevation & Depth (No Shadows)
- **Level 0:** Base background (`#F5F5F5` or `#FBF8FF`)
- **Level 1:** White (`#FFFFFF`) fill with `1px solid #CCCCCC` border
- **Level 2:** Interactive element with `#E8F0FF` fill and `2px solid #4F6EF7` border
- **Sidebar Depth:** Vertical `3px solid #4F6EF7` left border for active item

## Component Styles
- **Shapes / Border Radius:** `0px` (Sharp corners for everything)
- **Primary Buttons:** Fill `#E8F0FF`, Border `2px solid #4F6EF7`, Text `#4F6EF7`.
- **Secondary Buttons:** Fill `#FFFFFF`, Border `1px solid #CCCCCC`.
- **Input Fields:** Fill `#FFFFFF`, Border `1px solid #CCCCCC`. Label (12px) sits above with 4px gap.
- **Sidebar Active Item:** Fill `#EEF2FF`, Border Left `3px solid #4F6EF7`.
- **Placeholders:** Fill `#FFF3E0`, Border `2px dashed #FF9800`, Text `#FF9800` bold uppercase.
- **Lists & Tables:** Rows separated by `1px solid #CCCCCC` bottom border. Headers use `14px Bold` on `#EEEEEE` background.
