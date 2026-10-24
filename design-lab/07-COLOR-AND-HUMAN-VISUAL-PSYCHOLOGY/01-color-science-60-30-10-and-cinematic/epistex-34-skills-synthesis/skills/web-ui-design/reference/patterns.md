# Pattern catalog

Most screens are one page type in one style family. Pick both from here, then tailor the tokens to the subject. The page type fixes structure, UX and the rendering budget. The family gives starting tokens only. The brief and the user's brand assets override both.

## Page types

Sections are listed in order. Drop a section the content cannot fill honestly, and never pad one with invented proof.

### Persuade

| Page type | Sections | UX patterns | Rendering |
| --- | --- | --- | --- |
| **Product landing** | Hero with the value in one line, the primary action and a real product visual; proof from the user; 3 to 5 benefits, each shown with product detail; how it works; pricing summary; FAQ; closing action; footer | One primary action, repeated at the top and the end. Anchor nav of 5 items or fewer | Static. JS under 50 KB, 2 font files or fewer, hero image sized and preloaded. Run the checker with `--budget landing` |
| **Local business or service** | Hero with what, where and the primary action (book, call, visit); offer with prices; how to start; place, hours and directions; proof; FAQ; footer | The primary action stays one thumb away on phones (a sticky bottom bar). Phone, address and email are `tel:`, map and `mailto:` links. Hours say whether it is open now | Static. Same budget as product landing, including `--budget landing` |
| **Pricing** | Plans (2 to 4, one marked as recommended); billing period toggle; feature comparison; FAQ; action | The toggle keeps the selected plan. The comparison stacks per plan on phones | Static |
| **Portfolio or studio** | Work grid of real images; case studies; about; contact | Images open large. The grid keeps aspect ratios | Static. Lazy-load below the fold, every image with dimensions |
| **Store listing and product** | Listing: filters, sort, grid. Product: gallery, price, variants, add to cart, delivery and returns, reviews | Add-to-cart confirms in place and updates a visible cart count. Filters open in a sheet on phones | Server-rendered or static for search, with the cart as the interactive part |

### Operate

| Page type | Sections | UX patterns | Rendering |
| --- | --- | --- | --- |
| **Dashboard** | What needs attention now; 3 to 5 key numbers with a comparison; the main queue or chart; secondary panels; recent activity | The first screen answers "what needs me now". Numbers use tabular figures. Live data shows its time | Client app or server-rendered with hydration. Interactions under 200 ms. Virtualize lists over 200 rows |
| **List and detail** | Toolbar (search, filters, create); list or table; detail panel or page; bulk actions | Filters and selection live in the URL. Status changes apply at once with undo. No results and no data are different empty states. Rows stack on phones | Same as dashboard |
| **Form and settings** | Grouped sections with headings; labels above fields; a danger zone last | Validate a field when it loses focus. Keep input on error. Disable submit only while sending. Confirm success in place | Any. Submit feedback within 100 ms |
| **Onboarding and sign-in** | One task per step; progress; the action | Allow skipping where possible. Errors appear inline at the field. Autofill attributes on every field | Any |

Operate screens for occasional or non-expert users, or on touch devices, use 17 to 18px body text and 44px targets throughout, with the Dense tool family's restraint.

### Read

| Page type | Sections | UX patterns | Rendering |
| --- | --- | --- | --- |
| **Docs** | Nav, content, on-page contents (three columns, collapsing to a menu on phones); search; code blocks with copy; previous and next links | Headings have anchor links. The current section is highlighted in the contents | Static. No JS needed to read |
| **Article or long read** | Title and lead; one column of about 65 characters; headings, figures and quotes; related reading | Large readable body text. Images have captions | Static. Tiny JS |
| **Help center** | Search first; categories; article with numbered steps; "did this help"; contact fallback | Search tolerates typos and shows the top answer first | Static with client search |

## Style families

Each family is a starting point. Brand colors and marks from the user replace the family's palette, and every token is then tailored to the subject.

| Family | Fits | Type | Color | Shape and depth | Density and motion |
| --- | --- | --- | --- | --- | --- |
| **Swiss minimal** | Products, portfolios, docs | One grotesk sans, strong size contrast | Neutral ramp plus one saturated accent | Radius 0 to 4, borders only | Generous space, little motion |
| **Editorial** | Publishing, culture, food, long reads, brand stories | Serif display with a sans or serif body, large headlines | A ground taken from the subject's material, ink text, one accent | Radius 0 to 2, hairline rules instead of cards | Spacious, one orchestrated moment |
| **Dense tool** | Apps used daily by experts | One neutral sans at 13 to 14px, tabular figures | Neutral ramp, accent for actions only, status ramps | Radius 4 to 6, borders or tonal layers | Compact rows of 32 to 36px, instant state changes |
| **Soft and friendly** | Consumer, family, health, education | Rounded or humanist sans, 17 to 18px body | Light tinted grounds from the brand, 2 brand colors | Radius 12 to 20, ring plus soft shadow | Comfortable spacing, gentle motion |
| **Technical** | Developer tools, infrastructure, data | Sans for UI, mono only for code and data | Dark or light neutral with one signal accent | Radius 4 to 8, borders and subtle grids | Medium density, quick motion |
| **Premium dark** | Luxury, hospitality, high-end goods | Refined serif or light sans, tracking only on small labels | Near-black with one deep or metallic tone, high-contrast text | Radius 0 to 4, tonal layers | Spacious, slow fades |
| **Playful** | Kids, games, creative communities, food brands | A characterful display face with a plain body | Several bright colors, each with one fixed role | Large or mixed radius, thick borders or offset shadows | Springs allowed on rare moments |
| **Raw** | Art, music, fashion, statement brands | Grotesk or system type at extreme sizes | Black and white with one clashing color | Radius 0, thick borders, no shadow | Dense, abrupt or no motion |

When offering families in the question round, describe each in one line from this table in the subject's terms, such as "Editorial: big serif headlines and paper-like pages, like a printed magazine".
