chrome.browserAction.onClicked.addListener(function(tab) {
	var toCreate = { url: chrome.extension.getURL('/views/main.html') };
	chrome.tabs.query(toCreate, function(tabs) {
		if (tabs.length === 0) {
			chrome.tabs.create(toCreate);
		} else {
			var tab = tabs[0];
			chrome.tabs.update(tab.id, { active: true });
			chrome.windows.update(tab.windowId, { focused: true });
		}
	});
});