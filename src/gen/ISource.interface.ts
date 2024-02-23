export type SourceWithMember = {
	type: SourceType;
	id: string;
	kind: SourceWithMemberKind;
	min_level?: number;
	max_level?: number;
};
export type EmptySourceKind = 'empty-source';
export type SourceWithMemberKind = 'source-with-member';
export type Kind = EmptySourceKind | SourceWithMemberKind;
export type EmptySource = {
	type: SourceType;
	id: string;
	kind: EmptySourceKind;
	min_level?: number;
	max_level?: number;
};
export type ISource = SourceWithMember | EmptySource;
export const SOURCE_TYPE_VARIANTS = [
	'Act',
	'Map',
	'Act Boss',
	'Map Boss',
	"Maven's Invitation: The Feared",
	'Uul-Netol, Unburdened Flesh (in Breachstones)',
	'The Vaal Omnitect',
	'Metamorph',
	'Null Portal',
	'Vaal Flesh Merchant',
	"All Incursion Architects in Alva missions or Alva's Memory",
	'All Incursion Architects (The Temple of Atzoatl)',
	'All Abyss Monsters',
	'All (Scourge) beyond demons',
	'All Rogue Exiles',
	'Venarius',
	'Argus',
	'All Invasion Bosses',
	'All Vaal Side Area Bosses',
	'Breachlord Boss Domain',
	'Architect',
	'Shaper Guardian Boss',
	'Syndicate Member',
	'Elder Slayer',
	'Elder Guardian Boss',
	'Rogue Exile',
	'Female Rogue Exile',
	'Abyss Lich Boss',
	'Maps Only',
	'Harbinger Portal',
	'Endgame Boss',
	'Delve Boss',
	'Beast Boss',
	'Heist Boss',
	'Beyond Boss',
	'Expedition Logbook Boss',
	'Betrayal Catarina',
	'Oshabi Boss',
	'Eldritch Perfection Monster',
	'Shaper Mini-Boss',
	'Trial of Stinging Doubt',
	'The Temple of Atzoatl',
	'All Vaal side areas (need specific information)',
	'Vaal Side Areas',
	'Redeemer influenced maps',
	'Expedition Logbook',
	'Labyrinth Trial Areas',
	'Area-Specific',
	'Atziri Area',
	'Unique heist contract or boss',
	'Chest',
	'Strongbox',
	'Vendor',
	'Maelström of Chaos with Barrel Sextant',
	'Delirium',
	'Delirium Currency Rewards',
	'Disabled',
	'Global Drop',
] as const;

export type SourceType = (typeof SOURCE_TYPE_VARIANTS)[number];
