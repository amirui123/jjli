/* Essay mode: the article and one "scene" per section.

   EDIT ME. Each section's text is SlavisTon's article "Ein Stein, One Stone",
   verbatim (from notes/slaviston-article.md); please do not reword it here.
   The scene is what the map shows while that section is active:

     scheme    colour preset id. Article maps: flipped, chains, stacks, shells,
               axes, roles, molecule, grain. David Ryan's: pastel, rainbow,
               grey, hands, plain. Explorations: ancestry, census.
     v         the view, as in the address bar's v=: [dP0, dP1, zoom, turnDeg,
               dR0, dR1]. Zoom is pixels per hat unit (8 is the default).
               In Explore mode, "Copy scene" in the Options panel gives the
               current view and settings in this format.
     shape     tile shape slider in degrees: 0 chevron, 30 hat, 45 spectre,
               60 turtle, 90 comet.
     outlines  supertile outlines on/off.
     grid      optional, triangular grid on/off.
     ancLevel  optional, supertile level 1-5 for the "ancestry" scheme.
     ms        optional, flight time in milliseconds (default 1400).
*/
window.ESSAY = {
  "title": "Ein Stein, One Stone",
  "author": "Slavis Frank (@SlavisTon)",
  "authorUrl": "https://x.com/SlavisTon",
  "articleUrl": "https://x.com/i/article/2096987878857334785",
  "postUrl": "https://x.com/slaviston/status/2097027746329169990",
  "date": "2026-09-07",
  "imageBase": "../../essay/img/",
  "sections": [
    {
      "id": "stone",
      "label": "One stone",
      "paras": [
        "The hat is thirteen sides and nothing else. A retired print technician cut it out of paper in Yorkshire. Four mathematicians proved that copies of it fill the plane without gap or overlap and without ever settling into a repeating lattice. That proof ended a fifty-year question. It also left the shape looking simpler than it is.",
        "A periodic tile is simple in the way a brick is simple. Once you know the brick, you know the wall. The hat is simple in a different sense. There is only one piece. The piece, however, is not doing only one thing. It has a face and a back. It has six headings. It nests against copies of itself at one exact distance, or it does not. It belongs to a substitution the size of a room, or to a cluster the size of a coin. None of that is visible if you paint every hat the same color. Sameness is what the uniqueness of the tile invites, and sameness is what hides the work.",
        "So the hats were colored by what they were doing."
      ],
      "images": [],
      "scene": {
        "scheme": "pastel",
        "v": [
          0,
          0,
          14,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "orientations",
      "label": "Twelve orientations",
      "paras": [
        "There are twelve orientations: six rotations, two faces. Color those twelve and a grain appears — not a grid, a current. Diagonal bands that almost line up, then slip. Pull the window back to twice the tiles, then four, eight, sixteen. The slip recurs at every scale. Self-similar, not periodic. The plane is remembering a rule it is not allowed to close."
      ],
      "images": [
        {
          "caption": "Twelve orientations.",
          "files": [
            "2096995719613673472.jpg"
          ]
        }
      ],
      "scene": {
        "scheme": "rainbow",
        "v": [
          0,
          0,
          4,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "flipped",
      "label": "The rare face",
      "paras": [
        "One face is rare. The flipped hats are about one in eight. In the large, every flipped hat is matched by φ⁴ unflipped ones — a power of the same number that governs the pentagon and the sunflower. They do not drift."
      ],
      "images": [
        {
          "caption": "The rare flipped face.",
          "files": [
            "2097000004950843393.jpg"
          ]
        }
      ],
      "scene": {
        "scheme": "flipped",
        "v": [
          0,
          0,
          7,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "chains",
      "label": "Chains by direction",
      "paras": [
        "Every flipped tile has exactly two unflipped neighbors at one distance, and those two neighbors always share a single heading. That heading is a direction. There are six. Join the flipped tile to the stacks on either side and the field resolves into rivers: pair — flip — triple — flip — pair. A Fibonacci word, drawn. Gold, off the rivers, is everything the chains do not need."
      ],
      "images": [
        {
          "caption": "Chains by direction. (1)",
          "files": [
            "2096998407034531840.jpg"
          ]
        }
      ],
      "scene": {
        "scheme": "chains",
        "v": [
          0,
          0,
          4.5,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "stacks",
      "label": "Position on the stack",
      "paras": [
        "The stacks themselves are austere. Same heading, centroids exactly √3 apart, and only two legal lengths — a pair, or a straight triple. Nothing longer. No L. The graph of those contacts has three degrees and three degrees only. Degree 0 is a loner. Degree 1 is an end. Degree 2 is the middle of a triple, one tile per triple, and there is no degree 3. Mark the middle gold and the ends rust and the triples become arrows. The pairs have no gold. The plane is not a texture of hats. It is a population of short rods and the rare tiles that hinge them."
      ],
      "images": [
        {
          "caption": "Position on the stack. (2)",
          "files": [
            "2097002213155680256.jpg"
          ]
        }
      ],
      "scene": {
        "scheme": "stacks",
        "v": [
          0,
          0,
          9,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "distance",
      "label": "Distance to the nearest flip",
      "paras": [
        "Distance to the nearest flip is not a landscape. No hat is far. The range is about 1.56 to 3.03, seven discrete shells, then another flip. The rare face is not a scattering of accidents. It is a lattice with short spacing, sparse enough to be counted, dense enough that the ordinary tiles never escape it."
      ],
      "images": [
        {
          "caption": "Distance to the nearest flipped tile. (3)",
          "files": [
            "2097002725343199232.jpg"
          ]
        }
      ],
      "scene": {
        "scheme": "shells",
        "v": [
          0,
          0,
          9,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "axes",
      "label": "Three axes",
      "paras": [
        "Identify rotations 180° apart and twelve orientations collapse to three axes. The three unflipped axes have almost the same census. The grain, with the least ink on the page, is already the picture the original papers were pointing at: three families of chains, the flipped hats sitting in the joints as ink."
      ],
      "images": [
        {
          "caption": "Three axes, 180° identified. (4)",
          "files": [
            "2097003141661339648.jpg"
          ]
        }
      ],
      "scene": {
        "scheme": "axes",
        "v": [
          0,
          0,
          5,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "roles",
      "label": "Substitution roles",
      "paras": [
        "Every hat is also born inside a substitution, as H, T, P, F, or H1. H1 is not a fifth shape. H1 is the flipped tile, every one of them. T is scarce — a few hundred in a field of tens of thousands — and sits like a seed. Color the five roles and the larger F-domains appear as olive countries the substitution is in the act of writing."
      ],
      "images": [
        {
          "caption": "Substitution roles. (5)",
          "files": [
            "2097004168083087360.jpg"
          ]
        }
      ],
      "scene": {
        "scheme": "roles",
        "v": [
          0,
          0,
          4,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": true
      }
    },
    {
      "id": "shells",
      "label": "Flip and three-shell",
      "paras": [
        "Then the shells. Each flipped tile has three adjacent unflipped hats. Those three are never shared. In one field: 3,144 flips times three equals 9,432 shells, which is exactly the number of H tiles. The rare face and the common H are not two facts. They are the same motif, counted twice. A four-tile cluster, packed across the plane, never touching its own kind. That is as close as this tiling comes to a molecule."
      ],
      "images": [
        {
          "caption": "Flip and three-shell. (6)",
          "files": [
            "2097004527459467264.jpg"
          ]
        }
      ],
      "scene": {
        "scheme": "molecule",
        "v": [
          0,
          0,
          10,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "grain",
      "label": "Grain phase",
      "paras": [
        "Ignore heading, ignore face, and project every centroid onto the grain — here 54° — and wrap that coordinate. Close in, the phase looks like noise. At four times the tiles the diagonal beat returns. At sixteen times it is a current: tight, diagonal, never quite a stripe. Quasiperiodic. The current was in the positions before any color was assigned. Color only made it confess."
      ],
      "images": [
        {
          "caption": "Grain phase. (7)",
          "files": [
            "2097019249994993664.jpg"
          ]
        }
      ],
      "scene": {
        "scheme": "grain",
        "grainPeriod": 1.732,
        "v": [
          0,
          0,
          2,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "simple",
      "label": "What is simple",
      "paras": [
        "What, then, is simple.",
        "A square is simple because its copies have no inner life. They translate and the wall is done. The hat is simple because the inner life has been compressed into one outline. Face and back, six headings, two stack lengths, three graph degrees, four-tile shells, five substitution roles, six chain directions — all of that is carried by a thirteen-sided polykite you can cut from card. The extraordinariness is not that the pattern fails to repeat. Plenty of things fail to repeat. The extraordinariness is that the failure is organized: finite local choices, exact distances, a substitution that inflates without ever becoming a crystal, a rare face that is both punctuation and joint."
      ],
      "images": [],
      "scene": {
        "scheme": "pastel",
        "v": [
          0,
          0,
          10,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "probe",
      "label": "Colour is a probe",
      "paras": [
        "Color does not decorate that. Color is a probe. Each map asks one question the outline will not answer by itself. Orientation, chirality, stack, chain, distance, axis, role, shell, phase. No single map is the tiling. The tiling is what remains when the maps agree — when the three-shell of the flip is the H tile, when the middle of the triple is the only degree-2 vertex, when the six rivers are the six headings of the unflipped stacks."
      ],
      "images": [],
      "scene": {
        "scheme": "chains",
        "v": [
          0,
          0,
          3,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": false
      }
    },
    {
      "id": "stone2",
      "label": "One stone is enough",
      "paras": [
        "David Smith found a stone. The proof showed that one stone is enough to cover the world without a repeat. The colorings only say what the stone is busy doing while it does that. It is a small number of things. It does them exactly. That is the opposite of chaos, and it is the reason a shape this plain can be inexhaustible.",
        "Note: The underlying geometry follows Smith, Myers, Kaplan, and Goodman-Strauss, 2023. The maps color a hierarchical hat field by orientation, adjacency at √3, and substitution label."
      ],
      "images": [
        {
          "caption": "Legends for the above images (1, 2, 3, 4)",
          "files": [
            "2097009325617086464.png",
            "2097009325839708160.png",
            "2097009325768359936.png",
            "2097009325654847488.png"
          ]
        },
        {
          "caption": "Legends for images (5, 6, 7)",
          "files": [
            "2097014490743308288.png",
            "2097014490768510976.png",
            "2097014490747609088.png"
          ]
        }
      ],
      "scene": {
        "scheme": "pastel",
        "v": [
          0,
          0,
          1.6,
          0,
          0,
          0
        ],
        "shape": 30,
        "outlines": true
      }
    }
  ]
};
