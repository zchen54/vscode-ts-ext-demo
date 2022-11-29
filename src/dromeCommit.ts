import axios from 'axios'
import { ExtensionContext, window } from 'vscode'
import { loginApi, USER_INFO_KEY, ACCESS_TOKEN_KEY } from './request'

export async function dromeCommit(context: ExtensionContext) {
  const accessToken = context.globalState.get(ACCESS_TOKEN_KEY)
  if (accessToken) {
  } else {
    const username = await window.showInputBox({
      value: '',
      placeHolder: '请输入用户名',
      prompt: '请输入登录 Drome-ALM 的用户名',
      validateInput: (text) => {
        // window.showInformationMessage(`Validating: ${text}`)
        return !text ? '用户名不能为空' : null
      },
    })
    if (username) {
      const password = await window.showInputBox({
        value: '',
        placeHolder: '请输入用户密码',
        prompt: '请输入登录 Drome-ALM 的用户密码',
        validateInput: (text) => {
          // window.showInformationMessage(`Validating: ${text}`)
          return text.length < 6 ? '密码不能少于6位' : null
        },
      })
      if (password) {
        console.log(username + '_' + password)
        loginApi({ username, password }).then(
          (res: any) => {
            console.log('登录成功', res)
            if (res.token && res.user) {
              context.globalState.update(ACCESS_TOKEN_KEY, res.token)
              context.globalState.update(USER_INFO_KEY, res.user)
            }
          },
          (err) => {
            window.showErrorMessage(err)
            console.error(err)
          }
        )
      }
    } else {
      console.log('取消登录')
    }
  }
}
