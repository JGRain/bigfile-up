import { useState } from 'react'
import axios from 'axios'
import logo from './logo.svg'
import './App.css'
// import Upload from './1'

function App() {
	const [file, setFile] = useState(null)

	const onChange = ({ target: { files } }) => {
		setFile(files[0])
	}

	// 开始上传
	const upload = (files) => {
		if (!files) return
		// 创建切片
		let size = 1024 * 1024 * 1 // 1m
		let fileChunks = []
		let index = 0 // 切片序号

		for (let cur = 0; cur < file.size; cur += size) {
			fileChunks.push({
				hash: index++,
				chunk: file.slice(cur, cur + size),
			})
		}
		// 控制并发和断点续传
		const uploadFileChunks = async function (list) {
			if (list.length === 0) {
				console.log('请求merge')
				await axios({
					method: 'get',
					url: 'http://localhost:3000/merge',
					params: {
						filename: file.name,
					},
				})
				console.log('全部上传')
			}

			//
			let pool = [] // 并发池
			let max = 3 // 最大并发量
			let finish = 0 // 完成并发的数量
			let failList = [] // 失败的列表

			for (let index = 0; index < list.length; index++) {
				const element = list[index]
				let formData = new FormData()
				formData.append('filename', file.name)
				formData.append('hash', element.hash)
				formData.append('chunk', element.chunk)
				// 切片上传
				let task = axios({
					method: 'post',
					url: 'http://localhost:3000/upload',
					data: formData,
				})
				task
					.then((data) => {
						let index = pool.findIndex((t) => t === task)
						pool.splice(index)
					})
					.catch(() => {
						failList.push(element)
					})
					.finally(() => {
						finish++
						// 所有请求都请求完成
						if (finish === list.length) {
							uploadFileChunks(failList)
						}
					})

				pool.push(task)
				if (pool.length === max) {
					await Promise.race(pool)
				}
			}
		}
		uploadFileChunks(fileChunks)
	}

	const uploadClick = () => {
		upload(file)
	}
	return (
		<div className="App">
			{/* <Upload /> */}

			<input type="file" name="" id="fileInput" onChange={onChange} />
			<button onClick={uploadClick}>上传</button>
		</div>
	)
}

export default App
