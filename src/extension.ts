// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import axios from 'axios'
import { dromeCommit } from './dromeCommit'
import { USER_INFO_KEY, ACCESS_TOKEN_KEY } from './request'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-ts-ext-demo" is now active!')

  let dromeCommitCmd = vscode.commands.registerCommand('vscode-ts-ext-demo.dromeCommit', () => dromeCommit(context))

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('vscode-ts-ext-demo.showMessage', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    const loginUser: any = context.globalState.get(USER_INFO_KEY)
    if (loginUser) {
      vscode.window.showInformationMessage(loginUser.name + '已登录')
    } else {
      const message = 'Hello, welcome to Drome-ALM'
      vscode.window.showInformationMessage(message)
    }
  })

  let testAxios = vscode.commands.registerCommand('vscode-ts-ext-demo.testAxios', () => {
    axios
      .post('http://drome.top:8888/base/login', { username: 'admin', password: '1234567890' })
      .then(function (response) {
        // handle success
        vscode.window.showInformationMessage('handle success! ' + response?.data?.data)
        console.log(response?.data?.data)
      })
      .catch(function (error) {
        vscode.window.showInformationMessage('handle error')
        // handle error
        console.log(error)
      })
      .finally(function () {
        // always executed
      })
  })

  context.subscriptions.push(dromeCommitCmd)
  context.subscriptions.push(disposable)
  context.subscriptions.push(testAxios)
}

// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
  context.globalState.update('token', undefined)
}
