import * as vscode from 'vscode'

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from our extension's `media` directory.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
  }
}

export class WorkflowPanel {
  public static readonly viewType = 'drome.workflowView'
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: WorkflowPanel | undefined

  private readonly _panel: vscode.WebviewPanel
  private readonly _extensionUri: vscode.Uri
  private _disposables: vscode.Disposable[] = []

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined

    // If we already have a panel, show it.
    if (WorkflowPanel.currentPanel) {
      WorkflowPanel.currentPanel._panel.reveal(column)
      return
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      WorkflowPanel.viewType,
      '工作流程',
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri)
    )

    WorkflowPanel.currentPanel = new WorkflowPanel(panel, extensionUri)
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    WorkflowPanel.currentPanel = new WorkflowPanel(panel, extensionUri)
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel
    this._extensionUri = extensionUri

    // Set the webview's initial html content
    this._update()

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update()
        }
      },
      null,
      this._disposables
    )

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text)
            return
          case 'refactor':
            vscode.window.showErrorMessage(message.message)
            return
        }
      },
      null,
      this._disposables
    )
  }

  public dispose() {
    WorkflowPanel.currentPanel = undefined

    // Clean up our resources
    this._panel.dispose()

    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  private _update() {
    const webview = this._panel.webview
    // Vary the webview's content based on where it is located in the editor.
    this._panel.webview.html = this._getHtmlForWebview(webview)
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'))

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'))
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'))
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'))

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce()

    console.log('-------------- nonce: ', nonce)

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
     <meta charset="UTF-8">
 
     <!--
      Use a content security policy to only allow loading images from https or from our extension directory,
      and only allow scripts that have a specific nonce.
     -->
     <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
 
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
 
     <link href="${styleResetUri}" rel="stylesheet">
     <link href="${styleVSCodeUri}" rel="stylesheet">
     <link href="${styleMainUri}" rel="stylesheet">
 
     <title>Cat Coding</title>
    </head>
    <body>
    <div id="app">
     <h1 class="lines-of-code-counter">1</h1>

				<button class="add-color-button">Add Count</button>

    </div>
 
     <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`
  }
}

function getNonce() {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
