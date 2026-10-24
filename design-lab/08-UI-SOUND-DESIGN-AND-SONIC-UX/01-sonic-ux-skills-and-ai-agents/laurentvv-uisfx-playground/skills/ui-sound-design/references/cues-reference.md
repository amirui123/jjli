# UI SFX - Semantic Cues Reference (78 Cues)

The 78 cues are divided across 13 interaction categories.

## 1. Input (Pointer, key, and touch contact)
* `hover` : Fine-pointer discovery without commitment. (Use sparingly!)
* `press` : A control is physically engaged.
* `release` : A pressed control springs back.
* `double-click` : A rapid secondary activation.
* `focus` : A control becomes ready for keyboard or text input.
* `long-press` : A sustained press reveals a secondary action.

## 2. Selection (Choosing, switching, and changing state)
* `select` : An item enters the active set (tab change, radio select).
* `deselect` : An item leaves the active set.
* `toggle-on` : A binary setting becomes active.
* `toggle-off` : A binary setting becomes inactive.
* `check` : A checkbox or task enters its completed state.
* `uncheck` : A checkbox returns to its incomplete state.

## 3. Navigation (Moving through views and layers)
* `open` : A menu, sheet, modal dialog, or detail view appears.
* `close` : A menu, sheet, modal dialog, or detail view recedes.
* `back` : Navigation returns to the previous place.
* `forward` : Navigation advances to the next place.
* `expand` : An accordion or collapsed region reveals more detail.
* `collapse` : An expanded region returns to its compact state.

## 4. Editing (Reversible and destructive modifications)
* `delete` : A destructive removal is committed.
* `cancel` : A pending action is abandoned without applying.
* `undo` : The most recent change is reversed.
* `redo` : A reversed change is applied again.
* `copy` : Selected content is placed on the clipboard.
* `paste` : Clipboard content is inserted.

## 5. Movement (Dragging, snapping, spatial gestures)
* `drag-start` : An object lifts from its resting place.
* `drop` : A dragged object lands in a valid target.
* `invalid-drop` : A dragged object cannot land in the current target.
* `snap` : An object locks into a precise grid/slot position.
* `swipe` : A touch gesture moves content spatially.
* `reorder` : An item settles into a new position in a sequence.

## 6. Communication (Messages and attention)
* `send` : A message or object leaves the user.
* `receive` : A response or object arrives.
* `notification` : New information is available, without urgency.
* `mention` : The user is directly addressed (@user).
* `typing` : Subtle tactile key contact during text entry.
* `reaction` : A lightweight social response is added (emoji/like).

## 7. Feedback (Clear outcomes and system status)
* `success` : An action finished with the expected result.
* `error` : An action failed and needs attention.
* `warning` : A risky or consequential state needs review.
* `info` : A neutral system fact is surfaced.
* `blocked` : An action cannot continue in the current state.
* `retry` : A failed action is attempted again.

## 8. Progress (Processes from start to finish)
* `start` : A process, recording, or session begins.
* `stop` : A process, recording, or session ends.
* `progress-step` : A discrete step advances inside a longer process.
* `complete` : A multi-step process reaches its final state.
* `queued` : Work is accepted and waiting to begin.
* `checkpoint` : A meaningful stage in a longer process is saved.

## 9. Loops (Continuous states while active)
*Note: Loops run indefinitely until explicitly stopped via `handle.stop()`.*
* `loading` : A quiet repeating pulse while an interface fetches or waits.
* `processing` : A restrained repeating bed while sustained work is running.
* `recording` : A calm periodic pulse while audio or video capture is live.
* `connecting` : A repeating search pattern while a device or session connects.
* `scanning` : A spatial sweep while content/devices are discovered.
* `streaming` : A quiet repeating flow while live data or media continues.

## 10. Media (Playback, seeking, listening controls)
* `play` : Media playback begins or resumes.
* `pause` : Media playback pauses.
* `seek` : The playback position moves.
* `volume-change` : Playback loudness moves to a new level.
* `skip-next` : Playback advances to next item.
* `skip-previous` : Playback returns to previous item.

## 11. System (Connections, access, device state)
* `connect` : A device, service, or live session becomes available.
* `disconnect` : A device or service goes offline.
* `lock` : Access closes or protected state engages.
* `unlock` : Access opens or protected state disengages.
* `wake` : Interface becomes active.
* `sleep` : Interface enters dormant state.

## 12. Reward (Milestones, value, celebration)
* `reward` : Small unit of value received.
* `level-up` : Capability, rank, or level progression.
* `achievement` : Rare milestone celebrated.
* `streak` : Repeated participation extends streak.
* `badge` : Collectible distinction awarded.
* `bonus` : Unexpected extra reward revealed.

## 13. Commerce (Cart, checkout, value exchange)
* `add-to-cart` : Item added to cart.
* `remove-from-cart` : Item removed from cart.
* `checkout` : Cart advances to payment flow.
* `purchase` : Transaction completed.
* `coupon` : Discount code accepted.
* `refund` : Value returned.
