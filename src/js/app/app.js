currentTabId = null;
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

// TODO: This is a terrible implementation
var keyerParams = {};
var currentKeyer = function() {
	var keyer = $('#keying_function').val();
	keyerParams = {};
	switch (keyer) {
		case 'fingerprint':
			return new FingerprintKeyer();
		case 'ngram-fingerprint':
			keyerParams = { size: parseInt($('#ngram_size').val(), 10) };
			return new NGramFingerprintKeyer();
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
	console.trace();
	console.log('Updating clustering...');
	console.time('Clustering');
	clusters = {};
	var currentAttribute = $('#attribute').val();
	var tabsAttribute = {};
	chrome.windows.getAll({ populate: true }, function(windows) {
		_.forEach(windows, function(window) {
			_.forEach(window.tabs, function(tab) {
				// Collect all tabs
				// TODO: Put this somewhere else?
				tabs[tab.id] = tab;

				tabsAttribute[tab.id] = extractAttribute(tab, currentAttribute);
			});
		});

		var keyer = currentKeyer();
		_.forEach(tabsAttribute, function(attribute, tabId) {
			var cluster = keyer.key(attribute, keyerParams);
			if (!clusters[cluster]) {
				clusters[cluster] = [];
			}
			clusters[cluster].push(tabs[tabId]);
		});

		//console.dir(clusters);

		$('#data').html(tableTemplate({currentAttribute: currentAttribute}));

		$('.btn-cluster').click(function(e) {
			e.preventDefault();

			var $this = $(this);
			applyClustering($this.data('id'));
		});
	});
	console.timeEnd('Clustering');
	console.log('Clustering ready.');
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

var onUpdatedTabs = function(tabId, changeInfo, tab) {
	if (changeInfo.status === 'complete' && tab.id !== currentTabId) {
		updateClustering();
	}
};

var bootstrap = function() {
	console.log('Bootstrapping...');
	getCurrentTab();
	restoreLastOptions();
	updateMenuVisibility();

	setupTemplate();

	chrome.tabs.onUpdated.addListener(onUpdatedTabs);
	chrome.tabs.onRemoved.addListener(updateClustering);
	console.log('Bootstrapping complete.');
};

var getCurrentTab = function() {
	chrome.tabs.getCurrent(function(tab) {
		currentTabId = tab.id;
	});
}

var setupTemplate = function() {
	console.log('Preparing templates...');
	$.get('/views/table.html').done(function(data) {
		tableTemplate = _.template(data);
		updateClustering();
		$('#options select, #options input').change(function() {
			// Save option
			var $this = $(this);
			var id = $this.attr('id');
			localStorage[id] = $this.val();
			console.log('Saved '+id+' = '+$this.val());

			updateMenuVisibility();
			updateClustering();
		});
		console.log('Templates ready.');
	});
};

var restoreLastOptions = function() {
	console.log('Restoring last options...');
	// Set last options
	var options = ['method', 'keying_function', 'attribute', 'ngram_size'];
	_.forEach(options, function(option) {
		if (localStorage[option]) {
			var value = localStorage[option];
			console.log('Restoring '+option+' = '+value);
			$('#'+option).val(value);
		}
	});
	console.log('Restore complete.');
};

var updateMenuVisibility = function() {
	var method = $('#method').val();
	var keyingFunction = $('#keying_function').val();
	$('.key_collision').hide();
	$('.nearest_neighbor').hide();
	$('.ngram_fingerprint_params').hide();
	$('.'+method).show();
	if (keyingFunction === 'ngram-fingerprint') {
		$('.ngram_fingerprint_params').show();
	}
};

document.addEventListener('DOMContentLoaded', function() {
	bootstrap();
});
