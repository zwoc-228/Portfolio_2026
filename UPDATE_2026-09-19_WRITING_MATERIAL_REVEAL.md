# Update — Writing closed-book material reveal

## User-requested change
- Remove the opening / page-turn interaction.
- Keep the notebook as a clean closed object.
- When the user clicks Writing and the object enlarges, transition from a near-white abstract notebook into a tactile notebook material.
- Preserve performance and interaction smoothness.

## Geometry cleanup
- Removed the articulated preview cover / fanned pages from the previous round.
- The Writing model is now a stable closed notebook in both HOME and preview.
- The page block uses one clean block plus only two broad visible paper sheets, avoiding the sub-pixel stacked lines that caused moiré / pixel clumping at distance.
- Writing export is now only 11 meshes.

## Material reveal
- Added a dedicated lightweight reveal shader to Writing materials.
- HOME: cover and paper are visually suppressed toward an almost-white object.
- `#writing/preview`: the reveal value animates from 0 → 1 during the same camera/object transition.
- At full reveal:
  - cover becomes a muted blue woven book cloth
  - cloth normal detail increases gradually
  - roughness and sheen become visible gradually
  - paper shifts from clean white to warm tactile paper with subtle fiber normal detail
- Returning HOME reverses the same transition.

## Performance
- 1K maps only.
- No 4K/8K textures.
- No displacement or tessellation.
- No page-by-page animation.
- No new post-processing pass.
- The reveal reuses the existing transition frame loop instead of adding a second continuous animation loop.

## Validation
- 52 meshes total across all three categories.
- 39,056 triangles total.
- GLB containers validated.
