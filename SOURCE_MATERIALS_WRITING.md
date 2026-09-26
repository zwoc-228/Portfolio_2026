# Writing material references / license

This pass intentionally keeps the browser bundle light. Rather than shipping the original multi-megabyte 4K/8K source sets, the site uses dedicated 1K local maps tuned to reproduce the same material language and scale.

## CC0 references selected

### Cover cloth
- Poly Haven — **Book Pattern**
- https://polyhaven.com/a/book_pattern
- License: CC0
- Reason: this is specifically a woven cotton **book-cover textile**, with the right plain-weave scale and matte response for the notebook reference.

### Paper / page block
- Poly Haven — **Book Encyclopedia Set 01** (`Paper Diff`, `Paper Nor GL`, `Paper Roughness`)
- https://polyhaven.com/a/book_encyclopedia_set_01
- License: CC0
- Reason: real book paper / page-edge material response, useful as the physical reference for page warmth, roughness and edge behavior.

## Performance implementation
The shipped browser assets are 1024×1024 maps:
- `writing-cover-color.png`
- `writing-cover-normal.png`
- `writing-cover-roughness.png`
- `writing-paper-color.png`
- `writing-paper-normal.png`
- `writing-paper-roughness.png`

The reveal is handled by one material uniform plus lightweight interpolation of roughness, normal strength and sheen. No page simulation, 4K textures, displacement tessellation or extra render pass was added.
