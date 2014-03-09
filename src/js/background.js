chrome.browserAction.onClicked.addListener(function(tab) {
	var toCreate = { url: chrome.extension.getURL('/views/main.html') };
	chrome.tabs.query(toCreate, function(tabs) {
		if (tabs.length === 0) {
			chrome.tabs.create(toCreate);
		}
	});
});