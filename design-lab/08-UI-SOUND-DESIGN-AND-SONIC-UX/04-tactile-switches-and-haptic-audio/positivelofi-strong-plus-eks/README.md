STRONG+ — Extended Karplus-Strong Synthesizer
A browser-based physical string synthesizer implementing the Extended Karplus-Strong (EKS) algorithm with commuted synthesis body resonance.
→ Open Strong+ | → Archive PDF

What is Karplus-Strong Synthesis?
The Karplus-Strong algorithm (Karplus & Strong, Computer Music Journal, MIT Press, 1983) is one of the most elegant discoveries in the history of digital audio. A circular buffer of N samples filled with white noise, averaged with its neighbor on each reading pass — and it sounds like a plucked string. Not an approximation. Julius O. Smith III later proved it was the exact transfer function of an ideal vibrating string, derived entirely by accident.
The Extended KS algorithm (EKS) — Jaffe & Smith, 1983, same journal issue — adds six filters to the loop:

H_p(z) — pick direction (one-pole LP)
H_β(z) — pick position (comb filter: 1 - z^⌊βN+½⌋)
H_L(z) — dynamic level (bandwidth from velocity)
H_η(z) — fractional delay tuning (first-order allpass)
H_s(z) — stiffness / inharmonicity (allpass dispersion)
H_d(z) — loop gain and decay

The algorithm is public domain. All patents have expired (~2010).

Strong+ Features
Engine

Full EKS implementation (H_p, H_β, H_L, H_η, H_s, H_d, DC blocker)
Commuted synthesis: body/room IR applied to excitation — the reverb IS the instrument body, not an effect
Real pitch vibrato via fractional delay modulation (not amplitude)
Post-processing Bit Crush + Decimation (temporal quantization) for historical accuracy

8 Body Types
TypeCharacterInspired byROOMConcert hall diffuse tailGeneral acoustic spaceSPRINGMetallic flutter, resonant modesEMT spring reverbCAVEDense, low modal resonancesStone resonatorVOIDNear-infinite, eerieOpen space / outdoorsPLATEDense metallic diffusion, brightEMT 140 plate reverbNANOTiny high-frequency chamberPiccolo mandolin bodyCATHEnormous stone space, very longCathedral / palazzoTITANInfrasonic building-scale resonance443m steel structure
22 Presets — 11 Historical + 11 Conceptual
Historical (documented, accurate):
Digitar '78 · Acrobat '81 · Piccolo Mandolin · Plucked Gate · Quadraspace · Transfer Function · Telegram '84 · Grass '87 · WWW·89 · Jobs Demo '88 · Venice Biennale
Conceptual (philosophical / loufoque):
King Strong · Empire Str(ing) · Ghost Patent · Dulcimer de Leche · Commuted Body · Inf. Bluegrass · Wave Equation · Shazam String · Sandburg Reed · CCRMA Room · Public Domain '93
Integrated Archive
Click ◈ ARCHIVE inside the synth for:

THE STORY — narrative history of KS synthesis
HOW KS WORKS — step-by-step tutorial with equations
PEOPLE — Karplus, Strong, Jaffe, Smith biographies
TIMELINE — 1978–2025 chronology
WORKS — documented musical compositions
ALGORITHM — KS, EKS, commuted synthesis, waveguide theory
HARDWARE — Digitar chip, NeXT Music Kit, VL1, Rings, Superkar+
VIBE CODING — on authorship, the NeXT parallel, and making things freely


The NeXT Connection
The NeXT Cube (1988) is the shared ancestor of two revolutions:

Jaffe & Smith built the NeXT Music Kit (1986-91) on it — the first architecture to unify Music-N and MIDI. First demonstrated at the October 12, 1988 NeXT launch at Davies Symphony Hall, where the Cube played a live duet with an SF Symphony violinist.
Tim Berners-Lee built WorldWideWeb.app on a NeXT Cube at CERN in 1990 — the first web browser, written in Objective-C on NeXTSTEP. The first website went live December 25, 1990.

Both were then released freely: Music Kit → CCRMA (1992), WWW → public domain (April 30, 1993).
Strong+ runs in the browser that descends from that machine.

Implementation
Built with the Web Audio API and vanilla JavaScript. No dependencies. Single HTML file.
Architecture:
Excitation (noise/pluck/sine)
  → H_L  (dynamic level LP)
  → H_p  (pick direction LP)
  → H_β  (pick position comb)
  → Delay line (N samples) ←──────────────┐
      ↓                                    │
  → H_d  (one-zero LP × loop gain)        │
  → H_η  (tuning allpass)                 │
  → H_s  (stiffness allpass)              │
  → DC blocker ───────────────────────────┘
  → Post: Bit Crush + Decimation
  → Convolver (commuted body IR)
  → Master gain → output
Body IRs are synthesized algorithmically per body type and size, applied via WebAudio ConvolverNode.

References

Karplus, K. & Strong, A. (1983). Digital Synthesis of Plucked-String and Drum Timbres. Computer Music Journal, 7(2), 43-55.
Jaffe, D.A. & Smith, J.O. (1983). Extensions of the Karplus-Strong Plucked-String Algorithm. Computer Music Journal, 7(2), 56-69.
Smith, J.O. (1983). Techniques for Digital Filter Design and System Identification with Application to the Violin. PhD Thesis, Stanford/CCRMA.
Smith, J.O. Physical Audio Signal Processing. CCRMA. https://ccrma.stanford.edu/~jos/pasp/
Music Kit documentation: https://musickit.sourceforge.net/


Credits

Concept, musical direction, presets: Yuwa (Positive Lofi)
Implementation: Claude (Anthropic)
Algorithm: Karplus, Strong, Jaffe, Smith — public domain since 1983

The algorithm is public domain. The history is documented. The sounds are yours.

Keywords: Karplus-Strong synthesis · KS algorithm · EKS · Extended Karplus-Strong · plucked string synthesis · physical modeling synthesis · digital waveguide synthesis · Julius O. Smith · David Jaffe · CCRMA Stanford · Web Audio API · JavaScript synthesizer · browser synthesizer · commuted synthesis · Mutable Instruments Rings · NeXT Music Kit
