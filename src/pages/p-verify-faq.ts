import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

declare global {
	interface HTMLElementTagNameMap {
		'p-verify-faq': VerifyFaqPage;
	}
}

@customElement('p-verify-faq')
export class VerifyFaqPage extends LitElement {
	render() {
		return html`
			<article>
				<h1>Welcome to #faq!</h1>

				link to Divcord faq by Jasmine:
				<a href="https://discord.com/channels/834368692560461846/991125635391033404">FAQ in Discord</a>
				<!-- ==================== SECTION #1 =================== -->
				<section>
					<h2>
						<p>============================================</p>
						1. What is difficult to accept as drop data?
						<p>============================================</p>
					</h2>
					<p>
						The following sources of divination cards can drop all (or almost all) divination cards and
						creates increases error during data collection. If you suspect any of these to affect your data,
						please make sure you clearly state so in order for a verifier to double-check.
					</p>

					<p>Generally these should <em>NOT</em> be submitted as data.</p>

					<h3>Natural monster drops</h3>
					<ul>
						<li>Headmaster Braeta (Putrid Cloister)</li>
						<li>Random drops due to Div Card conversion reward on magic/rare monsters</li>
					</ul>

					<h3>Additional Div Card Rewards from Monsters</h3>
					<ul>
						<li>Breachstone modifiers</li>
						<li>Synthesis map modifiers</li>
						<li>Expedition monsters/chests with Div Card remnant</li>
						<li>Eldritch Altars</li>
						<li>Sentinels (div card/random reward)</li>
						<li>Metamorphs</li>
						<li>Parasites from Barrel Sextant</li>
					</ul>

					<h3>Interactables</h3>
					<ul>
						<li>Diviner's Strongboxes</li>
						<li>Labyrinth chests</li>
						<li>Temple of Atzoatl room chests (Armour, Jewellery, Weapon)</li>
						<li>Delve "Light X" chests</li>
						<li>Gravicius' Syndicate Hideout chests</li>
						<li>Legion generic chests</li>
						<li>Heist generic/"?" chests/safes</li>
						<li>Heist themed chests (Armour/Jewellery/etc)</li>
					</ul>

					<h3>Other sources</h3>
					<ul>
						<li>Ritual trade windows</li>
						<li>
							Thief's Trinket modifier "% chance to receive additional Divination Card items when opening
							a Reward Chest in a Heist"
						</li>
						<li>Stacked Decks</li>
						<li>Diviner's/Mysterious Incubators</li>
					</ul>

					<h3>Additional notes</h3>
					<p>Kirac Missions (find the stack of divination cards) have a special clause:</p>
					<ul>
						<li>
							The card dropped may include global/drop-anywhere cards (e.g. her mask, the dragon's heart)
						</li>
						<li>The card dropped may include cards exclusive to the map's boss</li>
					</ul>
					<p>Atlas Memories can also cause monsters to drop boss cards.</p>
				</section>

				<!-- ==================== SECTION #2 =================== -->
				<section>
					<h2>
						<p>============================================</p>
						2. How can I contribute?
						<p>============================================</p>
					</h2>

					<em
						>Screenshots or videos showing the map mods are the gold standard! Please get into the habit of
						screenshotting cards you suspect may be new data.</em
					>

					<h3>Software tools</h3>
					<ul>
						<li>
							<a href="https://obsproject.com/"
								>OBS Studio - Free and open source software for video recording and live streaming</a
							>
						</li>
						<li>
							<a href="https://www.nvidia.com/en-us/geforce/geforce-experience/shadowplay/"
								>NVIDIA ShadowPlay - Record and Capture Your Greatest Gaming Moments</a
							>
						</li>
						<li>
							<a href="https://getsharex.com/"
								>ShareX - Screen capture, file sharing and productivity tool</a
							>
						</li>
						<li>
							<a href="https://app.prntscr.com/en/index.html"
								>LightShot - The fastest way to take a customizable screenshot</a
							>
						</li>
					</ul>

					<p>
						When taking screenshots, ensure that you include the
						<em>full screen as well as map details</em> in order for me or fishwife to verify. For cards
						that have a specific channel, please post in that channel. All other cards can be posted in
						<a href="https://discord.com/channels/834368692560461846/834368692997455924"
							># general divcord channel</a
						>
					</p>
				</section>

				<!-- ==================== SECTION #3 =================== -->
				<section>
					<h2>
						<p>============================================</p>
						3. How do I know what to look for?
						<p>============================================</p>
					</h2>

					<p>Go to <a href="/divcord">divcord page</a> and find cards with "Needs to verify" section</p>

					<img
						src="/images/verify-faq/need-to-verify.jpg"
						alt="showcase of need-to-verify sources from divcord page"
					/>

					<p>You can also apply "Divcord Preset", it filters out done cards.</p>
					<img src="/images/verify-faq/presets.jpg" alt="showcase of presets section on divcord page" />

					<p>
						All info is based on
						<a
							href="https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/edit?pli=1#gid=0"
							>divcord's spreadsheet.</a
						>
						You can also check this out.
					</p>
				</section>
			</article>
		`;
	}

	static styles = css`
		article {
			max-width: 65ch;
			margin-inline: auto;
			font-size: 18px;
		}

		a:link,
		a:visited {
			color: rgba(255, 255, 255, 0.85);
		}

		a:hover {
			color: var(--link-color-hover, skyblue);
			text-decoration: underline;
		}

		p,
		li,
		em {
			color: rgba(255, 255, 255, 0.75);
		}

		em {
			color: rgba(255, 255, 255, 0.95);
			font-size: 20px;
		}
	`;
}