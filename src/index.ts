import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab-show-cell-tags extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-show-cell-tags',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-show-cell-tags is activated!');
  }
};

export default extension;
