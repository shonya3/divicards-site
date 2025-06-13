import { DiscordUsername } from '../../../gen/avatars';

export type UsefulResource = {
	url: string;
	title: string;
	discordUsers: DiscordUsername[];
	github?: string;
	icon?: CustomIcon;
	seeWebsitePage?: WebsitePage;
};

export type WebsitePage = { relativeUrl: string; label: string };
export type CustomIcon = { kind: 'image'; url: string; alt: string } | { kind: 'sl-icon'; name: string };
