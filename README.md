# Rebasing cut-and-pastes in ProseMirror

This module is an experiment with making a “collaborative clipboard” in [ProseMirror](https://prosemirror.net).

By default, when two users’ changes conflict - in other words, when they are made at the same time, based on the same version of the document - and the second user's changes are rebased over the first, the second user’s cut-and-pastes will reflect the state of the document when they made their change, not the state of the document after the first user finished making their changes.

This module changes that behavior by introducing a MoveStep, which, instead of serializing the pasted content directly into the step, records only the positions of the moved content and its destination. Thus, the second user’s rebased cut-and-paste will in fact include the first user’s changes when they fall within the slice that was cut and then pasted.
