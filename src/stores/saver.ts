import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ISaveSpireDataType } from '@/types/SaverDataType.ts'

export const useSaverStore = defineStore('saver', () => {
	const basicData = ref<ISaveSpireDataType>({
		current_health: -1,
		max_health: -1,
		gold: -1,
		red: -1,
		cards: [],
		potions: [],
		relics: [],
	})
	const jsonData = ref({})

	function initial(payload: never) {
		jsonData.value = payload
		basicData.value.current_health = payload['current_health']
		basicData.value.max_health = payload['max_health']
		basicData.value.gold = payload['gold']
		basicData.value.red = payload['red']
		basicData.value.cards = payload['cards']
		basicData.value.potions = payload['potions']
		basicData.value.relics = payload['relics']
	}

	function update(payload: ISaveSpireDataType) {
		basicData.value.current_health = payload.current_health
		basicData.value.max_health = payload.max_health
		basicData.value.gold = payload.gold
		basicData.value.red = payload.red
		basicData.value.cards = payload.cards
		basicData.value.potions = payload.potions
		basicData.value.relics = payload.relics
		jsonData.value = {
			...jsonData.value,
			...basicData.value,
		}
	}

	return { basicData, jsonData, initial, update }
})
