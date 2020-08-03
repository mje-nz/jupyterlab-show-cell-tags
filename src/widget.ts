import { Widget } from '@lumino/widgets';
import { JSONExt, JSONObject } from '@lumino/coreutils';
import { Cell } from '@jupyterlab/cells';

const CSS_CLASS = 'jp-celltagswidget';
const CSS_CLASS_TAGS = 'jp-celltagswidget-tags';

/** Widget which displays the cell tags for a cell in the corner of the input
 * area.
 */
export class CellTagsWidget extends Widget {
  constructor(cell: Cell) {
    super();
    this._cell = cell;

    this.node.className = CSS_CLASS;
    const tagsNode = document.createElement('div');
    tagsNode.className = CSS_CLASS_TAGS;
    this.node.append(tagsNode);

    this._cell.model.metadata.changed.connect(this.update, this);
    this.update();
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }
    this._cell.model.metadata.changed.disconnect(this.update, this);
    this._cell = null;
    super.dispose();
  }

  update() {
    const tags = this._cell.model.metadata.get('tags') as JSONObject;
    let text = '';
    if (tags && JSONExt.isArray(tags)) {
      text = tags.map(t => '[' + t + ']').join(' ');
    }
    const node = this.node.firstChild as HTMLElement;
    if (node.innerText !== text) {
      node.innerText = text;
    }
  }

  private _cell: Cell;
}
