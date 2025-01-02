import childProcess from 'node:child_process';
import { promisify } from 'node:util';
import { window, commands, type ExtensionContext, workspace } from 'vscode';
import { logMessage } from './debug';
import path from 'node:path';

export const promiseExec = promisify(childProcess.exec);

/**
 * Execute command with error handling
 */
async function execute(command: string) {
  try {
    await promiseExec(command);
  } catch (error) {
    logMessage('Cannot execute command:', error);
    if (error instanceof Error) {
      window.showErrorMessage(error.message ?? 'Something went wrong');
    }
  }
}

export function activate(context: ExtensionContext) {
  logMessage('📂 Reveal in Ghostty starting...');

  context.subscriptions.push(
    commands.registerCommand('revealInGhostty.revealFile', () => {
      const { uri } = window.activeTextEditor?.document ?? {};
      if (uri === undefined) {
        window.showWarningMessage('Open a file to use Reveal in Ghostty');
        return;
      }

      const folderPath = path.dirname(uri.fsPath);

      logMessage('Reval file', folderPath);

      execute(`open -a 'Ghostty' '${folderPath}'`);
    }),
    commands.registerCommand('revealInGhostty.revealProject', () => {
      const { uri } = window.activeTextEditor?.document ?? {};
      if (uri === undefined) {
        window.showWarningMessage('Open a file to use Reveal in Ghostty');
        return;
      }

      const projectPath = workspace.getWorkspaceFolder(uri)?.uri.fsPath;
      if (projectPath === undefined) {
        window.showWarningMessage('Open a workspace to use Reveal in Ghostty');
        return;
      }

      logMessage('Reval project', projectPath);

      execute(`open -a 'Ghostty' '${projectPath}'`);
    }),
  );
}
