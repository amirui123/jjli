# GIF And Video Pipeline

## Pipeline A: Product UI To GIF

1. Build the interaction in Next.js/React using Motion or GSAP.
2. Use Playwright to open the exact route and trigger the interaction.
3. Record video from the browser context.
4. Convert MP4/WebM to GIF with ffmpeg.
5. Score the output with the motion quality rubric.

Example ffmpeg conversion:

```bash
ffmpeg -i input.mp4 -vf "fps=15,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" output.gif
```

## Pipeline B: Remotion To MP4/GIF

1. Create a Remotion project.
2. Build scenes as React components.
3. Use generated images, SVGs, Lottie, or Rive as scene assets.
4. Render MP4 for high quality.
5. Render GIF only when needed for docs/social previews.

Typical Remotion render:

```bash
npx remotion render MyComposition out/video.mp4
npx remotion render MyComposition out/preview.gif --codec=gif --every-nth-frame=2
```

## Pipeline C: Figma/Canva To Motion

1. Pull layout, text, components, and variables from Figma or Canva.
2. Convert static frames into a motion storyboard.
3. Decide output target: web interaction, explainer video, GIF, or social cutdown.
4. Implement in Motion/GSAP for web or Remotion for video.
5. Capture and QA.

## Output Standards

- MP4 for real video delivery.
- GIF for lightweight previews only.
- WebM for web-native lightweight clips where supported.
- Lottie/Rive for app-embedded vector motion.
- Static poster frame for every animated asset.

