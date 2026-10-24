# Brand Builder Skills — 24 livres, 5 skills, 0 bullshit

Merci d'avoir demandé le pack. Voici ce que vous avez entre les mains.

J'ai lu 24 livres sur le branding, la stratégie, le design et la psychologie de la persuasion. J'ai tout condensé en **5 skills pour Claude Code** — des méthodologies actionnables, étape par étape, qui transforment Claude en consultant branding senior.

Ce ne sont pas des résumés. Ce ne sont pas des fiches de lecture. Ce sont des frameworks structurés que Claude utilise pour vous guider dans la construction d'une marque, de A à Z.

---

## Les 5 skills

| Skill | Ce qu'il fait | Essayez |
|-------|--------------|---------|
| **brand-platform/** | Plateforme de marque : WHY, valeurs, positionnement, archétype, promesse, manifeste | *"Aide-moi à définir ma plateforme de marque"* |
| **market-research/** | Étude de marché : TAM/SAM/SOM, personas, concurrence, validation Lean, Sprint | *"Fais une étude de marché pour mon projet"* |
| **brand-identity-design/** | Identité visuelle : logo, couleurs, typographie, design system, guidelines | *"Crée l'identité visuelle de ma marque"* |
| **tone-of-voice/** | Voix de marque : registre, lexique, architecture de messages, adaptation par canal | *"Définis le tone of voice de ma marque"* |
| **brand-strategy/** | Orchestration : relie les 4 skills en une stratégie complète + go-to-market | *"Construis ma marque de A à Z"* |

---

## Installation (2 minutes)

### Prérequis

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) installé sur votre machine.

### Option A — Installation dans un projet

Copiez les 5 dossiers de skills dans le dossier `.claude/skills/` de votre projet :

```bash
# Créez le dossier s'il n'existe pas
mkdir -p /chemin/vers/votre/projet/.claude/skills/

# Copiez les skills
cp -r brand-platform/ /chemin/vers/votre/projet/.claude/skills/
cp -r market-research/ /chemin/vers/votre/projet/.claude/skills/
cp -r brand-identity-design/ /chemin/vers/votre/projet/.claude/skills/
cp -r tone-of-voice/ /chemin/vers/votre/projet/.claude/skills/
cp -r brand-strategy/ /chemin/vers/votre/projet/.claude/skills/
```

### Option B — Installation globale (tous vos projets)

```bash
mkdir -p ~/.claude/skills/
cp -r brand-platform/ ~/.claude/skills/
cp -r market-research/ ~/.claude/skills/
cp -r brand-identity-design/ ~/.claude/skills/
cp -r tone-of-voice/ ~/.claude/skills/
cp -r brand-strategy/ ~/.claude/skills/
```

### Vérifier que ça marche

Lancez Claude Code dans votre projet et tapez :

```
Aide-moi à construire ma plateforme de marque pour [votre marque].
```

Si Claude vous guide à travers le Golden Circle de Sinek, le "Only" Statement de Neumeier et les 12 archétypes de marque — c'est bon, les skills sont actifs.

---

## Comment ça marche

Les skills Claude Code sont des fichiers Markdown qui enrichissent Claude avec des méthodologies spécialisées. Quand vous posez une question qui correspond aux triggers d'un skill, Claude :

1. **Détecte** le skill pertinent grâce aux mots-clés dans la description
2. **Charge** la méthodologie et ses fichiers de référence
3. **Vous guide** étape par étape en appliquant les frameworks des livres

Chaque skill fonctionne seul, mais ils sont conçus pour fonctionner ensemble :

```
Market Research → Brand Platform → Brand Identity Design → Tone of Voice
                        ↑
                Brand Strategy (orchestre le tout)
```

---

## Ce qu'il y a dedans

Chaque skill contient un `SKILL.md` (la méthodologie) et un dossier `references/` avec les frameworks détaillés extraits de chaque livre :

```
brand-platform/
├── SKILL.md                              ← 7 étapes : WHY → Valeurs → Positionnement → Archétype → Promesse → Manifeste → Validation
└── references/
    ├── golden-circle-sinek.md            ← Start With Why
    ├── brand-gap-neumeier.md             ← The Brand Gap
    ├── positioning-thiel-kawasaki.md      ← Zero to One + The Art of the Start
    ├── persuasion-psychology.md           ← Cialdini, biais cognitifs
    └── validation-lean-momtest.md         ← The Lean Startup + The Mom Test

market-research/
├── SKILL.md                              ← 6 étapes : Sizing → Discovery → Concurrence → Personas → Lean Validation → Sprint
└── references/
    ├── lean-startup-methodology.md        ← The Lean Startup
    ├── mom-test-customer-discovery.md     ← The Mom Test
    ├── testing-business-ideas-strategyzer.md ← Testing Business Ideas
    ├── sprint-rapid-validation.md         ← Sprint (Google Ventures)
    ├── market-sizing-monopoly-thiel.md    ← Zero to One + The Art of the Start
    └── persona-product-discovery.md       ← Inspired (Cagan)

brand-identity-design/
├── SKILL.md                              ← 6 étapes : Brief → Logo → Couleurs → Typo → Design System → Guidelines
└── references/
    ├── logo-design-love-airey.md          ← Logo Design Love
    ├── brand-identity-wheeler.md          ← Designing Brand Identity
    ├── universal-design-principles.md     ← Universal Principles of Design
    ├── visual-branding-systems.md         ← Brand and Design + ID
    └── authentic-visual-storytelling.md   ← #Hashtag Authentic

tone-of-voice/
├── SKILL.md                              ← 7 étapes : Fondation → Dimensions → Attributs → Lexique → Messages → Canaux → Guide
└── references/
    ├── sinek-why-messaging.md             ← Start With Why
    ├── persuasion-messaging-cialdini.md   ← Psychologie de la persuasion
    ├── brand-voice-neumeier-wheeler.md    ← The Brand Gap + Designing Brand Identity
    ├── storytelling-authentic-voice.md    ← #Hashtag Authentic + Education of Millionaires
    └── kawasaki-messaging-pitch.md        ← The Art of the Start

brand-strategy/
├── SKILL.md                              ← 6 étapes : Brief → 5 Disciplines → 7 Questions Thiel → Go-to-Market → Métriques → Grit
└── references/
    ├── brand-gap-5-disciplines.md         ← The Brand Gap
    ├── zero-to-one-thiel.md               ← Zero to One
    ├── startup-brand-building.md          ← The Art of the Start + Hard Things + How to Start a Startup
    ├── grit-perseverance.md               ← Grit + Education of Millionaires
    └── design-thinking-norman.md          ← The Design of Everyday Things
```

---

## Les 24 livres synthétisés

| Domaine | Livres |
|---------|--------|
| **Branding** | Start With Why (Sinek), The Brand Gap (Neumeier), Designing Brand Identity (Wheeler), Logo Design Love (Airey), Brand and Design, ID |
| **Startup & Stratégie** | Zero to One (Thiel), The Art of the Start (Kawasaki), The Lean Startup (Ries), The Hard Thing About Hard Things (Horowitz), How to Start a Startup (YC) |
| **Produit & Validation** | Inspired (Cagan, 2 éditions), The Mom Test (Fitzpatrick), Testing Business Ideas (Strategyzer), Sprint (Knapp/GV) |
| **Design** | The Design of Everyday Things (Norman), Universal Principles of Design (Lidwell) |
| **Persuasion & Psychologie** | Manipulation Mentale, Manipuler Pourquoi et Comment, Manipulation |
| **Mindset** | Grit (Duckworth), The Education of Millionaires (Ellsberg) |
| **Storytelling visuel** | #Hashtag Authentic (Tasker) |

---

## Exemples de prompts

**Partir de zéro :**
> "Je lance une marque de cosmétiques bio. Construis ma stratégie de marque complète."

**Skill par skill :**
> "Définis la plateforme de marque pour [nom de marque]."
> "Fais une étude de marché pour [mon projet]."
> "Crée l'identité visuelle de [ma marque]."
> "Définis le tone of voice de [ma marque]."

**Aller plus loin :**
> "Mon archétype est le Creator. Quelles couleurs, quelle typographie et quel registre de voix correspondent ?"
> "Rédige mon brand manifesto à partir de cette plateforme de marque."
> "Applique le Mom Test : quelles questions poser à mes premiers utilisateurs ?"
> "Fais l'audit de ma marque avec le Swap Test de Neumeier et les 7 questions de Thiel."

---

## Un mot de la part de l'auteur

Fils d'artistes, frère de designers. J'ai grandi dans une culture du geste — celle où l'on fabrique avant de théoriser. J'ai dirigé une agence pendant six ans, accompagné une quarantaine de marques. Ce que j'ai toujours cherché, c'est le même point de jonction : la rigueur stratégique et la sensibilité créative.

Ce pack, c'est ces deux mondes réconciliés dans un format que n'importe qui peut utiliser.

Si vous avez des retours, des questions, ou envie d'en discuter — écrivez-moi.

**Romain de Bascher**
[LinkedIn](https://www.linkedin.com/in/romaindebascher/)

---

*"Une marque ne devrait pas être belle pour être belle. Elle devrait dire quelque chose de juste."*
