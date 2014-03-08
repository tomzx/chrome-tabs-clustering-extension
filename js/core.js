tabs = {};
tabIds = [];

var tableTemplate = null;

var extractAttribute = function(tab, attribute) {
	switch (attribute) {
		case 'title':
			return tab.title;
		case 'domain':
			var uri = new URI(tab.url);
			return uri.domain();
	}
};

// -----
// On load + clustering method/keying function change
// -----
// Get all tabs title
// Run clustering method
// Store results (if clustering is to be applied)
// Display results
var clusters = {};
var updateClustering = function() {
	clusters = {};
	var currentAttribute = $('#attribute').val();
	var tabsAttribute = {};
	chrome.windows.getAll({ populate: true }, function(windows) {
		_.forEach(windows, function(window) {
			_.forEach(window.tabs, function(tab) {
				// Collect all tabs
				// TODO: Somewhere else?
				tabs[tab.id] = tab;

				// tabsTitle[tab.id] = tab.title;
				tabsAttribute[tab.id] = extractAttribute(tab, currentAttribute);
			});
		});

		keyer = new FingerprintKeyer();
		_.forEach(tabsAttribute, function(attribute, tabId) {
			var cluster = keyer.key(attribute);
			if (!clusters[cluster]) {
				clusters[cluster] = [];
			}
			clusters[cluster].push(tabs[tabId]);
		});
		//console.log(clusters);
		$('#data').html(tableTemplate({currentAttribute: currentAttribute}));

		$('.btn-cluster').click(function(e) {
			e.preventDefault();

			var $this = $(this);
			applyClustering($this.data('id'));
		});
	});
};

// -----
// Apply clustering
// -----
// Get cluster id
// Get all tabs
// Create new window
// Move all tabs to new window
var applyClustering = function(clusterId) {
	var tabs = clusters[clusterId];
	var tabsId = _.pluck(tabs, 'id');
	chrome.windows.create({ tabId: _.first(tabsId) }, function(window) {
		chrome.tabs.move(_.rest(tabsId), { windowId: window.id, index: -1 });
	});
};

var bootstrap = function() {
	restoreLastOptions();
	$.get('views/table.html').done(function(data) {
		tableTemplate = _.template(data);
		updateClustering();
		$('select').change(function() {
			// Save option
			var $this = $(this);
			var id = $this.attr('id');
			localStorage[id] = $this.val();
			console.log('Saved '+id+' = '+$this.val());

			updateClustering();
		});
	});
};

var restoreLastOptions = function() {
	// Set last options
	var options = ['method', 'keying_function', 'attribute'];
	_.forEach(options, function(option) {
		if (localStorage[option]) {
			$('#'+option).val(localStorage[option]);
		}
	});
};

document.addEventListener('DOMContentLoaded', function() {
	bootstrap();
});
