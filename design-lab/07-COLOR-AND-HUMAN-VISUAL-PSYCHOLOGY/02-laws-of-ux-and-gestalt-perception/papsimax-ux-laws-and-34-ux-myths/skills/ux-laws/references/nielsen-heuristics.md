# Nielsen's 10 Usability Heuristics

*Originally defined by Jakob Nielsen for the Nielsen Norman Group ([nngroup.com](https://www.nngroup.com)).*

Baseline grid for any usability audit. Each heuristic: definition, what to check, common violation.

## 1. Visibility of system status
**Definition**: the system should always keep users informed about what is going on, through appropriate feedback within a reasonable time.
**Check**: loading states, action confirmations, indication of the current step in a multi-step process.
**Common violation**: clicking "Submit" with no visual feedback for several seconds, the user clicks again or thinks it failed.

## 2. Match between system and the real world
**Definition**: speak the user's language (words, concepts, logical order) rather than internal technical jargon.
**Check**: does the wording of labels, icons, and messages match what the target user already understands?
**Common violation**: a raw technical error message ("Error 500 - NullPointerException") shown as-is to the end user.

## 3. User control and freedom
**Definition**: provide clear "emergency exits" (cancel, undo, redo) for actions taken by mistake.
**Check**: does every important action have a way to cancel or go back?
**Common violation**: a permanent deletion with no confirmation and no undo.

## 4. Consistency and standards
**Definition**: keep words, situations, and actions consistent throughout the interface; follow platform conventions.
**Check**: does the same component behave the same way everywhere in the product?
**Common violation**: a "Confirm" button that closes the modal in one place and saves without closing elsewhere.

## 5. Error prevention
**Definition**: it's better to design to prevent a problem than to produce a good error message after the fact.
**Check**: do forms prevent obvious errors (date format, required fields visible) before submission?
**Common violation**: a free-text date field with no input mask or real-time validation.

## 6. Recognition rather than recall
**Definition**: minimize memory load by making objects, actions, and options visible; the user shouldn't have to remember information from one screen to the next.
**Check**: does the user need to remember a code, a previous choice, or some information to continue their journey?
**Common violation**: asking the user to retype a reference number already shown three screens earlier.

## 7. Flexibility and efficiency of use
**Definition**: offer shortcuts for experienced users without getting in the way of novices.
**Check**: are there accelerators (keyboard shortcuts, favorites, quick actions) for frequent users?
**Common violation**: forcing the full flow every time even for a repetitive action a power user performs 20 times a day.

## 8. Aesthetic and minimalist design
**Definition**: screens should only contain relevant information; every superfluous element dilutes attention from what matters.
**Check**: does every visible element actually serve the screen's purpose?
**Common violation**: a dashboard showing 15 metrics at once with no hierarchy, drowning out the one actionable metric.

## 9. Help users recognize, diagnose, and recover from errors
**Definition**: error messages should be in plain language, precisely indicate the problem, and suggest a solution.
**Check**: does an error message say what to do, not just what failed?
**Common violation**: "An error occurred" with no further detail or possible action.

## 10. Help and documentation
**Definition**: even though a product should be usable without documentation, contextual help should be available, easy to search, and focused on the user's task.
**Check**: is help accessible right when the user needs it, in their context?
**Common violation**: a general external FAQ, with no contextual help on the screen in question.
