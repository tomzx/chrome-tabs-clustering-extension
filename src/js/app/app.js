// TODO:
// Use localStorage instead of DOM to read options

appTabId = null;
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

var keyerParams = {};
var currentKeyer = function(keyer, options) {
	keyerParams = {};
	switch (keyer) {
		case 'fingerprint':
			return new FingerprintKeyer();
		case 'ngram-fingerprint':
			keyerParams = options;
			return new NGramFingerprintKeyer();
	}
};

var getKeyingFunction = function() {
	return $('#keying_function').val();
};

var getKeyingOptions = function(keyingFunction) {
	switch (keyingFunction) {
		case 'ngram-fingerprint':
			return { size: parseInt($('#ngram_size').val(), 10) };
	}
	return {};
};

var getSortMethod = function(orderBy, currentAttribute) {
	switch (orderBy) {
		case 'cluster_size':
			return function(a, b) {
				var sizeA = a[1].length;
				var sizeB = b[1].length;
				return sizeA === sizeB ? 0 : (sizeA < sizeB ? 1 : -1);
			};
		case 'alphabetically':
			return function(a, b) {
				a = extractAttribute(_.first(a[1]), currentAttribute);
				b = extractAttribute(_.first(b[1]), currentAttribute);
				return a.toLowerCase().localeCompare(b.toLowerCase());
			};
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
	console.log('Updating clustering...');
	console.time('Clustering');
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

		var keyingFunction = getKeyingFunction();
		var keyingOptions = getKeyingOptions(keyingFunction);
		var keyer = currentKeyer(keyingFunction, keyingOptions);
		clusters = {};
		// Perform clustering on all tabs
		_.forEach(tabsAttribute, function(attribute, tabId) {
			var cluster = keyer.key(attribute, keyerParams);
			if (!clusters[cluster]) {
				clusters[cluster] = [];
			}
			clusters[cluster].push(tabs[tabId]);
		});

		// Sort for display
		var orderBy = $('#order_by').val();
		var sorted_clusters = _.pairs(clusters).sort(getSortMethod(orderBy, currentAttribute));

		$('#data').html(tableTemplate({
			currentAttribute: currentAttribute,
			clusters: sorted_clusters,
		}));
	});
	console.timeEnd('Clustering');
	console.log('Clustering ready.');
};

var bindClusterButton = function() {
	$(document).on('click', '.btn-cluster', function(e) {
		e.preventDefault();

		var $this = $(this);
		applyClustering($this.data('id'));
	});
};

var bindTabRow = function() {
	$(document).on('click', '.tab-row', function(e) {
		e.preventDefault();

		var $this = $(this);
		var tabId = $this.data('tab-id');
		var tab = tabs[tabId];
		chrome.tabs.update(tabId, { active: true });
		chrome.windows.update(tab.windowId, { focused: true });
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

var onUpdatedTabs = function(tabId, changeInfo, tab) {
	var onlyOnComplete = changeInfo.status === 'complete';
	var theAppTab = tab.id === appTabId;
	if (onlyOnComplete && !theAppTab) {
		updateClustering();
	}
};

var bootstrap = function() {
	console.log('Bootstrapping...');
	getAppTab();
	restoreLastOptions();
	updateMenuVisibility();

	setupTemplate();

	chrome.tabs.onUpdated.addListener(onUpdatedTabs);
	chrome.tabs.onRemoved.addListener(updateClustering);
	console.log('Bootstrapping complete.');
};

var getAppTab = function() {
	chrome.tabs.getCurrent(function(tab) {
		appTabId = tab.id;
	});
};

var bindOnChange = function() {
	$(document).on('change', '#options select, #options input', function() {
		var $this = $(this);
		var id = $this.attr('id');
		saveOption(id, $this.val());
		updateMenuVisibility();
		updateClustering();
	});
};

var setupTemplate = function() {
	console.log('Preparing templates...');
	$.get('/views/table.html').done(function(data) {
		tableTemplate = _.template(data);
		updateClustering();
		bindOnChange();
		bindClusterButton();
		bindTabRow();
		console.log('Templates ready.');
	});
};

var saveOption = function(id, value) {
	localStorage[id] = value;
	console.log('Saved '+id+' = '+value);
};

var restoreLastOptions = function() {
	console.log('Restoring last options...');
	// Set last options
	var options = ['method', 'keying_function', 'attribute', 'ngram_size', 'order_by'];
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
