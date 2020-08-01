import { each } from '@lumino/algorithm';
import { Widget } from '@lumino/widgets';
import { JSONExt, JSONObject } from '@lumino/coreutils';
import { NotebookPanel } from '@jupyterlab/notebook';
import {
  IObservableJSON,
  IObservableList,
  IObservableUndoableList
} from '@jupyterlab/observables';
import { Cell, ICellModel } from '@jupyterlab/cells';

export const CELL_TAGS_CLASS = 'jupyterlab-show-cell-tags';

export default class CellTagsWidget extends Widget {
  constructor(panel: NotebookPanel) {
    super();
    this._panel = panel;
    const cells = this._panel.context.model.cells;
    cells.changed.connect((cells, changed) => {
      this.updateConnectedCell(cells, changed);
    });
    each(cells, cell => this._registerMetadataChanges(cell));
  }

  updateConnectedCell(
    cells: IObservableUndoableList<ICellModel>,
    changed: IObservableList.IChangedArgs<ICellModel>
  ) {
    changed.oldValues.forEach(cm => this._deregisterMetadataChanges(cm));
    changed.newValues.forEach(cm => this._registerMetadataChanges(cm));
  }

  /**
   * Connect a handler for metadata changes to the given cell model, and update
   * the corresponding cell to display its tags.
   */
  private _registerMetadataChanges(cellModel: ICellModel) {
    if (!(cellModel.id in this._cellSlotMap)) {
      const fn = (): void => this._updateCell(cellModel);
      cellModel.metadata.changed.connect(fn);
      this._cellSlotMap[cellModel.id] = fn;
      this._updateCell(cellModel);
    }
  }

  /**
   * Remove the handler for metadata changes to the given cell model, and remove
   * the cell tag display from the corresponding cell.
   */
  private _deregisterMetadataChanges(cellModel: ICellModel) {
    const fn = this._cellSlotMap[cellModel.id];
    if (fn) {
      cellModel.metadata.changed.disconnect(fn);
      this._removeCellTagsNode(cellModel);
    }
    delete this._cellSlotMap[cellModel.id];
  }

  /**
   * Find the input area for the cell with the given model.
   */
  private _findInputAreaNodeForCell(cellModel: ICellModel): HTMLElement | null {
    const cell = this._panel.content.widgets.find(
      (widget: Cell) => widget.model === cellModel
    );
    return cell.inputArea.node;
  }

  /**
   * Create or update the node which displays the cell tags for the cell with
   * the given model.
   */
  private _createOrUpdateCellTagsNode(cellModel: ICellModel, text: string) {
    const inputAreaNode = this._findInputAreaNodeForCell(cellModel);
    let cellTagsNode: HTMLDivElement = inputAreaNode.querySelector(
      `.${CELL_TAGS_CLASS}`
    );
    if (!cellTagsNode) {
      cellTagsNode = document.createElement('div') as HTMLDivElement;
      cellTagsNode.className = CELL_TAGS_CLASS;
      inputAreaNode.append(cellTagsNode);
    }

    if (cellTagsNode.innerText !== text) {
      cellTagsNode.innerText = text;
    }
  }
  /**
   * Delete the node which displays the cell tags for the cell with the given
   * model.
   */
  private _removeCellTagsNode(cellModel: ICellModel) {
    const inputAreaNode = this._findInputAreaNodeForCell(cellModel);
    const cellTagsNode = inputAreaNode.querySelector(`.${CELL_TAGS_CLASS}`);
    if (cellTagsNode) {
      cellTagsNode.remove();
    }
  }

  /**
   * Update the cell with the given model so it displays its cell tags.
   */
  private _updateCell(cellModel: ICellModel) {
    const tags = cellModel.metadata.get('tags') as JSONObject;
    if (tags && JSONExt.isArray(tags)) {
      const text = tags.map(t => '[' + t + ']').join(' ');
      this._createOrUpdateCellTagsNode(cellModel, text);
    } else {
      this._removeCellTagsNode(cellModel);
    }
  }

  private _cellSlotMap: {
    [id: string]: (
      sender: IObservableJSON,
      args: IObservableJSON.IChangedArgs
    ) => void;
  } = {};
  private _panel: NotebookPanel;
}
