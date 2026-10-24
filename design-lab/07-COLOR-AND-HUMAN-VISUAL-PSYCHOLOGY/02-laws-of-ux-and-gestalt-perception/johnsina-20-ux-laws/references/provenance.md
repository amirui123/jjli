# Provenance

Where each law comes from, what the evidence base looks like, and how much of it was checked. Citations were looked up on **2026-10-01**. A DOI is listed only where it was confirmed. Anything not confirmed is marked `unverified citation` instead of being presented as sourced.

**Kinds.** *Original finding*: what the cited work actually showed, usually in a lab setting. *Skill heuristic adaptation*: how this skill applies it to interface review. The adaptation is the skill's judgement, not the author's claim.

## Contents
- [Source table](#source-table)
- [Caveats worth remembering](#caveats-worth-remembering)
- [What was not confirmed](#what-was-not-confirmed)
- [Freshness](#freshness)

## Source table
| # | Law | Original source | Caveat / adaptation source | Kind and notes |
| :-: | :--- | :--- | :--- | :--- |
| 1 | Hick | W. E. Hick (1952), *On the rate of gain of information*, Q. J. Exp. Psychol. 4(1), 11-26, doi:10.1080/17470215208416600; R. Hyman (1953), J. Exp. Psychol. 45(3), 188-196, doi:10.1037/h0056940 | None needed beyond the scope note in the reference | Original: choice reaction time against equally likely alternatives. Adaptation: organised menus and defaults in UI. |
| 2 | Fitts | P. M. Fitts (1954), J. Exp. Psychol. 47(6), 381-391, doi:10.1037/h0055392 | I. S. MacKenzie (1992), Human-Computer Interaction 7(1), 91-139, doi:10.1207/s15327051hci0701_3 (Shannon form). ISO 9241-9:2000 was reissued as ISO 9241-411:2012 | Original: movement time vs distance and width. Adaptation: no minimum size is claimed by the law. The 44 and 24 px figures come from platform guidance and WCAG, not from Fitts. ISO catalogue entries not opened. |
| 3 | Jakob | J. Nielsen (22 July 2000), *End of Web Design*, Alertbox, nngroup.com/articles/end-of-web-design/ | None | Practitioner observation, not an experiment. Adaptation: conventions as an expectation. |
| 4 | Proximity | M. Wertheimer (1923), Psychologische Forschung 4, 301-350, doi:10.1007/BF00410640; English: *Laws of organization in perceptual forms*, in Ellis (ed., 1938), pp. 71-88 | None | Original: perceptual grouping demonstrations. Adaptation: spacing rules in layout. |
| 5 | Miller | G. A. Miller (1956), Psychological Review 63(2), 81-97, doi:10.1037/h0043158 | N. Cowan (2001), Behavioral and Brain Sciences 24(1), 87-114, doi:10.1017/S0140525X01003922 (about 4 chunks) | Original concerned recall and absolute judgement. Adaptation: chunking and not requiring recall. It is **not** a cap on visible menu items. |
| 6 | Doherty | W. J. Doherty & A. J. Thadhani (1982), *The Economic Value of Rapid Response Time*, IBM report GE20-0752 (no DOI; primary copy not opened) | R. B. Miller (1968), AFIPS FJCC 33(I), 267-277, doi:10.1145/1476589.1476628; S. K. Card, G. G. Robertson & J. D. Mackinlay (1991), CHI '91, 181-186, doi:10.1145/108844.108874; J. Nielsen, *Response Times: The 3 Important Limits*, nngroup.com/articles/response-times-3-important-limits/ (0.1 s, 1 s, 10 s) | Original: mainframe productivity data. Adaptation: the 0.1/0.4/1/10 s tiers in the rubric. Report suffix and month weakly confirmed. |
| 7 | Von Restorff | H. von Restorff (1933), Psychologische Forschung 18, 299-342, doi:10.1007/BF02409636 | None | Original: isolation effect in memory lists. Adaptation: one distinct primary action. |
| 8 | Minimize target distance | Fitts (1954), as above | None | **Not an independent law**: it is the distance term of Fitts's Law. Kept as a separate grade so size and distance can be assessed separately. |
| 9 | Serial position | H. Ebbinghaus (1885), *Über das Gedächtnis*, Leipzig: Duncker & Humblot (`unverified citation`, from memory); B. B. Murdock (1962), J. Exp. Psychol. 64(5), 482-488, doi:10.1037/h0045106 | None | Original: free-recall curve for word lists. Adaptation: key items at the ends of navigation and lists. |
| 10 | Peak-End | B. L. Fredrickson & D. Kahneman (1993), J. Pers. Soc. Psychol. 65(1), 45-55, doi:10.1037/0022-3514.65.1.45; D. Kahneman, B. L. Fredrickson, C. A. Schreiber & D. A. Redelmeier (1993), *When more pain is preferred to less: Adding a better end*, Psychol. Sci. 4(6), 401-405, doi:10.1111/j.1467-9280.1993.tb00589.x | None | Original: retrospective evaluation of episodes. Adaptation: confirmation and error states in conversion flows. |
| 11 | Zeigarnik | B. Zeigarnik (1927), *Über das Behalten von erledigten und unerledigten Handlungen*, Psychologische Forschung 9, 1-85 (no DOI found; scan not opened) | R. Ghibellini & B. Meier (2025), meta-analysis of the Zeigarnik and Ovsiankina effects, Humanit. Soc. Sci. Commun. 12, doi:10.1057/s41599-025-05000-w; C. L. Hull (1932), Psychol. Rev. 39, 25-43, doi:10.1037/h0072640 and Kivetz, Urminsky & Zheng (2006), J. Mark. Res. 43(1), 39-58, doi:10.1509/jmkr.43.1.39 (goal gradient) | Original: memory for interrupted tasks, which is inconsistently replicated. Adaptation: progress cues are justified by visibility of system status (Nielsen heuristic 1, below) and the goal-gradient effect, not by the memory effect. |
| 12 | Prägnanz | Wertheimer (1923), as above | None | Original and adaptation as for law 4. |
| 13 | Similarity | Wertheimer (1923), as above | None | Same. |
| 14 | Uniform connectedness | S. Palmer & I. Rock (1994), Psychon. Bull. Rev. 1(1), 29-55, doi:10.3758/BF03200760 | I. Rock & S. Palmer (1990), *The legacy of Gestalt psychology*, Sci. Am. 263(6), 84-90, doi:10.1038/scientificamerican1290-84 | Original: perceptual organisation experiments. Adaptation: cards and connectors for grouping. |
| 15 | Tesler | L. Tesler, the "conservation of complexity" law, c. 1984. No primary publication was found. Tesler's own page: nomodes.com/larry-tesler-consulting/complexity-law | D. Saffer, *Designing for Interaction* (New Riders). Edition and page unresolved (`unverified citation`) | Folklore-level design principle, not an empirical finding. Adaptation: where to put complexity. |
| 16 | Postel | J. Postel (ed., Jan 1980), RFC 761 section 2.10 and RFC 760 section 3.2, rfc-editor.org | M. Thomson & D. Schinazi (June 2023), *Maintaining Robust Protocols*, RFC 9413 | Original: a protocol-implementation guideline. Adaptation: forgiving input, but RFC 9413 shows that leniency hides errors, so never silently guess ambiguous input. |
| 17 | Aesthetic-usability | M. Kurosu & K. Kashimura (1995), *Apparent usability vs. inherent usability*, CHI '95 Companion, 292-293, doi:10.1145/223355.223680 (`unverified citation`: DOI from a search summary) | None | Original: correlation of perceived beauty and perceived usability. Adaptation: polish may hide defects, so it isn't a substitute for function. |
| 18 | Parkinson | C. N. Parkinson (19 Nov 1955), *Parkinson's Law*, The Economist (archive.org/details/parkinsons-law-the-economist). The 1957 book expands it | None | An observation about bureaucracies, not an HCI result. Adaptation: this skill grades **time expectations** and effort reduction, which don't follow from the original claim. |
| 19 | Occam | William of Ockham (14th century) | None | A philosophical heuristic, not an empirical law. Adaptation: prefer fewer elements. |
| 20 | Pareto | J. M. Juran (ed., 1951), *Quality Control Handbook*, McGraw-Hill ("vital few"; the 1951 page and the later 1975 correction were not located, `unverified citation`) | None | Secondary-source attribution. Adaptation: concentrate prime space on frequent actions, but it needs **usage data**, so without it report Not assessed. |

**Nielsen's heuristics** (J. Nielsen, 24 April 1994, nngroup.com/articles/ten-usability-heuristics/): heuristic 1 is *visibility of system status*, used above for progress cues.

## Caveats worth remembering
- Laws 1, 2, 5, 6, 7, 9, 10, 11 come from controlled experiments with simple stimuli. Treating them as design rules is an extrapolation.
- Laws 3, 15, 18, 19 are practitioner or folk principles. Don't present them as research results.
- Law 8 is derived from law 2. Law 20's attribution is secondary.

## What was not confirmed
- Ebbinghaus (1885): from memory only.
- Doherty and Thadhani report: authors, title and number confirmed by search, but the report itself was not opened.
- Zeigarnik (1927): volume and pages agree across search results, but the scan was not opened.
- Kurosu and Kashimura DOI: from a search summary only.
- Tesler: no primary publication. Saffer edition and page unresolved.
- Juran: 1951 page and the 1975 correction venue not located.
- ISO 9241-9 and 9241-411 catalogue entries not opened.
- Issue numbers for Cowan, Murdock, Palmer and Rock, and Fitts are partly from memory. Page ranges and DOIs were confirmed.

## Freshness
Verified on **2026-10-01**. Re-verify the table when a law's caveat changes, when you add a citation, and at least once a year.
