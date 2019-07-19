import { exampleSetup } from 'prosemirror-example-setup';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import {
  schema as basicSchema,
  marks as basicMarks,
  nodes as basicNodes
} from 'prosemirror-schema-basic';
import {
  withRegisters,
  CollabClipboardPlugin,
} from '../lib';

const schema = withRegisters(basicSchema);
const plugins = exampleSetup({ menuBar: false, schema });
const state = EditorState.create({
  plugins: [...plugins, CollabClipboardPlugin],
  schema,
});
const view = new EditorView(
  document.querySelector('#editor'),
  { state },
);
