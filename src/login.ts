import axios from 'axios'
import { ExtensionContext, window, workspace } from 'vscode'
import { loginApi, USER_INFO_KEY, ACCESS_TOKEN_KEY } from './request'

export async function checkLogin(context: ExtensionContext, callback?: Function) {
  const accessToken = context.globalState.get(ACCESS_TOKEN_KEY)
  let username = '',
    password = ''
  const defaultUsername = workspace.getConfiguration('drome-support').get('username') as string
  const defaultUserPassword = workspace.getConfiguration('drome-support').get('userPassword') as string
  console.log('-------------- defaultUsername: ', defaultUsername, defaultUserPassword)
  if (defaultUsername) {
    username = defaultUsername
  } else {
    username = (await window.showInputBox({
      value: '',
      placeHolder: '请输入用户名',
      prompt: '请输入登录 Drome-ALM 的用户名',
      validateInput: (text) => {
        // window.showInformationMessage(`Validating: ${text}`)
        return !text ? '用户名不能为空' : null
      },
    })) as string
  }
  if (defaultUserPassword) {
    password = defaultUserPassword
  } else {
    password = (await window.showInputBox({
      value: '',
      placeHolder: '请输入用户密码',
      prompt: '请输入登录 Drome-ALM 的用户密码',
      validateInput: (text) => {
        // window.showInformationMessage(`Validating: ${text}`)
        return text.length < 6 ? '密码不能少于6位' : null
      },
    })) as string
  }
  try {
    const res: any = await loginApi({ username, password })
    console.log('登录成功', res)
    if (res.token && res.user) {
      context.globalState.update(ACCESS_TOKEN_KEY, res.token)
      context.globalState.update(USER_INFO_KEY, res.user)
    }
  } catch (error: any) {
    window.showErrorMessage(error)
    console.error(error)
  }
}
