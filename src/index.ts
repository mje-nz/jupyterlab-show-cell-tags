import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  INotebookTracker,
  INotebookModel,
  NotebookPanel
} from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import CellTagsWidget from './widget';

class CellTagsWidgetExtension implements DocumentRegistry.WidgetExtension {
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ) {
    return new CellTagsWidget(panel);
  }
}

/**
 * Initialization data for the jupyterlab-show-cell-tags extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-show-cell-tags',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, tracker: INotebookTracker) => {
    app.docRegistry.addWidgetExtension(
      'Notebook',
      new CellTagsWidgetExtension()
    );
  }
};

export default extension;
