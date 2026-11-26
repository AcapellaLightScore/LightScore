/**
 * D51 Druck & Papier: on the paper families the type, the solids, the fields and the cards are
 * printed material, seen by one lamp from the upper left. Every value is a theme token
 * (--ds-print-*, tokens.css), so night paper and parchment each print their own way, and velvet
 * (waves, not paper) is left as it is. The live inputs (the ink's wear, the pinholes of a solid,
 * the crinkle of the foil, the deckle edges) are generated per theme by printMaterial.ts.
 */
export const printStyles = {
  /** Display type: ink worn by the paper's grain, pressed into the card. */
  display: "tw:material-paper:[mask-image:var(--ds-print-type-mask)] tw:material-paper:[mask-size:var(--ds-print-type-mask-size)] tw:material-paper:[:root:root_&]:[text-shadow:var(--ds-print-type-shadow)]",
  /** Small type takes about half the wear, so it stays easy to read. */
  fine: "tw:material-paper:[mask-image:var(--ds-print-type-mask-fine)] tw:material-paper:[mask-size:var(--ds-print-type-mask-fine-size)] tw:material-paper:[:root:root_&]:[text-shadow:var(--ds-print-type-shadow-fine)]",
  /** The library heading (the h1 inside the head) is display type. */
  heading: "tw:material-paper:[&_h1]:[mask-image:var(--ds-print-type-mask)] tw:material-paper:[&_h1]:[mask-size:var(--ds-print-type-mask-size)] tw:material-paper:[:root:root_&]:[&_h1]:[text-shadow:var(--ds-print-type-shadow)]",
  /**
   * A solid in opaque ink (the filled button): the paper shows through its pinholes, and it lies in
   * a bed pressed into the card. Pressed, it sinks deeper.
   */
  solid: "tw:material-paper:[background-image:var(--ds-print-voids)] tw:material-paper:[background-size:var(--ds-print-voids-size)] tw:material-paper:[:root:root_&]:shadow-print-solid-bed tw:material-paper:[:root:root_&]:[&:active]:shadow-print-solid-pressed tw:material-paper:[:root:root_&]:[&_.ic]:filter-none",
  /** A field is a hollow in the paper: its upper wall in shade, its lower lip catching the lamp. */
  field: "tw:material-paper:[:root:root_&]:surface-print-field-surface tw:material-paper:[:root:root_&]:border-print-field-edge tw:material-paper:[:root:root_&]:shadow-print-field-bed tw:material-paper:[:root:root_&]:[backdrop-filter:var(--ds-print-field-filter)] tw:material-paper:[:root:root_&]:[-webkit-backdrop-filter:var(--ds-print-field-filter)] tw:material-paper:[:root:root_&]:[&:focus-within]:border-print-field-focus-edge tw:material-paper:[:root:root_&]:[&:focus-within]:shadow-print-field-focus",
  /**
   * The cards are handmade sheets. The paper (on the card's button) is cut to a deckle edge; the card
   * casts its shadow as cut (a filter follows the edge) and lies on a second sheet (library.css).
   * The "…" is a small tab of the same paper; on a phone it sits on the sheet itself.
   */
  card: "tw:material-paper:[:root:root_&]:[&:not(.skeleton)]:[background:none] tw:material-paper:[:root:root_&]:[&:not(.skeleton)]:border-transparent tw:material-paper:[:root:root_&]:[&:not(.skeleton)]:rounded-none tw:material-paper:[:root:root_&]:[&:not(.skeleton)]:overflow-visible tw:material-paper:[:root:root_&]:[&:not(.skeleton)]:[box-shadow:none] tw:material-paper:[:root:root_&]:[&:not(.skeleton)]:[filter:var(--ds-print-card-filter)] tw:material-paper:[:root:root_&]:[&:not(.skeleton).is-tilted]:[filter:var(--ds-print-card-lifted-filter)] tw:material-paper:[:root:root_&]:[&:not(.skeleton).lifted]:[filter:var(--ds-print-card-lifted-filter)] tw:material-paper:max-compact-inclusive:[:root:root_&]:[&:not(.skeleton)]:mb-inline tw:material-paper:[:root:root_&]:[&:not(.skeleton)_>_.ds-library-song-open]:surface-library-card-surface tw:material-paper:[:root:root_&]:[&:not(.skeleton)_>_.ds-library-song-open]:[mask:var(--ds-print-deckle-card)] tw:material-paper:[:root:root_&]:[&:not(.skeleton)_>_.ds-library-song-more]:surface-print-tab-surface tw:material-paper:[:root:root_&]:[&:not(.skeleton)_>_.ds-library-song-more]:shadow-print-tab-shadow tw:material-paper:max-compact-inclusive:[:root:root_&]:[&:not(.skeleton)_>_.ds-library-song-more]:[background:none] tw:material-paper:max-compact-inclusive:[:root:root_&]:[&:not(.skeleton)_>_.ds-library-song-more]:[box-shadow:none]",
  /** The voices' colours where they are paint: dabs of gouache with a body, each its own shape. */
  dabs: "tw:material-paper:[:root:root_&]:[&_i]:[background:radial-gradient(circle_at_var(--ds-print-dab-light-at),_color-mix(in_oklab,_var(--c)_var(--ds-print-dab-mix),_var(--ds-print-dab-light))_var(--ds-print-dab-light-stop),_var(--c)_var(--ds-print-dab-body-stop),_color-mix(in_oklab,_var(--c)_var(--ds-print-dab-mix),_var(--ds-print-dab-dark))_var(--ds-print-dab-edge-stop))] tw:material-paper:[:root:root_&]:[&_i]:shadow-print-dab-shadow tw:material-paper:[:root:root_&]:[&_i:nth-child(3n+1)]:[border-radius:var(--ds-print-dab-shape-a)] tw:material-paper:[:root:root_&]:[&_i:nth-child(3n+2)]:[border-radius:var(--ds-print-dab-shape-b)] tw:material-paper:[:root:root_&]:[&_i:nth-child(3n)]:[border-radius:var(--ds-print-dab-shape-c)]",
  /** Mute and solo at rest: small tabs embossed out of the card (switched on, they keep their own look). */
  mix: "tw:material-paper:[:root:root_&]:[&:not([aria-pressed='true'])]:surface-print-mix-surface tw:material-paper:[:root:root_&]:[&:not([aria-pressed='true'])]:border-print-mix-edge tw:material-paper:[:root:root_&]:[&:not([aria-pressed='true'])]:shadow-print-mix-shadow tw:material-paper:[:root:root_&]:[&:not([aria-pressed='true']):hover]:border-print-mix-hover-edge",
  /** Muted, the tab is pressed in: a solid of ink with pinholes, lying in its bed. */
  muteOn: "tw:material-paper:[:root:root_&]:[&[aria-pressed='true']]:surface-print-mute-on-surface tw:material-paper:[:root:root_&]:[&[aria-pressed='true']]:border-print-mute-on-edge tw:material-paper:[:root:root_&]:[&[aria-pressed='true']]:shadow-print-mute-on-shadow",
  /**
   * Controls lying on the card are embossed out of it (Hochpraegung): the same paper, no frame, lit
   * from the upper left with their shadow below right. Pressed or switched on, they sink in.
   */
  raised: "tw:material-paper:[:root:root_&]:[&:not([aria-pressed='true']):not(.is-solo)]:border-transparent tw:material-paper:[:root:root_&]:[&:not([aria-pressed='true']):not(.is-solo)]:bg-transparent tw:material-paper:[:root:root_&]:[&:not([aria-pressed='true']):not(.is-solo)]:[background-image:var(--ds-print-raised-surface)] tw:material-paper:[:root:root_&]:[&:not([aria-pressed='true']):not(.is-solo)]:elevation-emboss-raised tw:material-paper:[:root:root_&]:[&:not([aria-pressed='true']):not(.is-solo):hover]:elevation-print-raised-hover tw:material-paper:[:root:root_&]:[&:not(.is-solo):active]:[background-image:var(--ds-print-sunk-surface)] tw:material-paper:[:root:root_&]:[&:not(.is-solo):active]:elevation-emboss-pressed tw:material-paper:[:root:root_&]:[&[aria-pressed='true']]:[background-image:var(--ds-print-sunk-surface)]",
  /** A sheet held above the page: a stippled shadow on the paper and a grained edge (one per radius). */
  floatMenu: "tw:material-paper:[:root:root_&]:[border-image:var(--ds-print-float-edge-menu)] tw:material-paper:[:root:root_&]:elevation-print-float-contact",
  floatCard: "tw:material-paper:[:root:root_&]:[border-image:var(--ds-print-float-edge-card)] tw:material-paper:[:root:root_&]:elevation-print-float-contact",
  floatDialog: "tw:material-paper:[:root:root_&]:[border-image:var(--ds-print-float-edge-dialog)] tw:material-paper:[:root:root_&]:elevation-print-float-contact",
  /** Gold stamped into the card (Tiefpraegung): its own foil surface, so the filter shades only the gold. */
  goldDeboss: "tw:material-paper:surface-wordmark-surface tw:material-paper:[-webkit-background-clip:var(--ds-wordmark-vendor-clip)] tw:material-paper:[background-clip:var(--ds-wordmark-clip)] tw:material-paper:text-transparent tw:material-paper:[filter:var(--ds-print-gold-filter)]",
  /** Pressed, a control sinks into the paper and springs back when let go. */
  press: "tw:material-paper:[transition:var(--ds-print-press-transition)] tw:material-paper:[&:active]:[scale:var(--ds-print-press-scale)] tw:material-paper:[&:active]:[translate:var(--ds-print-press-shift)] tw:material-paper:[&:active]:[transition-duration:var(--ds-print-press-in-duration)]",
} as const;
