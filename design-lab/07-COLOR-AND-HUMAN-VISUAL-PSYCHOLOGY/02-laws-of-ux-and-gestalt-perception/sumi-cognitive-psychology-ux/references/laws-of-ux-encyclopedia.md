# Laws of UX Encyclopedia

A comprehensive reference of 25+ empirically grounded laws and principles that govern how humans interact with interfaces. Each entry includes the formal definition, mathematical formulation (where applicable), concrete UI examples, a code snippet, an anti-pattern warning, and the original source citation.

---

## 1. Hick's Law (Hick-Hyman Law)

**Definition:** The time required to make a decision increases logarithmically with the number and complexity of available choices.

**Formula:**

```
RT = a + b × log2(n)
```

Where `RT` is reaction time, `a` is the base reaction time (independent of choices), `b` is a constant determined empirically (approximately 150ms per bit of information), and `n` is the number of equally probable choices.

**UI Examples:**
- A navigation menu with 5 well-labeled items (fast decision) versus a mega-menu with 87 links (slow, overwhelming decision). Amazon's department navigation uses progressive disclosure — top-level categories first, then subcategories on hover — to manage Hick's Law across their enormous catalog.
- A mobile app onboarding flow that asks one question per screen (e.g., Duolingo: "What language?" then "Why are you learning?" then "How much time?") rather than a single form with 10 fields.
- A search interface with autocomplete suggestions that narrows choices as the user types, progressively reducing `n` with every keystroke.

**Code Example (React TSX):**

```tsx
// Progressive disclosure: reveal options in stages to manage choice count
function CategoryPicker({ categories }: { categories: Category[] }) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const groups = [...new Set(categories.map((c) => c.group))];
  const filtered = categories.filter((c) => c.group === selectedGroup);

  return (
    <div role="group" aria-label="Category selection">
      {!selectedGroup ? (
        <ul className="category-groups">
          {groups.map((group) => (
            <li key={group}>
              <button onClick={() => setSelectedGroup(group)}>{group}</button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <button onClick={() => setSelectedGroup(null)}>Back to groups</button>
          <ul className="category-items">
            {filtered.map((cat) => (
              <li key={cat.id}>
                <button onClick={() => handleSelect(cat)}>{cat.name}</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
```

**Anti-pattern:** Displaying every available action simultaneously on a toolbar or dashboard without grouping or hierarchy. Enterprise software frequently violates Hick's Law by showing 30+ toolbar buttons at all times regardless of context.

**Source:** Hick, W.E. (1952). "On the rate of gain of information." *Quarterly Journal of Experimental Psychology*, 4(1), 11-26. Hyman, R. (1953). "Stimulus information as a determinant of reaction time." *Journal of Experimental Psychology*, 45(3), 188-196.

---

## 2. Fitts's Law

**Definition:** The time to acquire a target is a function of the distance to the target and the size of the target. Closer and larger targets are faster to reach.

**Formula:**

```
T = a + b × log2(1 + D/W)
```

Where `T` is movement time, `a` is the start/stop time (device-dependent), `b` is the inherent speed of the device (approximately 100ms/bit for a mouse), `D` is the distance from the starting point to the center of the target, and `W` is the width (size) of the target along the axis of motion.

**UI Examples:**
- macOS places the menu bar at the top edge of the screen. Because the screen edge acts as an infinite-width target (the cursor cannot overshoot), Fitts's Law predicts this placement is faster to acquire than a floating menu bar within a window — which is exactly what usability studies confirm.
- Mobile floating action buttons (FABs) positioned in the bottom-right corner of the screen sit within the natural thumb zone, minimizing `D` for right-handed users. Material Design specifies a minimum 56dp FAB size to ensure adequate `W`.
- Context menus (right-click) appear at the cursor position, setting `D` to nearly zero and making any reasonably sized menu item extremely fast to acquire.

**Code Example (CSS):**

```css
/* Apply Fitts's Law: primary actions are large with generous hit areas */
.btn-primary {
  min-height: 48px;
  min-width: 120px;
  padding: 12px 24px;
  font-size: 1rem;
}

/* Touch targets need at least 44x44pt (Apple) or 48x48dp (Material) */
.touch-target {
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Expand clickable area beyond visual bounds using padding */
.icon-button {
  width: 24px;
  height: 24px;
  padding: 12px; /* Total touch target: 48x48 */
  margin: -12px; /* Compensate visual layout */
  cursor: pointer;
}
```

**Anti-pattern:** Tiny close buttons (12x12px) in the far corners of modal dialogs. The small `W` and large `D` from center-screen content make these among the slowest targets to acquire in any interface.

**Source:** Fitts, P.M. (1954). "The information capacity of the human motor system in controlling the amplitude of movement." *Journal of Experimental Psychology*, 47(6), 381-391.

---

## 3. Miller's Law

**Definition:** The average human can hold approximately 7 (plus or minus 2) items in working memory at one time. More recent research by Cowan (2001) suggests the effective limit for novel items is closer to 4 plus or minus 1.

**Principle:** This is not a rule to always show exactly 7 items. It is a constraint on how much ungrouped information a user can actively process. The design response is chunking: organizing information into meaningful groups to extend effective capacity.

**UI Examples:**
- Phone number formatting: `2125551234` is hard to remember; `(212) 555-1234` chunks the same 10 digits into 3 memorable groups.
- Dashboard design: rather than displaying 20 individual metrics, group them into 4-5 labeled sections (Revenue, Engagement, Performance, Support) with 3-5 metrics each. Each section becomes a single "chunk" in working memory.
- Step indicators in multi-step forms: showing "Step 3 of 5" lets users hold the overall structure in working memory without needing to remember what each step contained.

**Code Example (React TSX):**

```tsx
// Chunk a long list of settings into labeled groups
interface SettingsGroup {
  label: string;
  settings: Setting[];
}

function SettingsPanel({ groups }: { groups: SettingsGroup[] }) {
  return (
    <div className="settings-panel">
      {groups.map((group) => (
        <section key={group.label} aria-labelledby={`group-${group.label}`}>
          <h2 id={`group-${group.label}`}>{group.label}</h2>
          <ul>
            {group.settings.map((setting) => (
              <li key={setting.id}>
                <SettingControl setting={setting} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

**Anti-pattern:** Presenting a flat, unsectioned list of 20+ form fields on a single page. Without chunking, users lose track of where they are, what they have completed, and what remains.

**Source:** Miller, G.A. (1956). "The magical number seven, plus or minus two: Some limits on our capacity for processing information." *Psychological Review*, 63(2), 81-97. Cowan, N. (2001). "The magical number 4 in short-term memory." *Behavioral and Brain Sciences*, 24(1), 87-114.

---

## 4. Jakob's Law

**Definition:** Users spend most of their time on other sites and apps. They prefer your product to work the same way as all the other products they already know.

**Principle:** Users transfer expectations from one product to another. When your interface matches those expectations, the learning cost is zero. When it deviates, users must invest cognitive effort in building a new mental model. Reserve novelty for your unique value proposition, not for standard interaction patterns.

**UI Examples:**
- E-commerce sites universally place the shopping cart icon in the top-right corner. A site that places it in the bottom-left will confuse users even if the placement is technically more ergonomic — because it violates the pattern users have internalized from hundreds of prior shopping experiences.
- The hamburger menu icon (three horizontal lines) is universally recognized as "navigation menu" on mobile. Replacing it with a custom icon — no matter how clever — forces users to learn a new convention.
- Pull-to-refresh on mobile: users expect downward pull to refresh content in feed-based apps. An app that uses pull-to-refresh to trigger a different action (e.g., opening settings) violates deeply ingrained motor expectations.

**Code Example (React TSX):**

```tsx
// Follow convention: standard e-commerce header layout
function StoreHeader({ cartCount }: { cartCount: number }) {
  return (
    <header className="store-header">
      {/* Left: Logo/Home — universal convention */}
      <a href="/" className="logo" aria-label="Home">
        <Logo />
      </a>

      {/* Center: Search — expected location for e-commerce */}
      <div className="search-container">
        <SearchBar />
      </div>

      {/* Right: Account + Cart — where users expect them */}
      <nav className="header-actions" aria-label="Account actions">
        <a href="/account" aria-label="My account">
          <UserIcon />
        </a>
        <a href="/cart" aria-label={`Shopping cart, ${cartCount} items`}>
          <CartIcon />
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </a>
      </nav>
    </header>
  );
}
```

**Anti-pattern:** Redesigning standard navigation patterns (tabs, breadcrumbs, back buttons) with novel interaction models that prioritize brand differentiation over usability. Snapchat's initial navigation — invisible swipe gestures with no visual affordances — was creative but hostile to new users.

**Source:** Nielsen, J. (2000). "End of Web Design." Nielsen Norman Group. Derived from the broader principle of transfer of learning in cognitive psychology.

---

## 5. Doherty Threshold

**Definition:** Productivity soars when a computer and its users interact at a pace (<400 milliseconds) that ensures that neither has to wait on the other.

**Principle:** System response times below 400ms maintain the user's flow state. Between 400ms and 1 second, users notice the delay but maintain their train of thought. Above 1 second, users begin to lose focus. Above 10 seconds, attention is lost entirely and users may abandon the task.

**UI Examples:**
- Google's search results typically render in under 300ms. This is not an accident — it is a deliberate engineering investment driven by data showing that every 100ms of latency reduces search engagement.
- Skeleton screens (content placeholders) create the perception of speed even when actual data loading takes longer, because the initial paint happens within the threshold.
- Optimistic UI updates — showing the result of an action immediately before the server confirms it — eliminate perceived latency for operations like "liking" a post or sending a message.

**Code Example (React TSX):**

```tsx
// Optimistic UI: update immediately, reconcile with server later
function LikeButton({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);

  const handleLike = async () => {
    // Optimistic update — instant feedback (0ms perceived latency)
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      await api.toggleLike(postId);
    } catch {
      // Revert on failure
      setLiked((prev) => !prev);
      setCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  return (
    <button onClick={handleLike} aria-pressed={liked}>
      {liked ? <HeartFilledIcon /> : <HeartOutlineIcon />}
      <span>{count}</span>
    </button>
  );
}
```

**Anti-pattern:** Showing a full-screen loading spinner for every server request, even for operations that could use optimistic updates or skeleton screens. A 2-second spinner for a "follow" action destroys the sense of direct manipulation.

**Source:** Doherty, W.J. & Thadhani, A.J. (1982). "The Economic Value of Rapid Response Time." *IBM Systems Journal*, 21(3), 305-316.

---

## 6. Aesthetic-Usability Effect

**Definition:** Users perceive aesthetically pleasing designs as more usable than less attractive ones, even when actual usability is equivalent.

**Principle:** Visual beauty creates a positive affective response that increases tolerance for minor usability issues, promotes creative problem-solving, and enhances the perception of credibility. This is not a license to prioritize aesthetics over function — it means that equal-function interfaces will perform differently based on visual quality, and that beauty is a legitimate usability factor.

**UI Examples:**
- Apple's products benefit enormously from this effect. Users rate macOS and iOS as "easy to use" at rates that exceed what task-completion metrics would predict, partly because the visual refinement creates a halo of competence.
- A well-designed 404 error page (like GitHub's Octocat illustration) reduces user frustration compared to a raw "Page Not Found" text page, even though the error state is identical.
- Banking apps with clean, modern interfaces receive higher trust ratings than functionally identical apps with dated visual design. The aesthetic signals competence, which signals security.

**Code Example (CSS):**

```css
/* Aesthetic-usability: refined micro-details signal quality and build trust */
.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.04);
  padding: 24px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

/* Typography that signals care and professionalism */
.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.4;
  color: #1a1a2e;
}
```

**Anti-pattern:** Using aesthetics to mask fundamental usability failures. A beautiful onboarding animation that delays access to core functionality, or a visually stunning dashboard that fails to surface actionable data, exploits the effect to the user's detriment.

**Source:** Kurosu, M. & Kashimura, K. (1995). "Apparent usability vs. inherent usability." *CHI '95 Conference Companion*, 292-293. Tractinsky, N. (1997). "Aesthetics and apparent usability: empirically assessing cultural and methodological issues."

---

## 7. Peak-End Rule

**Definition:** People judge an experience based primarily on how they felt at its most intense point (the peak) and at its end, rather than on the average quality of the experience.

**Principle:** A 30-minute interaction with one moment of delight and a satisfying conclusion will be rated higher than a uniformly pleasant 30-minute interaction with an abrupt ending. Design deliberately for peak moments and endings.

**UI Examples:**
- Mailchimp's "high five" animation after sending a campaign is a carefully designed ending that transforms the anxiety of mass-emailing into a moment of celebration, coloring the entire experience positively in retrospect.
- Duolingo's streak celebrations and XP animations create peak moments within otherwise repetitive language drills, making the overall experience feel more rewarding.
- A checkout flow that ends with a clear, informative order confirmation page (with delivery estimate, order summary, and easy access to support) creates a strong positive end even if earlier form-filling was tedious.

**Code Example (React TSX):**

```tsx
// Design the ending: celebratory completion state
function TaskCompletionScreen({ taskName, stats }: CompletionProps) {
  return (
    <div className="completion-screen" role="status" aria-live="polite">
      <div className="celebration-animation">
        <ConfettiAnimation />
        <CheckCircleIcon className="success-icon" />
      </div>
      <h1>All done!</h1>
      <p className="task-summary">
        You completed <strong>{taskName}</strong>
      </p>
      <dl className="completion-stats">
        <dt>Time saved</dt>
        <dd>{stats.timeSaved}</dd>
        <dt>Items processed</dt>
        <dd>{stats.itemCount}</dd>
      </dl>
      <div className="next-actions">
        <Button variant="primary">Start next task</Button>
        <Button variant="secondary">View summary</Button>
      </div>
    </div>
  );
}
```

**Anti-pattern:** Investing in a polished onboarding experience but neglecting the offboarding/cancellation flow. A frustrating cancellation process (dark patterns, guilt-tripping copy, hidden buttons) creates a negative ending that colors the entire product memory.

**Source:** Kahneman, D., Fredrickson, B.L., Schreiber, C.A., & Redelmeier, D.A. (1993). "When more pain is preferred to less: Adding a better end." *Psychological Science*, 4(6), 401-405.

---

## 8. Postel's Law (Robustness Principle)

**Definition:** Be liberal in what you accept and conservative in what you send.

**Principle:** Originally a networking protocol principle, in UX this translates to: accept a wide range of user inputs (formats, behaviors, errors) and provide clear, consistent, well-structured outputs. Forgiving interfaces reduce error rates and user frustration.

**UI Examples:**
- A phone number field that accepts `(212) 555-1234`, `212-555-1234`, `2125551234`, and `+1 212 555 1234` rather than requiring a single rigid format.
- A date picker that accepts typed input in multiple formats (`12/25/2025`, `Dec 25 2025`, `2025-12-25`) and normalizes internally.
- A search bar that handles typos through fuzzy matching, interprets "iphone case" and "iPhone Case" identically, and suggests corrections for "iphoen case."

**Code Example (TypeScript):**

```typescript
// Postel's Law: accept many input formats, normalize internally
function parsePhoneNumber(input: string): string | null {
  // Strip everything except digits and leading +
  const stripped = input.replace(/[^\d+]/g, "");

  // Handle various formats
  const patterns: Record<string, RegExp> = {
    tenDigit: /^(\d{3})(\d{3})(\d{4})$/,
    elevenDigit: /^1(\d{3})(\d{3})(\d{4})$/,
    international: /^\+1(\d{3})(\d{3})(\d{4})$/,
  };

  for (const regex of Object.values(patterns)) {
    const match = stripped.match(regex);
    if (match) {
      const [, area, prefix, line] = match;
      return `(${area}) ${prefix}-${line}`; // Conservative output: one format
    }
  }

  return null; // Unrecognizable input
}
```

**Anti-pattern:** Rejecting valid input because it does not match an overly strict format. A form that rejects "John O'Brien" because apostrophes are "not allowed in names" or rejects "+44 20 7946 0958" because it is "not a valid phone number" (it is — it is British) violates Postel's Law.

**Source:** Postel, J. (1980). RFC 760: DoD Standard Internet Protocol. Originally a protocol design principle, widely adopted as a UX philosophy by Alan Cooper and others.

---

## 9. Serial Position Effect

**Definition:** Users tend to best remember the first (primacy effect) and last (recency effect) items in a series.

**Principle:** Items at the beginning and end of a list, menu, or sequence receive disproportionate attention and recall. Items in the middle are most likely to be overlooked or forgotten.

**UI Examples:**
- iOS and Android bottom navigation bars place the most important actions at the far left (Home — primacy) and far right (Profile — recency) positions, with secondary features in the middle.
- Feature comparison tables should place the recommended plan in the first or last column position, not buried in the middle.
- Onboarding tours should front-load the most critical feature (primacy) and end with the most impressive or differentiating feature (recency), placing routine features in the middle.

**Code Example (React TSX):**

```tsx
// Serial position: place critical nav items at start and end
function BottomNav({ items }: { items: NavItem[] }) {
  // Ensure primary items occupy first and last positions
  const ordered = [
    items.find((i) => i.priority === "primary-start"),
    ...items.filter((i) => i.priority === "secondary"),
    items.find((i) => i.priority === "primary-end"),
  ].filter(Boolean) as NavItem[];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {ordered.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className="nav-item"
          aria-current={item.active ? "page" : undefined}
        >
          <item.Icon />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
```

**Anti-pattern:** Placing the most important call-to-action in the middle of a horizontal row of equally styled buttons, where it receives the least visual weight and worst positional recall.

**Source:** Ebbinghaus, H. (1885/1913). *Memory: A Contribution to Experimental Psychology*. Murdock, B.B. (1962). "The serial position effect of free recall." *Journal of Experimental Psychology*, 64(5), 482-488.

---

## 10. Von Restorff Effect (Isolation Effect)

**Definition:** When multiple similar objects are present, the one that differs from the rest is most likely to be remembered.

**Principle:** Visual distinction creates memorability. An item that breaks the pattern — through color, size, shape, or position — captures attention and is recalled more reliably. This is the scientific basis for visual hierarchy and accent colors.

**UI Examples:**
- Pricing tables that highlight the recommended plan with a different background color, a "Most Popular" badge, and slightly larger card size leverage Von Restorff to guide selection.
- A single red notification badge in an otherwise monochrome toolbar immediately draws attention to the item that requires action.
- Error states in forms: a field with a red border and icon stands out from correctly filled fields, ensuring the user notices and addresses the error.

**Code Example (CSS):**

```css
/* Von Restorff: make the recommended plan visually distinct */
.pricing-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
}

.pricing-card--featured {
  background: #1a1a2e;
  color: #ffffff;
  border: 2px solid #6c63ff;
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(108, 99, 255, 0.2);
  position: relative;
}

.pricing-card--featured::before {
  content: "Most Popular";
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: #6c63ff;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 16px;
  border-radius: 100px;
}
```

**Anti-pattern:** Overusing the isolation effect so that multiple elements compete for attention. If everything is bold, colorful, and oversized, nothing is distinctive and the effect collapses.

**Source:** Von Restorff, H. (1933). "Uber die Wirkung von Bereichsbildungen im Spurenfeld." *Psychologische Forschung*, 18, 299-342.

---

## 11. Tesler's Law (Law of Conservation of Complexity)

**Definition:** For any system there is a certain amount of complexity that cannot be reduced. This irreducible complexity must be handled by either the system or the user.

**Principle:** Every application has inherent complexity. The question is not whether complexity exists but who bears the burden. Good design shifts complexity from the user to the system. The email "To:" field is simple for users but requires complex address parsing, validation, and lookup behind the scenes.

**UI Examples:**
- Auto-formatting phone numbers, credit cards, and dates: the system absorbs the formatting complexity so the user can type raw digits.
- Smart defaults that pre-fill 80% of a configuration form based on the user's context (location, device, role) absorb complexity that would otherwise fall on the user.
- Google Maps absorbs enormous routing complexity (traffic, construction, toll avoidance) behind a simple "Navigate" button.

**Code Example (React TSX):**

```tsx
// Tesler's Law: absorb formatting complexity from the user
function CreditCardInput() {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    // System handles formatting — user just types digits
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setValue(formatted);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      placeholder="1234 5678 9012 3456"
      aria-label="Credit card number"
      autoComplete="cc-number"
      maxLength={19}
    />
  );
}
```

**Anti-pattern:** Oversimplifying the interface to the point where users cannot accomplish necessary tasks. A "minimalist" project management tool that removes due dates, assignees, and priorities to reduce complexity has not absorbed the complexity — it has eliminated essential functionality.

**Source:** Tesler, L. (circa 1984). Attributed to Larry Tesler during his work at Xerox PARC and Apple. Documented by Dan Saffer and others.

---

## 12. Zeigarnik Effect

**Definition:** People remember uncompleted or interrupted tasks better than completed tasks.

**Principle:** The tension of an incomplete task keeps it active in working memory. This creates a natural motivation to return and finish. Design can leverage this by showing clear progress indicators and leaving "open loops" that invite completion.

**UI Examples:**
- LinkedIn's profile completeness meter ("Your profile is 70% complete") leverages the Zeigarnik Effect to motivate users to fill in remaining sections.
- Progress bars in multi-step forms create visible incompleteness that drives task completion.
- Netflix's "Continue Watching" row exploits the discomfort of unfinished narratives to drive return visits.

**Code Example (React TSX):**

```tsx
// Zeigarnik Effect: show what remains to motivate completion
function ProfileCompleteness({ steps }: { steps: ProfileStep[] }) {
  const completed = steps.filter((s) => s.done).length;
  const percent = Math.round((completed / steps.length) * 100);
  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="completeness-widget" role="status">
      <div className="progress-ring">
        <svg viewBox="0 0 36 36">
          <path
            className="progress-bg"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="progress-fill"
            strokeDasharray={`${percent}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="percent">{percent}%</span>
      </div>
      {nextStep && (
        <div className="next-action">
          <p>Next: {nextStep.label}</p>
          <a href={nextStep.href}>Complete this step</a>
        </div>
      )}
    </div>
  );
}
```

**Anti-pattern:** Using the Zeigarnik Effect to create anxiety-inducing incompleteness metrics for non-essential actions. Pressuring users to "complete their profile" by adding optional information they do not want to share is manipulative.

**Source:** Zeigarnik, B. (1927). "Das Behalten erledigter und unerledigter Handlungen." *Psychologische Forschung*, 9, 1-85.

---

## 13. Goal-Gradient Effect

**Definition:** The tendency to increase effort as one approaches a goal. People accelerate behavior as they perceive themselves getting closer to a reward.

**Principle:** Users put in more effort when they can see the finish line. Progress indicators that show proximity to completion increase task completion rates and engagement velocity.

**UI Examples:**
- Loyalty programs that show a stamp card with 10 slots (3 already filled) generate faster purchasing behavior as customers approach the reward.
- Multi-step checkout flows with a progress bar showing "Step 3 of 4" encourage users to complete the final step rather than abandoning.
- File upload interfaces that show a percentage-based progress bar maintain user engagement through what would otherwise be an idle wait.

**Code Example (CSS):**

```css
/* Goal-gradient: progress bar that accelerates visual feedback near completion */
.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #6c63ff, #48bb78);
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Pulse animation when near completion to reinforce momentum */
.progress-bar__fill[data-percent^="9"] {
  animation: pulse-glow 1.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.4); }
  50% { box-shadow: 0 0 8px 4px rgba(72, 187, 120, 0.2); }
}
```

**Anti-pattern:** Infinite scroll feeds with no sense of progress or completion. Without a goal to approach, the gradient effect cannot engage, and users experience aimless consumption rather than purposeful interaction.

**Source:** Hull, C.L. (1932). "The goal-gradient hypothesis and maze learning." *Psychological Review*, 39(1), 25-43. Kivetz, R., Urminsky, O., & Zheng, Y. (2006). "The goal-gradient hypothesis resurrected." *Journal of Marketing Research*, 43(1), 39-58.

---

## 14. Endowed Progress Effect

**Definition:** People are more likely to complete a task if they are given artificial advancement toward completion at the outset.

**Principle:** Starting users at "20% complete" rather than "0%" — even if the advancement is artificial — increases completion rates. This works because it reframes the task from "starting from nothing" to "already underway."

**UI Examples:**
- Loyalty cards pre-stamped with 2 out of 12 stamps (instead of 0 out of 10) produce higher completion rates despite requiring the same number of purchases — the classic Nunes & Dreze (2006) car wash study.
- Account setup flows that mark "Step 1: Create account" as already complete when the user arrives at Step 2 create a sense of momentum.
- Onboarding checklists that pre-check the first item ("Create your account - Done!") before the user takes any in-app action.

**Code Example (React TSX):**

```tsx
// Endowed progress: pre-complete the first step to build momentum
function OnboardingChecklist() {
  const steps = [
    { id: "account", label: "Create your account", done: true }, // Pre-completed
    { id: "profile", label: "Set up your profile", done: false },
    { id: "invite", label: "Invite your team", done: false },
    { id: "project", label: "Create your first project", done: false },
  ];

  const completed = steps.filter((s) => s.done).length;

  return (
    <div className="onboarding-checklist">
      <h2>Get started ({completed}/{steps.length})</h2>
      <div className="progress-bar">
        <div style={{ width: `${(completed / steps.length) * 100}%` }} />
      </div>
      <ul>
        {steps.map((step) => (
          <li key={step.id} className={step.done ? "completed" : ""}>
            {step.done ? <CheckIcon /> : <CircleIcon />}
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Anti-pattern:** Pre-completing so many steps that the user feels the progress is dishonest. If "5 of 8 steps complete" is shown but the user did none of them, trust erodes. The advancement should feel earned or naturally consequential (e.g., "You already created your account — that counts!").

**Source:** Nunes, J.C. & Dreze, X. (2006). "The endowed progress effect: How artificial advancement increases effort." *Journal of Consumer Research*, 32(4), 504-512.

---

## 15. Law of Common Region

**Definition:** Elements that are within the same bounded region are perceived as belonging to the same group.

**Principle:** A visual container — a card, a border, a background color change — creates an automatic perceptual grouping that is stronger than proximity alone. Common region is one of the most powerful tools for organizing complex interfaces.

**UI Examples:**
- Card-based layouts (Material Design, iOS) use bounded regions to group related content: an image, title, description, and action button within a single card are perceived as a unit.
- Form field groups enclosed in a bordered fieldset with a legend label are perceived as related, even if they are visually distant.
- Sidebar panels and content areas separated by background color create clear regions that define where "navigation" ends and "content" begins.

**Code Example (CSS):**

```css
/* Common Region: use bounded areas to create perceptual groups */
.field-group {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  background: #f8fafc;
}

.field-group__legend {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}
```

**Anti-pattern:** Using common region without consistent internal structure. If each card in a grid has a different layout (image on top in one, on the side in another, no image in a third), the boundary creates grouping but the internal inconsistency creates confusion.

**Source:** Palmer, S.E. (1992). "Common region: A new principle of perceptual grouping." *Cognitive Psychology*, 24(3), 436-447.

---

## 16. Law of Proximity

**Definition:** Objects that are near each other are perceived as belonging to the same group.

**Principle:** Spatial distance is the simplest and most automatic grouping cue. Elements placed close together are assumed to be related; elements with space between them are assumed to be distinct. Whitespace is not empty — it is a structural element that defines relationships.

**UI Examples:**
- A label placed 4px above an input field is clearly associated with that field. The same label placed equidistant between two fields is ambiguous. The spacing ratio between label-to-field and field-to-next-label should be at least 2:1.
- Navigation menu items grouped by function with extra spacing between groups (File Edit View | Insert Format Tools | Help) communicate structure without needing divider lines.
- Dashboard metric cards with 16px gaps within a row and 32px gaps between rows create perceptual rows without explicit borders.

**Code Example (CSS):**

```css
/* Proximity: spacing ratios communicate grouping relationships */
.form-field {
  margin-bottom: 24px; /* Space between field groups */
}

.form-field label {
  display: block;
  margin-bottom: 6px; /* Tight proximity: label belongs to field */
  font-weight: 500;
  font-size: 0.875rem;
}

.form-field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.form-field .help-text {
  margin-top: 4px; /* Very tight: help text belongs to field above */
  font-size: 0.8125rem;
  color: #64748b;
}

/* 24px between fields vs 6px label-to-input = 4:1 ratio = clear grouping */
```

**Anti-pattern:** Equidistant spacing between all elements (labels, fields, buttons, headings). When everything is spaced identically, proximity cannot communicate relationships and the interface becomes a flat, undifferentiated wall of elements.

**Source:** Wertheimer, M. (1923). "Untersuchungen zur Lehre von der Gestalt II." *Psychologische Forschung*, 4, 301-350.

---

## 17. Law of Similarity

**Definition:** Elements that share visual characteristics (color, shape, size, orientation) are perceived as belonging to the same group or having the same function.

**Principle:** Visual consistency signals functional consistency. If all clickable elements are blue and underlined, users learn to scan for that pattern. If a non-clickable element shares those characteristics, users will attempt to click it.

**UI Examples:**
- All primary action buttons sharing the same color, size, and border radius across an application create a learnable pattern: "blue rounded buttons do important things."
- Tag chips that share the same shape but use different colors to indicate categories (red for urgent, blue for features, green for resolved) use similarity of shape for "these are all tags" and dissimilarity of color for "but they mean different things."
- Consistent icon styles (all outline, all filled, or all duotone) within a navigation bar signal that all items are peers.

**Code Example (SwiftUI):**

```swift
// Similarity: consistent visual treatment signals same function
struct ActionButton: View {
    let title: String
    let style: ActionStyle

    enum ActionStyle {
        case primary, secondary, destructive
    }

    var body: some View {
        Button(title) {}
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .font(.subheadline.weight(.semibold))
            .cornerRadius(8) // Same shape = same type of element
            .foregroundColor(foregroundColor)
            .background(backgroundColor)
    }

    private var foregroundColor: Color {
        switch style {
        case .primary: return .white
        case .secondary: return .blue
        case .destructive: return .white
        }
    }

    private var backgroundColor: Color {
        switch style {
        case .primary: return .blue
        case .secondary: return Color.blue.opacity(0.1)
        case .destructive: return .red
        }
    }
}
```

**Anti-pattern:** Using inconsistent visual treatment for elements with the same function. If "Save" is a filled blue button on one page, an outlined gray button on another, and a text link on a third, users cannot build a consistent scanning pattern and must re-learn the interface on every page.

**Source:** Wertheimer, M. (1923). "Untersuchungen zur Lehre von der Gestalt II." *Psychologische Forschung*, 4, 301-350.

---

## 18. Law of Pragnanz (Law of Simplicity / Good Figure)

**Definition:** People will perceive and interpret ambiguous or complex images in the simplest form possible, because it is the interpretation that requires the least cognitive effort.

**Principle:** The human visual system prefers regularity, symmetry, and simplicity. Given an ambiguous arrangement, users will see the simplest possible interpretation. Design should align with this tendency rather than fight it — use simple, regular geometric forms and clear visual structures.

**UI Examples:**
- The Olympic rings are perceived as five overlapping circles rather than a complex arrangement of arcs — because five circles is the simpler interpretation.
- A loading spinner made of 12 dots arranged in a circle is perceived as a circle, not as 12 individual dots. The Gestalt of "circle" is simpler than "twelve separate elements."
- Card grid layouts with consistent sizing and spacing are perceived as a unified grid, not as dozens of individual rectangles.

**Code Example (CSS):**

```css
/* Pragnanz: regular, symmetrical layouts leverage perceptual simplicity */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 16px;
  padding: 16px;
}

.icon-grid__item {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
  transition: background 0.15s ease;
}

.icon-grid__item:hover {
  background: #e2e8f0;
}
```

**Anti-pattern:** Irregularly sized grid items, asymmetric layouts without clear intent, or decorative elements that create visual ambiguity. If users have to work to parse the structure, the interface violates Pragnanz.

**Source:** Koffka, K. (1935). *Principles of Gestalt Psychology*. Wertheimer, M. (1923). "Untersuchungen zur Lehre von der Gestalt II."

---

## 19. Law of Uniform Connectedness

**Definition:** Elements that are visually connected are perceived as more related than elements that are not connected.

**Principle:** Lines, borders, or shared visual properties (color bands, background fills) that connect elements create stronger grouping than proximity or similarity alone. Uniform connectedness is among the strongest Gestalt grouping cues.

**UI Examples:**
- Stepper components use a connecting line between step indicators to show sequence and relationship.
- Tree views and org charts use lines connecting parent and child nodes to indicate hierarchy.
- Timeline components use a vertical or horizontal line connecting events to show temporal relationship.

**Code Example (CSS):**

```css
/* Uniform connectedness: connecting line between stepper steps */
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stepper__step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stepper__connector {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: 0 12px;
}

.stepper__connector--completed {
  background: #6c63ff;
}

.stepper__dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.stepper__dot--completed {
  background: #6c63ff;
  border-color: #6c63ff;
  color: #ffffff;
}
```

**Anti-pattern:** Using connecting lines between unrelated elements, or omitting connections between related elements in a sequential flow. A checkout stepper without connector lines between steps makes the sequence ambiguous.

**Source:** Palmer, S.E. & Rock, I. (1994). "Rethinking perceptual organization: The role of uniform connectedness." *Psychonomic Bulletin & Review*, 1(1), 29-55.

---

## 20. Law of Closure

**Definition:** The human visual system automatically completes incomplete shapes, perceiving them as whole forms.

**Principle:** Users will mentally "close" gaps in visual elements, allowing designers to suggest shapes and boundaries without drawing every pixel. This enables more minimal, elegant interfaces that rely on implication rather than explicit delineation.

**UI Examples:**
- The FedEx logo contains an implied arrow in the negative space between "E" and "x" that users perceive through closure.
- Cropped images in a horizontally scrolling carousel imply that more content exists beyond the viewport — the partially visible card signals "scroll for more" through closure.
- Dashed-line drop zones in file upload areas are perceived as complete bounded regions, inviting the user to "fill" the space.

**Code Example (CSS):**

```css
/* Closure: partially visible cards signal scrollable content */
.horizontal-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0 20px;
  /* Let the last card peek out, triggering closure */
  padding-right: 60px;
}

.horizontal-scroll__card {
  flex: 0 0 280px;
  scroll-snap-align: start;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Fade edge hints at more content through closure */
.horizontal-scroll-container {
  position: relative;
}

.horizontal-scroll-container::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 60px;
  background: linear-gradient(to right, transparent, white);
  pointer-events: none;
}
```

**Anti-pattern:** Cutting off content in a way that looks like a rendering bug rather than a deliberate design cue. If a card is 95% visible, users may think the layout is broken. If it is about 50-75% visible, the intentional peek-through is clear.

**Source:** Wertheimer, M. (1923). "Untersuchungen zur Lehre von der Gestalt II." Kanizsa, G. (1976). "Subjective contours." *Scientific American*, 234(4), 48-52.

---

## 21. Law of Continuity

**Definition:** The eye follows the smoothest path and perceives elements arranged along a line or curve as more related than elements not on the path.

**Principle:** Alignment creates continuity. Elements that share a common baseline, column edge, or curve are perceived as a coherent group. This is why grid systems work — they create invisible lines of continuity that organize the entire layout.

**UI Examples:**
- Left-aligned text creates a strong vertical line of continuity that guides the eye down the page. Center-aligned text breaks this line, making scanning harder.
- Dashboard charts aligned to a common baseline allow for rapid comparison across data series.
- Breadcrumb navigation uses a horizontal line of continuity (Home > Category > Subcategory > Current) to communicate hierarchical depth.

**Code Example (CSS):**

```css
/* Continuity: strict alignment grid creates visual flow */
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  align-items: start;
}

/* All cards share column edges for strong continuity */
.metric-card--small { grid-column: span 3; }
.metric-card--medium { grid-column: span 4; }
.metric-card--large { grid-column: span 6; }

/* Consistent left alignment within cards maintains vertical continuity */
.metric-card {
  padding: 24px;
  text-align: left;
}

.metric-card__label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 4px;
}

.metric-card__value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}
```

**Anti-pattern:** Misaligned elements that break continuity: a column of form labels where each label is offset by a few pixels, or a grid of cards where some are 1-2px off-grid. Even subtle misalignment is perceived subconsciously and creates a feeling of disorganization.

**Source:** Wertheimer, M. (1923). "Untersuchungen zur Lehre von der Gestalt II." Extended by Palmer (1999) in *Vision Science: Photons to Phenomenology*.

---

## 22. Law of Figure-Ground

**Definition:** The human visual system automatically separates perceived elements into figure (the object of focus) and ground (the background).

**Principle:** Users must be able to instantly determine what is content (figure) and what is background (ground). When figure-ground relationships are ambiguous, users experience visual confusion and increased processing time.

**UI Examples:**
- Modal dialogs use a darkened overlay (scrim) to push the underlying page into the "ground" and make the modal the "figure." Without the overlay, the relationship between modal and page is ambiguous.
- Cards with elevation (shadow) separate from the background surface, establishing clear figure-ground.
- Text on images requires sufficient contrast or an overlay gradient to maintain figure-ground legibility.

**Code Example (CSS):**

```css
/* Figure-ground: modal with scrim establishes clear depth hierarchy */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fade-in 0.15s ease;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 560px;
  width: 90%;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  animation: scale-in 0.2s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

**Anti-pattern:** Text overlaid directly on a busy photograph without an overlay, gradient, or text shadow. The text and image compete for the "figure" role, making both harder to process.

**Source:** Rubin, E. (1915/1921). *Visuell wahrgenommene Figuren*. Classical Gestalt psychology, formalized in figure-ground segregation research.

---

## 23. Parkinson's Law

**Definition:** Any task will inflate until all of the available time is spent.

**Principle:** In UX terms, if you give users a large, unconstrained space (a huge text area, an open-ended configuration panel, an unlimited time horizon), they will expand to fill it — often unproductively. Constraints improve focus and completion rates.

**UI Examples:**
- Twitter's 280-character limit forces concise communication. Without the constraint, tweets would expand into unstructured blog posts, reducing the platform's scanning efficiency.
- Timeboxed surveys ("This takes 3 minutes") set an implicit constraint that improves completion rates compared to open-ended surveys with no time estimate.
- Fixed-height text inputs for "Brief description" fields signal the expected input length, naturally constraining verbosity.

**Code Example (React TSX):**

```tsx
// Parkinson's Law: constrain input to improve focus and completion
function BriefDescription({ maxLength = 200 }: { maxLength?: number }) {
  const [value, setValue] = useState("");
  const remaining = maxLength - value.length;

  return (
    <div className="brief-description">
      <label htmlFor="desc">Brief description</label>
      <textarea
        id="desc"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
        rows={3}
        placeholder="Summarize in a few sentences..."
        aria-describedby="char-count"
      />
      <p
        id="char-count"
        className={remaining < 20 ? "warning" : ""}
        aria-live="polite"
      >
        {remaining} characters remaining
      </p>
    </div>
  );
}
```

**Anti-pattern:** Unconstrained text areas for fields that require brief input, or configuration pages with no indication of typical or recommended values. Without constraints, users either over-invest time or feel paralyzed by the open-endedness.

**Source:** Parkinson, C.N. (1955). "Parkinson's Law." *The Economist*. Applied to UX by various practitioners; see also the concept of creative constraints in design methodology.

---

## 24. Occam's Razor

**Definition:** Among competing hypotheses (or designs) that explain the same observations (or accomplish the same goals), the one with the fewest assumptions (or least complexity) should be selected.

**Principle:** The simplest design that meets the user's needs is the best design. Every additional element, interaction, or concept adds cognitive load. If a feature can be removed without degrading the core experience, it should be removed.

**UI Examples:**
- Google's homepage: a logo, a search box, and two buttons. This extreme simplicity communicates the product's singular purpose and eliminates all cognitive overhead.
- The original iPod's scroll wheel reduced MP3 player navigation from dozens of buttons to a single, learnable control.
- Stripe's payment form collects only the minimum required information (card number, expiry, CVC, zip) rather than the full billing address, reducing the form to its essential elements.

**Code Example (React TSX):**

```tsx
// Occam's Razor: minimal checkout form — only what's required
function PaymentForm() {
  return (
    <form className="payment-form" onSubmit={handlePayment}>
      <div className="field">
        <label htmlFor="card">Card number</label>
        <input id="card" type="text" inputMode="numeric" autoComplete="cc-number" />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="expiry">Expiry</label>
          <input id="expiry" type="text" placeholder="MM/YY" autoComplete="cc-exp" />
        </div>
        <div className="field">
          <label htmlFor="cvc">CVC</label>
          <input id="cvc" type="text" inputMode="numeric" autoComplete="cc-csc" />
        </div>
      </div>
      <button type="submit" className="btn-primary">Pay $29.00</button>
    </form>
  );
}
```

**Anti-pattern:** Feature creep driven by edge cases. Adding a "split payment between two cards" option to a checkout flow used by 0.1% of customers adds complexity for 100% of customers. Serve edge cases through progressive disclosure or support channels, not through default UI surface area.

**Source:** William of Ockham (circa 1287-1347). "Entities should not be multiplied beyond necessity." Applied to design by John Maeda in *The Laws of Simplicity* (2006).

---

## 25. Pareto Principle (80/20 Rule)

**Definition:** Roughly 80% of effects come from 20% of causes. In product design, approximately 80% of users use only 20% of features.

**Principle:** Identify the 20% of features that serve 80% of user needs and make those features prominent, fast, and frictionless. The remaining 80% of features should be accessible but not competing for attention with the core set.

**UI Examples:**
- Microsoft Word's ribbon interface was redesigned based on telemetry showing that a small set of commands (bold, italic, font size, paste, undo) accounted for the vast majority of usage. These commands received the most prominent placement.
- Mobile banking apps surface the 3-4 most common actions (check balance, transfer, pay, deposit) on the home screen and bury less common actions (order checks, dispute transaction, update address) in secondary menus.
- Photoshop's "Essentials" workspace shows the most commonly used panels and hides advanced panels, applying Pareto to the default view.

**Code Example (React TSX):**

```tsx
// Pareto: surface the vital few, progressively disclose the rest
function DocumentToolbar({ actions }: { actions: ToolbarAction[] }) {
  const [showMore, setShowMore] = useState(false);
  const primary = actions.filter((a) => a.usage === "high");
  const secondary = actions.filter((a) => a.usage !== "high");

  return (
    <div className="toolbar" role="toolbar" aria-label="Document tools">
      <div className="toolbar__primary">
        {primary.map((action) => (
          <button
            key={action.id}
            onClick={action.handler}
            aria-label={action.label}
            title={action.label}
          >
            <action.Icon />
          </button>
        ))}
      </div>
      <div className="toolbar__divider" />
      <button
        className="toolbar__more"
        onClick={() => setShowMore(!showMore)}
        aria-expanded={showMore}
        aria-controls="secondary-actions"
      >
        <MoreIcon />
      </button>
      {showMore && (
        <div id="secondary-actions" className="toolbar__secondary">
          {secondary.map((action) => (
            <button key={action.id} onClick={action.handler}>
              <action.Icon />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Anti-pattern:** Giving equal visual weight to all features regardless of usage frequency. A toolbar with 40 equally sized buttons where 6 are used constantly and 34 are used rarely fails to apply the Pareto Principle and violates Hick's Law simultaneously.

**Source:** Pareto, V. (1896). *Cours d'economie politique*. Applied to software by various practitioners, notably during the Microsoft Office ribbon redesign (Jensen Harris, 2006).

---

## Additional Laws: Quick Reference

### Law of Common Fate

**Definition:** Elements that move in the same direction at the same speed are perceived as a group.

**Application:** Animations that move related elements together (a card sliding in with its shadow, a button group animating as a unit) reinforce grouping. Unrelated elements moving in the same direction may be falsely perceived as related.

**Anti-pattern:** Animating unrelated UI elements simultaneously with the same easing and duration, creating false perceptual grouping.

**Source:** Wertheimer, M. (1923). Extended by Palmer (1999).

---

### Miller-Schwarz Law of Diminishing Returns in Options

**Definition:** User satisfaction increases with choices up to a threshold, then decreases rapidly.

**Application:** Offer curated defaults and smart filters rather than exhaustive unfiltered catalogs. A/B testing can identify the optimal number of displayed options for each context.

**Anti-pattern:** Infinite configuration options without guidance, recommendations, or defaults.

**Source:** Synthesized from Miller (1956), Iyengar & Lepper (2000), and Schwartz (2004) *The Paradox of Choice*.

---

### Weber's Law (Just-Noticeable Difference)

**Definition:** The just-noticeable difference between two stimuli is proportional to the magnitude of the stimulus. A change must be proportionally significant to be perceived.

**Application:** When changing prices, sizes, or quantities, the change must exceed the Weber fraction to be noticed. A $1 discount on a $100 item (1%) may go unnoticed, while $1 off a $5 item (20%) is significant. In design, small changes to typography size or spacing may not be perceptible and therefore not worth the implementation cost.

**Anti-pattern:** Making visual changes so subtle that users cannot perceive them, then attributing lack of response to disinterest rather than imperceptibility.

**Source:** Weber, E.H. (1834). *De Pulsu, Resorptione, Auditu et Tactu: Annotationes Anatomicae et Physiologicae*.

---

This encyclopedia is a living reference. Each law should be considered not in isolation but in relationship with others — Fitts's Law and Hick's Law together inform menu design; Miller's Law and the Serial Position Effect together shape list architecture; the Aesthetic-Usability Effect and Jakob's Law together explain why a beautiful but unconventional interface may test well in first impressions but poorly in repeated use. Great design holds multiple laws in tension and finds the solution that optimizes across them.
