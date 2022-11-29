import { window } from 'vscode'
import axios from 'axios'

const BASE_URL: string = 'http://drome.top:8888'
export const USER_INFO_KEY: string = 'userInfo'
export const ACCESS_TOKEN_KEY: string = 'accessToken'

const request = (url: any, data: any) => {
  return new Promise<void>((resolve, reject) => {
    axios
      .post(BASE_URL + url, data)
      .then(function (response) {
        // handle success
        window.showInformationMessage('handle success! ' + response?.data?.data)
        console.log(response?.data?.data)
        const { request, config, data, status } = response
        const code = data && data.code ? data.code : status
        if (code === 200) {
          resolve(data.data)
        } else {
          reject(data.msg)
        }
      })
      .catch(function (error) {
        console.error('request error', error)
        reject(error)
      })
      .finally(function () {
        // always executed
      })
  })
}

export const loginApi = (data: { username: string; password: string }) => {
  return request('/base/login', data)
}
