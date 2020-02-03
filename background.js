const hostMatcher = /([^.]+\.\w+)\/?$/;

function gatherHostsFromPermissions(permissions) {
	const hosts = permissions.map(p => {
		const result = hostMatcher.exec(p);
		return result ? result[1] : null;
	});
	return hosts.filter(x => x);
}

chrome.runtime.onInstalled.addListener(() => {
	const perms = chrome.runtime.getManifest()['permissions'];
	const hosts = gatherHostsFromPermissions(perms);

	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: hosts.map(h => new chrome.declarativeContent.PageStateMatcher({
					pageUrl: { hostContains: h }
				})),
				actions: [ new chrome.declarativeContent.ShowPageAction() ]
			}
		]);
	});
});

chrome.pageAction.onClicked.addListener(function(tab) {
	function removalCookieData(cookie) {
		return {name: cookie.name, url: tab.url, storeId: cookie.storeId};
	}

	chrome.cookies.getAll({}, cookies => {
		const removableCookies = cookies.map(removalCookieData);
		removableCookies.forEach(c => chrome.cookies.remove(c));
		chrome.tabs.reload();
	});
});
