import { render } from 'lit';
import './App';
import { router } from './router';
import { startViewTransition } from './utils';

const root = document.querySelector('app-root')!;

router.addEventListener('route-changed', async _e => {
	await startViewTransition(() => {
		render(router.render(), root);
	});
});
router.dispatchEvent(new Event('route-changed'));
