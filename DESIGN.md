---
version: alpha
name: Bhagavad Gītā — The Stillness Before Action
description: A contemplative digital exhibition where a field of carved stone gives way to the human question before battle.
colors:
  primary: "#292d28"
  stone: "#e9e6df"
  paper: "#f3f0e9"
  ink: "#292d28"
  muted: "#62655e"
  night: "#242923"
  light: "#e9e6dc"
  rule: "#b9bcb0"
typography:
  display:
    fontFamily: "'Cormorant Garamond', Georgia, serif"
  utility:
    fontFamily: "'DM Sans', Arial, sans-serif"
rounded:
  DEFAULT: "0px"
spacing:
  gutter: "24px"
components:
  navigation:
    backgroundColor: "{colors.night}"
    textColor: "{colors.light}"
  relief:
    backgroundColor: "{colors.stone}"
    textColor: "{colors.ink}"
  narrative:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
  link:
    textColor: "{colors.primary}"
---

# Design direction

## Overview

The North Star is an ivory bas-relief in a quiet museum, opening into the uncertain moment at Kurukṣetra. The supplied Immersive Garden audit guides spatial restraint and physical interaction; no studio assets are reused. This is a content/brand experience for English-reading visitors curious about the Gītā, on desktop and phone. The first milestone is the opening interaction and prologue, not the full scripture reader.

Signature: movement makes sculpture rise from the same stone surface. The interface stays quiet. The pale palette is explicitly requested by the supplied brief, not an arbitrary default. Avoid devotional stock photography, generic oversized marketing type, gold UI ornaments, cards, decorative counters, particles and fake scriptural quotes.

Runtime tokens in `src/style.css :root` are canonical; this file mirrors accepted values and explains intent. `colors.primary` aliases ink (no independent CSS value). Other `colors.*` map directly to `--*` in that block. `typography.display` maps to `--font-display`; `typography.utility` maps to `--font-utility`. Layout gutter is `--gutter`, responsive from 24px to 80px. Shared links, controls and sections consume these variables. Rendering-specific stone lighting lives in `src/relief.ts` and deliberately varies around the stone palette.

## Colors

Stone is the opening substrate; paper is the prose surface. Ink and muted supply readable hierarchy. Night/light define the reflective conclusion and navigation. Rule is reserved for decorative separators, never small text. Cinematic amber belongs to the battlefield artwork, not buttons. Forced colors keeps system controls operable and omits decorative WebGL.

## Typography

Cormorant Garamond provides editorial cadence, with restrained italic emphasis. DM Sans is for quiet, precise utilities. Fonts are self-hosted through pinned Fontsource packages. The heading is 42–68px on desktop, 48px with deliberate wrapping on phones. Body content is English. Sanskrit corpus rendering and verified chapter names belong to later milestones; no unverified Sanskrit verse is displayed.

## Layout

A full-height opening, followed by a large left-aligned narrative passage, an offset landscape window, centered introduction and dark reflection. No repeated card grid. Desktop uses generous negative space and 4.2vw outer gutters; below 700px, gutters become 24px and the image is deliberately recropped. Media geometry is reserved. The document owns scrolling, and only the modal locks it temporarily. Scrollbars remain visible.

## Elevation & Depth

Only the relief carries physical depth. UI is flat. The prototype uses original mathematical relief surfaces and a persistent CPU field sampled in a vertex shader; it is not a production character sculpture or the final GPU field architecture. Shading normals come from the displaced surface. No flat-image spotlight is claimed to satisfy the final sculpture gate.

## Shapes

Flat image edges, hairline rules, unboxed text controls. A circular scroll arrow is the sole navigational shape; it echoes the wheel without turning the UI into ornament.

## Components

Links and buttons have native semantics, explicit hover, active and visible focus. Menu uses the browser's accessible modal dialog with Escape, focus containment, background inertness and focus restoration. Menu destinations are real sections in this milestone; there are no dead links to unfinished chapters.

Motion is slow and contemplative. A visible pause control freezes decorative motion and reveals the sculpture for accessible viewing. Reduced motion starts paused, and touch retains native scrolling. No sound toggle is offered until audio actually exists. Artwork failures preserve the exhibition window and give a readable explanation.

All current prose is original editorial writing, visibly distinguished from scripture. Generated visual metaphors are labeled artistic interpretations. Verified and legally reusable translations are required before the reader milestone.

## Do's and Don'ts

- Do keep the opening interaction and story readable without WebGL.
- Do preserve the references and document honest asset provenance.
- Do update this file when shared visual decisions change.
- Don't claim the complete 18-chapter experience is implemented.
- Don't introduce scriptural quotations without checking edition, attribution and numbering.
- Don't mistake this symbol prototype for the final figurative sculpture.
