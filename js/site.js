/**
 * Shared layout and navigation for static GitHub Pages deployment.
 * Uses a configurable base path so pages work from repo root or subfolders.
 */
(function () {
	'use strict';

	/**
	 * @returns {{ basePath: string, currentNav: string | null }}
	 */
	function readLayoutConfig() {
		var root = document.documentElement.getAttribute('data-base-path');
		if (!root) root = '.';
		var current = document.body.getAttribute('data-current-nav');
		return { basePath: root, currentNav: current || null };
	}

	function applyBase(template, basePath) {
		return template.split('{{BASE}}').join(basePath);
	}

	function highlightCurrentNav() {
		var cfg = readLayoutConfig();
		if (!cfg.currentNav) return;
		var links = document.querySelectorAll('[data-nav]');
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			if (link.getAttribute('data-nav') === cfg.currentNav) {
				link.setAttribute('aria-current', 'page');
				link.classList.add('is-active');
			}
		}
	}

	function wireNavToggle() {
		var btn = document.querySelector('[data-nav-toggle]');
		var nav = document.getElementById('site-nav');
		if (!btn || !nav) return;

		btn.addEventListener('click', function () {
			var open = nav.classList.toggle('is-open');
			btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		});

		nav.addEventListener('click', function (e) {
			var t = e.target;
			if (
				t &&
				t.tagName === 'A' &&
				window.matchMedia('(max-width: 768px)').matches
			) {
				nav.classList.remove('is-open');
				btn.setAttribute('aria-expanded', 'false');
			}
		});
	}

	function setFooterYear() {
		var el = document.querySelector('[data-year]');
		if (el) el.textContent = String(new Date().getFullYear());
	}

	function injectPartials() {
		var cfg = readLayoutConfig();
		var headerMount = document.getElementById('site-header-mount');
		var footerMount = document.getElementById('site-footer-mount');
		if (!headerMount || !footerMount) return;

		var headerUrl = cfg.basePath + '/partials/header.html';
		var footerUrl = cfg.basePath + '/partials/footer.html';

		function load(url) {
			return fetch(url, { credentials: 'same-origin' }).then(function (r) {
				if (!r.ok) throw new Error('Failed to load ' + url);
				return r.text();
			});
		}

		Promise.all([load(headerUrl), load(footerUrl)])
			.then(function (parts) {
				headerMount.innerHTML = applyBase(parts[0], cfg.basePath);
				footerMount.innerHTML = parts[1];
				highlightCurrentNav();
				wireNavToggle();
				setFooterYear();
			})
			.catch(function () {
				headerMount.innerHTML =
					'<header class="site-header site-header--fallback"><div class="site-header__inner"><p class="fallback-msg">Navigation could not be loaded. Open from a local or hosted server (not file://).</p></div></header>';
				footerMount.innerHTML =
					'<footer class="site-footer"><div class="site-footer__inner"><p>© Anna Dinius</p></div></footer>';
				setFooterYear();
			});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', injectPartials);
	} else {
		injectPartials();
	}
})();
