// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const FormData = require('form-data')

const isDebug = false


const uploadFile = (filePath, { remotePath, overseas = false, token = "", onProgress, onSuccess, onFail }) => {

	const fileInfo = fs.statSync(filePath)

	const stream = fs.createReadStream(filePath)

	const form = new FormData()
	form.append('remotePath', remotePath)
	overseas && form.append('overseas', "1")
	form.append('file', stream)

	let currentSize = 0
	const totalSize = fileInfo.size

	stream.on('data', (buffer) => {
		currentSize += buffer.length
		const data = {
			filePath,
			currentSize,
			chunkSize: buffer.length,
			totalSize,
			rate: currentSize / totalSize
		}
		onProgress && onProgress(data)
	})

	try {
		form.submit({
			protocol: 'http:',
			host: isDebug ? 'localhost' : 'fe.smartcinema.com.cn',
			port: isDebug ? '8001' : undefined,
			path: '/api/upload/file',
			method: 'POST',
			headers: {
				// "x-csrf-token": "",
				"x-access-token": token
			},
		}, (err, res) => {
			if(err) {
				onFail && onFail({ code: -2, err, msg: "网络请求失败，请检查本地和服务器网络状况" })
				return
			}
			res.setEncoding('utf-8')
			res.on('data', (response) => {
				response = JSON.parse(response)
				if(response.code === 0) {
					onSuccess && onSuccess(response.data)
				} else {
					onFail && onFail(response)
				}
			})
		})
	} catch (e) {
		console.log("exception", e)
		onFail && onFail({ code: -1, e, msg: "创建请求发生异常，请检查参数信息" })
	}
}

const exec = async (overseas = false) => {
	const config = vscode.workspace.getConfiguration()

		let token = config.get("token")

		if(!token) {
			token = await vscode.window.showInputBox({ prompt: '请输入您的gitlab token' })
			if(token) {
				config.update("token", token, true)
			} else {
				vscode.window.showErrorMessage("AccessToken输入有误")
				return
			}
		} 

		const files = await vscode.window.showOpenDialog({  })

		if(!files || !files.length) return

		const filePath = files[0].path.replace(/^\//, "")

		const fileExt = path.extname(filePath)

		let remotePath = `${Date.now()}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}${fileExt}`

		remotePath = await vscode.window.showInputBox({ 
			title: "远程路径",
			prompt: "请指定远程路径，如：web/image-test-001.jpg",
			value: remotePath
		 })
		 
		remotePath = remotePath.replace(/(\.\w+)*$/, fileExt) // 修正用户输入的错误的文件扩展名

		vscode.window.withProgress({
			title: "上传文件",
			location: vscode.ProgressLocation.Notification
		}, (progress) => new Promise(resolve => {

			progress.report({ message: '开始上传...', increment: 0 })

			uploadFile(filePath, {
				token,
				remotePath: remotePath,
				overseas,
	
				onProgress: (data) => {
					console.log("time onProgress", new Date(), data.rate)
					progress.report({
						message: `已上传 ${(data.rate * 100).toFixed(2)}%`,
						increment: data.rate * 100
					})
				},
				onFail: ({ msg }) => {
					resolve()
					vscode.window.showErrorMessage(`上传失败：${msg}`)
				},
				onSuccess: (url) => {
					vscode.window.activeTextEditor.edit(textEditor => {
						textEditor.insert(vscode.window.activeTextEditor.selection.active, url)
					})
					vscode.window.showInformationMessage(`上传成功`)
					resolve()
				}
			})
		}))

		
}


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('smartcinema-file-upload', async () => {
		return await exec()
	});

	let disposableIntl = vscode.commands.registerCommand('smartcinema-file-upload-intl', async () => {
		return await exec(true)
	});

	context.subscriptions.push(disposable, disposableIntl);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
