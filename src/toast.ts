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

export function toast(message: string, variant: ToastVariant = 'primary', duration = 100_000_000): Promise<void> {
	const alert = Object.assign(document.createElement('sl-alert'), {
		variant,
		closable: true,
		duration: duration,
		innerHTML: `
        <sl-icon name="${iconName(variant)}" slot="icon"></sl-icon>
        ${escapeHtml(message)}
      `,
	});

	document.body.append(alert);
	return alert.toast();
}

export function warningToast(message: string): Promise<void> {
	return toast(message, 'warning');
}
