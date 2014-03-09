var NGramFingerprintKeyer = function() {};

NGramFingerprintKeyer.prototype = FingerprintKeyer.prototype;

NGramFingerprintKeyer.prototype.key = function(s, params) {
	var ngram_size = 2;

	if (typeof s !== 'string') {
		throw new IllegalArgumentException('NGramFingerprint keyer accepts a single string parameter');
	}

	if (typeof params === 'object' && typeof params.size === 'number') {
		ngram_size = params.size;
	}

	s = s.toLowerCase();
	s = s.replace(/[!"#$%&'*+,\-.\/\\:;<=>?@\[\]\^_`{|}~\s]|[\x00-\x1F\x7F]/g, '');

	var set = this.ngram_split(s, ngram_size);

	return this.asciify(set.join(''));
};

NGramFingerprintKeyer.prototype.ngram_split = function(s, size) {
	var set = {};
	for (var i = 0, string_length = s.length; i + size <= string_length; ++i) {
		set[s.substr(i, size)] = true;
	}
	set = Object.keys(set);
	set.sort();
	return set;
};