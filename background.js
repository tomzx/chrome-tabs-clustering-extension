// TODO: Check if main.html is already loaded

chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({'url': chrome.extension.getURL('main.html')}, function(tab) {
		console.log('test');
	});
});