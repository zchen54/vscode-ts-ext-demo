// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
;(function () {
  const vscode = acquireVsCodeApi()

  document.querySelector('.add-color-button').addEventListener('click', () => {
    document.querySelector('.lines-of-code-counter').innerHTML = document.querySelector('.lines-of-code-counter').innerHTML * 1 + 1
  })

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', (event) => {
    const message = event.data // The json data that the extension sent
    switch (message.type) {
      case 'addColor': {
        break
      }
      case 'clearColors': {
        break
      }
    }
  })
})()
