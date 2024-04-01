export const DISCORD_AVATARS = {
	nerdyjoe: {
		username: 'nerdyjoe',
		color: 'rgb(52, 152, 219)',
		url: 'https://cdn.discordapp.com/avatars/212041922150137857/ed0f38962063b40da72b39db7662c3bf.webp',
	},
	Jasmine: {
		username: 'Jasmine',
		color: 'rgb(52, 152, 219)',
		url: 'https://cdn.discordapp.com/avatars/89395995351220224/7407cb784d48cee6661e7dcb539fdcbd.webp',
	},
};

export type DiscordUsername = keyof typeof DISCORD_AVATARS;
