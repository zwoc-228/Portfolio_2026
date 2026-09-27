# Round48 — clear glass header, performance fix

Base: Round47.

Only the header implementation was changed.

- Removed Round47's `MeshPhysicalMaterial.transmission` header. Three.js transmission renders an extra scene buffer and was the source of the new frame-time cost.
- Restored the lightweight Round46 reflection/contact proxy and header animation path, so the rest of the scene and floor reflection logic are unchanged.
- Rebuilt the visible header as a clear screen-space glass surface: transparent center, bright top/left Fresnel-like edge, cooler/darker lower/right thickness edge, subtle internal highlight and existing desk reflection.
- Deliberately uses no blur kernel. The backdrop operation only applies light color/contrast adjustments, avoiding the large blur and avoiding a second WebGL scene transmission pass.
- No model, lighting, desk, camera, typography, content, spotlight, particles, cards, or navigation behavior changed.
