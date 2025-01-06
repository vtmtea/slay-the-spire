import type { CardType } from '@/types/CardType.ts'

export interface ISaveSpireDataType {
	current_health: number
	max_health: number
	gold: number
	red: number
	cards: CardType[]
	potions: string[]
	relics: string[]
}
