# Round47 — physical glass header only

Base: `Portfolio_2026_round46_CODE(1).zip`.

Only the header rendering was changed.

- Replaced the header's CSS frosted fill / blur / border / shadow with a transparent DOM interaction layer.
- Added a real Three.js rounded glass volume using `MeshPhysicalMaterial` transmission, thickness, IOR, attenuation and clearcoat. The studio scene behind the header is now physically sampled/refracted by Three's transmission pass rather than blurred by CSS.
- Kept the existing empty collapsed header, expansion behavior, navigation text, sizes, timing, hit target, contact patch and round46 desk-reflection proxy.
- The new visible glass mesh is excluded from the desk mirror pass so the existing round46 header reflection remains unchanged rather than being doubled.
- No model geometry/material, desk material/light, camera, home layout, content, cards, typography, spotlight, particles or transition code was changed.
