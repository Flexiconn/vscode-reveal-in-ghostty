import childProcess from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { window, commands, type ExtensionContext, workspace } from 'vscode';
import open from 'open';
import { logMessage } from './debug';

export const promiseExec = promisify(childProcess.exec);

/**
 * Open given path in Ghostty
 * XXX: This supposed to work cross-platform but was only tested on macOS,
 * and may need adjustments for other platforms
 */
async function openGhostty(filepath: string) {
  try {
    await open(filepath, { app: { name: 'ghostty' } });
  } catch (error) {
    logMessage('Cannot open Ghostty:', error);
    if (error instanceof Error) {
      window.showErrorMessage(error.message ?? 'Something went wrong');
    }
  }
}

export function activate(context: ExtensionContext) {
  logMessage('📂 Reveal in Ghostty starting...');

  context.subscriptions.push(
    // TODO: Fallback to a folder when no file is open
    commands.registerCommand('revealInGhostty.revealFile', () => {
      const { uri } = window.activeTextEditor?.document ?? {};
      if (uri === undefined) {
        window.showWarningMessage('Open a file to use Reveal in Ghostty');
        return;
      }

      const folderPath = path.dirname(uri.fsPath);

      logMessage('Reval file', folderPath);

      openGhostty(folderPath);
    }),
    // TODO: Don't rely on active document in case there's no open file
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

      openGhostty(projectPath);
    }),
  );
}
