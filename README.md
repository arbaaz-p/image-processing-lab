# Interactive Image Processing Lab

An expanded version of a CPSC 2130 HTML5 Canvas assignment. The original coursework implemented direct RGBA pixel operations for a custom filter, eight-colour quantization, and manual 4×4 block resampling. The portfolio version adds a responsive interface, local image upload, clearer algorithm notes, and accessibility improvements.

## Operations

- **Sepia filter:** recalculates the RGB channels for every pixel while preserving alpha.
- **Eight-colour quantization:** selects the closest palette entry using squared Euclidean distance in RGB space.
- **Block resampling:** averages each 4×4 source block into one output pixel, reducing 520×520 pixels to 130×130.

Uploaded images are processed locally in the browser and are not transmitted. The default sample is generated directly in Canvas, so the demo has no external image dependency.
