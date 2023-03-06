import React, { useState } from 'react'
type filesTs = any[] | null

export default () => {
	const [file, setFile] = useState<filesTs>(null)

	const onChange = (target: { files }) => {
		setFile(files[0])
	}

	const upload = (files: filesTs) => {
		if (files.length) {
		}
	}

	const uploadClick = () => {
		upload(file)
	}

	return (
		<>
			<input type="upload" name="" id="fileInput" onChange={onChange} />
			<button onClick={uploadClick}>上传</button>
		</>
	)
}
