<script setup lang="ts">
import { ref } from 'vue'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { genFileId } from 'element-plus'
import { Base64 } from 'js-base64'
import { useSaverStore } from '@/stores/saver.ts'
import { useRouter } from 'vue-router'

const upload = ref<UploadInstance>()
const store = useSaverStore()
const router = useRouter()

const handleExceed: UploadProps['onExceed'] = (files) => {
	upload.value!.clearFiles()
	const file = files[0] as UploadRawFile
	file.uid = genFileId()
	upload.value!.handleStart(file)
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
	const fileReader = new FileReader()
	fileReader.readAsText(file)
	fileReader.onload = () => {
		const key = ['k', 'e', 'y']
		const result = Base64.decode(<string>fileReader.result)
			.split('')
			.map((x) => x.charCodeAt(0))
		for (let i = 0; i < result.length; i++) {
			result[i] = result[i] ^ key[i % key.length].charCodeAt(0)
		}
		const json = JSON.parse(String.fromCharCode(...result))
		console.log(json)
		store.initial(json as never)
		router.push('/save')
	}
	return false
}

const submitUpload = () => {
	upload.value!.submit()
}
</script>

<template>
	<el-upload
		ref="upload"
		class="upload-demo"
		action=""
		accept=".autosave"
		:limit="1"
		:on-exceed="handleExceed"
		:before-upload="beforeUpload"
		:auto-upload="false"
	>
		<template #trigger>
			<el-button type="primary">选择文件</el-button>
		</template>
		<el-button class="ml-3" type="success" @click="submitUpload">解析</el-button>
		<template #tip>
			<div class="el-upload__tip text-red">
				limit 1 file, new file will cover the old file
			</div>
		</template>
	</el-upload>
</template>
