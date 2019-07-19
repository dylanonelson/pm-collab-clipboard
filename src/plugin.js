import { Plugin } from 'prosemirror-state';
import { Slice } from 'prosemirror-model';
import { __serializeForClipboard as serializeForClipboard } from 'prosemirror-view';
import { MoveStep } from './Steps';

function searchFragment(fragment, checker) {
  for (let i = 0; i < fragment.childCount; i += 1) {
    if (checker(fragment.child(i))) {
      return fragment.child(i);
    }
  }
  return null;
}

function findMatchingRegister(doc, slice) {
  const { lastChild: registerSlot } = doc;
  const slotPos = doc.nodeSize - 2 - registerSlot.nodeSize;

  for (let i = 0, pos = slotPos + 1; i < registerSlot.childCount; i += 1) {
    const child = registerSlot.child(i);
    if (child.content.eq(slice.content) &&
        child.attrs.openStart === slice.openStart &&
        child.attrs.openEnd === slice.openEnd) {
      return [child, pos];
    }
    pos += child.nodeSize;
  }

  return null;
}

export function handlePaste(view, event, slice) {
  const register = findMatchingRegister(view.state.doc, slice)
  if (register === null) {
    return null;
  }
  const [node, pos] = register;
  const { openStart, openEnd } = node.attrs;
  const { tr } = view.state;
  const start = pos + 1 + openStart;
  const end = pos + node.nodeSize - 1 - openEnd;
  const dest = view.state.selection.from;
  const finalSlice = view.state.doc.slice(start, end);
  tr.step(
    new MoveStep(start, end, dest)
  );
  tr.replace(tr.mapping.map(pos + openStart + openEnd, Slice.empty))
  view.dispatch(tr);
  return true;
}

export function handleCut(view, event) {
  const { from, to } = view.state.selection;
  const slice = view.state.doc.slice(from, to);
  const { doc } = view.state;
  const registerSlotPos = doc.nodeSize - 2 - doc.lastChild.nodeSize;

  // handle clipboard serialization:
  // https://github.com/ProseMirror/prosemirror-view/blob/39a761792f98eb36709ea25dd17cf0215a4f7d6b/src/
  const data = event.clipboardData;
  const { dom, text } = serializeForClipboard(view, slice)
  event.preventDefault()
  data.clearData()
  data.setData("text/html", dom.innerHTML)
  data.setData("text/plain", text)

  const { tr } = view.state;

  const registerType = searchFragment(slice.content, node => node.isInline)
    ? doc.type.schema.nodes.register_inline
    : doc.type.schema.nodes.register_block;

  tr.insert(registerSlotPos + 1, registerType.create(
    {
      openStart: slice.openStart,
      openEnd: slice.openEnd,
    },
  ));

  const registerPos = registerSlotPos + 2;

  tr.step(new MoveStep(from, to, registerPos));

  view.dispatch(tr);

  return true;
}

export const CollabClipboardPlugin = new Plugin({
  props: {
    handlePaste,
    handleDOMEvents: {
      cut: handleCut,
    },
  },
});
