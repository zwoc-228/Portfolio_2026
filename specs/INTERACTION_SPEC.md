# Current scope

Animation and camera polish explicitly deferred until HOME alignment/material acceptance. Existing navigation preserved in this revision.

# Interaction specification — v1

The seven endpoints are observed. All timing, interpolation, gesture semantics and hover changes below are conservative implementation inferences; screenshots provide no motion evidence.

## State machine
HOME → PREVIEW_WRITING / PREVIEW_ARCHITECTURE / PREVIEW_RESEARCH → corresponding INDEX. Preview Enter opens its index. Back/Escape: index→preview→home. Brand returns HOME. Browser history restores state. Category filters act within index. About/Contact are ancillary text panels; no fabricated contact address. Archive opens the category index selector using existing category navigation.

## Transition contract (I)
| Transition | Duration | Object/camera | Text |
|---|---|---|---|
| Home→preview | 800ms | chosen root translates to right anchor, scales to preview fit; other roots translate beyond frame; camera elevation/lens fixed | home labels/footer out0–200ms; sidebar in350–650ms |
| Preview→index | 550ms | selected object exits/fades over0–300ms; camera fixed | sidebar remains; category content appears200–550ms |
| Index→preview | 550ms | reverse endpoint interpolation | reverse fade |
| Preview→home | 800ms | all roots return to saved home transforms | sidebar out0–200; labels in450–750 |

Use smooth cubic easing, no bounce/overshoot. Never change material color or light to indicate selection. No object spinning, particles, magnetic cursor, parallax wobble, book opening or paper explosions. Hover: native pointer; at most subtle label opacity shift160ms, no model movement because reference does not establish it. Keyboard focus visible with fine outline; hit areas at least44px despite small visual text. Click object or category label enters same preview. Wheel from HOME may select nearest horizontally hovered category; do not trap ordinary scrolling on touch/mobile. Enter action is explicit; scroll must not skip both states. During transitions latest intentional navigation wins and interpolates from current transforms. Avoid accumulated transforms.

Reduced motion: direct transform endpoint + <=100ms text dissolve. Test all transitions and quick reversals. Touch: tap replaces hover. Modal Escape/close returns to prior state and focus. Reference circle is decorative pending evidence; no invented sound toggle. Reference titles in indexes are study content only; opening them must not present invented project descriptions as Yuanlong's work.
