import { IDisposable } from '@lumino/disposable';
import { PanelLayout } from '@lumino/widgets';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { NotebookPanel } from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
  IObservableList,
  IObservableUndoableList
} from '@jupyterlab/observables';
import { ICellModel } from '@jupyterlab/cells';

import { CellTagsWidget } from './widget';

/**
 * Watch a notebook, and each time a cell is created add a CellTagsWidget to it.
 */
export class CellTagsTracker implements IDisposable {
  constructor(panel: NotebookPanel) {
    this._panel = panel;
    const cells = this._panel.context.model.cells;
    cells.changed.connect(this.updateConnectedCells, this);
  }

  get isDisposed() {
    return this._isDisposed;
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    const cells = this._panel.context.model.cells;
    cells.changed.disconnect(this.updateConnectedCells, this);
    this._panel = null;
  }

  updateConnectedCells(
    cells: IObservableUndoableList<ICellModel>,
    changed: IObservableList.IChangedArgs<ICellModel>
  ) {
    changed.newValues.forEach(cm => this.addWidgetToCell(cm));
  }

  private addWidgetToCell(cellModel: ICellModel) {
    const cell = this._panel.content.widgets.find(
      widget => widget.model === cellModel
    );
    const widget = new CellTagsWidget(cell);
    (cell.inputArea.layout as PanelLayout).addWidget(widget);
  }

  private _panel: NotebookPanel;
  private _isDisposed = false;
}

/**
 * Widget extension that creates a CellTagsTracker each time a notebook is
 * created.
 */
export class ShowCellTagsExtension implements DocumentRegistry.WidgetExtension {
  createNew(panel: NotebookPanel) {
    return new CellTagsTracker(panel);
  }
}

/**
 * Initialization data for the jupyterlab-show-cell-tags extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-show-cell-tags',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    app.docRegistry.addWidgetExtension('Notebook', new ShowCellTagsExtension());
  }
};

export default plugin;
