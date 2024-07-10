
import * as vscode from 'vscode'
import * as console from "node:console"
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function hashFile(filePath: string) {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash('md5');
		const stream = fs.createReadStream(filePath);

		stream.on('data', (data: any) => hash.update(data));
		stream.on('end', () => resolve(hash.digest('hex')));
		stream.on('error', (err: any) => reject(err));
	});
}

function writeTextToClipboard(text: string) {
	vscode.env.clipboard.writeText(text).then(() => {
		vscode.window.showInformationMessage(`已复制： ${text}`);
	})
}

export function activate(context: vscode.ExtensionContext) {
	const currentExplorerPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : null
	console.log('haha', currentExplorerPath)
	let command = vscode.commands.registerCommand('extension.imageRenameByHash',  async function (uri) {
		console.log(uri.fsPath)
		if (uri && uri.fsPath) {
			try {
				const hash = await hashFile(uri.fsPath);
				const fileExtension = uri.fsPath.split('.').pop();
				const newFilePath = `${uri.fsPath.substring(0, uri.fsPath.lastIndexOf('/'))}/${hash}.${fileExtension}`;

				console.log(newFilePath)

				fs.rename(uri.fsPath, newFilePath, (err: any) => {
					if (err) {
						vscode.window.showErrorMessage(`重命名失败: ${err.message}`)
					} else {
						if (currentExplorerPath !== null) {
							let relative_path = path.relative(currentExplorerPath, newFilePath)
							console.log(relative_path)
							writeTextToClipboard(relative_path)
						} else {
							vscode.window.showInformationMessage(`获取相对路径失败`)
						}
					}
				})
			} catch (err: any) {
				vscode.window.showErrorMessage(`重命名失败: ${err.message}`)
			}
		}
		vscode.window.showInformationMessage(`定位到文件: ${uri.fsPath}`)
	})

	context.subscriptions.push(command)
}

// This method is called when your extension is deactivated
export function deactivate() {}
