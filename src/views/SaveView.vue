<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useSaverStore } from '@/stores/saver.ts'
import { Cards as allCards } from '@/config/cards.ts'
import { Potions as allPotions } from '@/config/potions.ts'
import { Relics as allRelics } from '@/config/relics.ts'
import type { CardType } from '@/types/CardType.ts'
import { ElMessage, type TableInstance } from 'element-plus'
import useClipboard from 'vue-clipboard3'
import { Base64 } from 'js-base64'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useSaverStore()

const generatedCode = ref<string>()
const current_health = ref<number>(store.basicData.current_health)
const max_health = ref<number>(store.basicData.max_health)
const gold = ref<number>(store.basicData.gold)
const red = ref<number>(store.basicData.red)
const potions = ref(store.basicData.potions)
const cards = ref<CardType[]>(store.basicData.cards)
const relics = ref(store.basicData.relics)

const cardsTableRef = ref<TableInstance>()
const selectedCards = ref<CardType[]>([])
const selectedRelics = ref<string[]>([])

const dialogCardsVisible = ref(false)
const dialogRelicsVisible = ref(false)

const filterCards = ref<string>('')
const selectedCard = ref<string>('')

const filterAllCards = computed(() => {
	return Object.keys(allCards).filter(
		(x) => allCards[x].NAME.includes(filterCards.value) || x.includes(filterCards.value),
	)
})

onBeforeMount(() => {
	if (current_health.value < 0) {
		router.push({ name: 'home' })
	}
})

function onCardsSelectionChange(data: CardType[]) {
	selectedCards.value = data
}

function upgradeSelectedCards() {
	selectedCards.value.forEach((card: CardType) => {
		const index = cards.value.findIndex((x) => x.id === card.id)
		if (index > -1) {
			cards.value[index].upgrades = 1
		}
	})
	cardsTableRef.value!.clearSelection()
}

function deleteSelectedCards() {
	selectedCards.value.forEach((card: CardType) => {
		const index = cards.value.findIndex((x) => x.id === card.id)
		if (index > -1) {
			cards.value.splice(index, 1)
		}
	})
}

function onRelicsSelectionChange(data: string[]) {
	selectedRelics.value = data
}

function deleteSelectedRelics() {
	selectedRelics.value.forEach((relic: string) => {
		const index = relics.value.findIndex((x) => x === relic)
		if (index > -1) {
			relics.value.splice(index, 1)
		}
	})
}

function onCardsSelectedChange(row: string) {
	selectedCard.value = row
}

function addCard() {
	if (!selectedCard.value) {
		return
	}
	cards.value.push({
		id: selectedCard.value,
		misc: 0,
		upgrades: 0,
	})
}

function generateCode() {
	store.update({
		current_health: current_health.value,
		max_health: max_health.value,
		gold: gold.value,
		red: red.value,
		cards: cards.value,
		potions: potions.value,
		relics: relics.value,
	})
	const jsonString = JSON.stringify(store.jsonData)
	const key = ['k', 'e', 'y']
	const chars = jsonString.split('').map((c) => c.charCodeAt(0))
	for (let i = 0; i < chars.length; i++) {
		chars[i] = chars[i] ^ key[i % key.length].charCodeAt(0)
	}

	generatedCode.value = Base64.encode(String.fromCharCode(...chars))
	ElMessage.success('生成存档编码成功')
}

async function copy() {
	if (!generatedCode.value) {
		return
	}

	const { toClipboard } = useClipboard()
	try {
		await toClipboard(generatedCode.value)
		ElMessage.success('已复制到剪贴板')
	} catch (e) {
		console.error(e)
		ElMessage.error('复制失败')
	}
}
</script>

<template>
	<div>
		<h2>状态</h2>
		<div class="role">
			<span>当前生命</span>
			<el-input
				class="input"
				placeholder="请输入当前生命"
				v-model="current_health"
			></el-input>
			<span>最大生命</span>
			<el-input class="input" placeholder="请输入最大生命" v-model="max_health"></el-input>
			<span>金币数量</span>
			<el-input class="input" placeholder="请输入金币数量" v-model="gold"></el-input>
			<span>费用数量</span>
			<el-input class="input" placeholder="请输入费用数量" v-model="red"></el-input>
		</div>
		<h2>药水</h2>
		<div class="role">
			<el-select
				v-model="potions"
				multiple
				:multiple-limit="potions.length"
				placeholder="请选择"
			>
				<el-option
					v-for="item in Object.keys(allPotions)"
					:key="item"
					:label="allPotions[item].NAME"
					:value="item"
				>
				</el-option>
			</el-select>
		</div>
		<div class="flex-row">
			<div>
				<h2>卡片</h2>
				<el-button type="primary" @click="dialogCardsVisible = true">添加卡片</el-button>
				<el-button type="success" @click="upgradeSelectedCards">升级选中</el-button>
				<el-button type="danger" @click="deleteSelectedCards">删除选中</el-button>
				<el-table
					:data="cards"
					@selection-change="onCardsSelectionChange"
					ref="cardsTableRef"
				>
					<el-table-column type="selection"></el-table-column>
					<el-table-column prop="id" label="id"></el-table-column>
					<el-table-column
						:formatter="(row: CardType) => allCards[row.id].NAME"
						label="name"
					>
					</el-table-column>
					<el-table-column prop="upgrades" label="upgrades"> </el-table-column>
				</el-table>
			</div>

			<div>
				<h2>遗物</h2>
				<el-button type="primary" @click="dialogRelicsVisible = true">添加遗物</el-button>
				<el-button type="danger" @click="deleteSelectedRelics">删除选中</el-button>
				<el-table :data="relics" @selection-change="onRelicsSelectionChange">
					<el-table-column type="selection"></el-table-column>
					<el-table-column :formatter="(row: string) => row" label="id"></el-table-column>
					<el-table-column :formatter="(row: string) => allRelics[row].NAME" label="name">
					</el-table-column>
				</el-table>
			</div>
		</div>

		<el-button
			type="primary"
			style="margin-top: 30px; margin-bottom: 30px"
			@click="generateCode"
			>生成存档编码</el-button
		>
		<el-button type="primary" @click="copy" style="margin-top: 30px; margin-bottom: 30px"
			>复制到剪贴板</el-button
		>

		<el-dialog title="选择卡片" v-model="dialogCardsVisible">
			<el-input v-model="filterCards" clearable placeholder="过滤卡片 id / name"></el-input>
			<el-table
				:data="filterAllCards"
				height="450"
				highlight-current-row
				@current-change="onCardsSelectedChange"
			>
				<el-table-column type="index" width="50"> </el-table-column>
				<el-table-column :formatter="(row: string) => row" label="id"> </el-table-column>
				<el-table-column :formatter="(row: string) => allCards[row].NAME" label="name">
				</el-table-column>
				<el-table-column
					:formatter="(row: string) => allCards[row].DESCRIPTION"
					label="description"
				>
				</el-table-column>
			</el-table>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="dialogCardsVisible = false">取消</el-button>
					<el-button type="primary" @click="addCard">添加</el-button>
				</div>
			</template>
		</el-dialog>

		<!--		<el-dialog title="选择遗物" v-model="dialogRelicsVisible">-->
		<!--			<el-input v-model="filterRelics" clearable placeholder="过滤遗物 id / name"></el-input>-->
		<!--			<el-table-->
		<!--				style="margin-top: 10px"-->
		<!--				:data="tableRelicsKeys"-->
		<!--				height="420"-->
		<!--				@current-change="onRelicsSelectedChange"-->
		<!--				highlight-current-row-->
		<!--			>-->
		<!--				<el-table-column  type="index" width="50"> </el-table-column>-->
		<!--				<el-table-column header-align="center" :formatter="singleFormatter" label="id">-->
		<!--				</el-table-column>-->
		<!--				<el-table-column-->
		<!--					header-align="center"-->
		<!--					:formatter="relicsNameFormatter"-->
		<!--					label="name"-->
		<!--				>-->
		<!--				</el-table-column>-->
		<!--				<el-table-column-->
		<!--					header-align="center"-->
		<!--					:formatter="relicsDescFormatter"-->
		<!--					label="description"-->
		<!--				>-->
		<!--				</el-table-column>-->
		<!--			</el-table>-->
		<!--			<span slot="footer" class="dialog-footer">-->
		<!--				<el-button @click="dialogRelicsVisible = false">取消</el-button>-->
		<!--				<el-button type="primary" @click="addRelic">添加</el-button>-->
		<!--			</span>-->
		<!--		</el-dialog>-->
	</div>
</template>

<style scoped></style>
