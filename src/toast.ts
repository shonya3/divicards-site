import '@shoelace-style/shoelace/dist/components/alert/alert.js';

function escapeHtml(html: string) {
	const div = document.createElement('div');
	div.textContent = html;
	return div.innerHTML;
}

export type ToastVariant = 'primary' | 'success' | 'neutral' | 'warning' | 'danger';

function iconName(variant: ToastVariant): string {
	switch (variant) {
		case 'primary': {
			return 'info-circle';
		}
		case 'success': {
			return 'check2-circle';
		}
		case 'neutral': {
			return 'gear';
		}
		case 'warning': {
			return 'exclamation-triangle';
		}
		case 'danger': {
			return 'exclamation-octagon';
		}
	}
}

function extractDivcordLink(message: string): { msg: string; divcordLink: string | null } {
	const DIVCORD_LINK_PART = 'https://docs.google.com/spreadsheets/d/1Pf2KNuGguZLyf6eu_R0E503U0QNyfMZqaRETsN5g6kU/';
	let divcordLink: string | null = null;
	const msg = message
		.split(' ')
		.filter(word => {
			const isDivcordLink = word.includes(DIVCORD_LINK_PART);
			if (isDivcordLink) {
				divcordLink = word;
				return false;
			} else {
				return true;
			}
		})
		.join(' ');
	return {
		msg,
		divcordLink,
	};
}

export function toast(message: string, variant: ToastVariant = 'primary', duration = 100_000_000): Promise<void> {
	message = escapeHtml(message);
	const { msg, divcordLink } = extractDivcordLink(message);
	const link = `<a class="toast-link" rel="noopener" target="_blank" href=${divcordLink}>Open Sheets</a>`;
	const alert = Object.assign(document.createElement('sl-alert'), {
		variant,
		closable: true,
		duration: duration,
		innerHTML: `
        <sl-icon name="${iconName(variant)}" slot="icon"></sl-icon>
        ${msg}
        ${link}
      `,
	});

	document.body.append(alert);
	return alert.toast();
}

export function warningToast(message: string): Promise<void> {
	return toast(message, 'warning');
}
