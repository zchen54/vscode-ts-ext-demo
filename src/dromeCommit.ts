import axios from 'axios'
import { ExtensionContext, window, workspace, extensions, commands } from 'vscode'
import { GitExtension } from './types/git'

// ? 参考 https://github.com/RedJue/git-commit-plugin

//获取是否在git扩展内 Gets whether it is in the git extension
function getGitExtension(): GitExtension | undefined {
  const vscodeGit = extensions.getExtension<GitExtension>('vscode.git')
  const gitExtension = vscodeGit && vscodeGit.exports
  return gitExtension
}

export async function dromeCommit(context: ExtensionContext) {
  const gitExtension = getGitExtension()
  if (!gitExtension?.enabled) {
    window.showErrorMessage('Git extensions are not currently enabled, please try again after enabled!')
    return false
  }
  //获取当前的 git仓库实例 Get git repo instance
  let repo: any = gitExtension.getAPI(1).repositories[0]

  const quickPick = window.createQuickPick()
  quickPick.placeholder = '搜索关联的任务项'
  quickPick.items = []
  quickPick.onDidChangeSelection((selection) => {
    if (selection[0]) {
      quickPick.hide()
      commands.executeCommand('workbench.view.scm')
      repo.inputBox.value = 'Drome任务项' + selection[0].label
    }
  })
  quickPick.onDidChangeValue((value) => {
    quickPick.items = [1, 2, 3].map((item, index) => ({ label: 'option_' + index + '_' + value }))
  })
  quickPick.onDidHide(() => quickPick.dispose())
  quickPick.show()
}
