Chrome Tabs Clustering
======================

Chrome Tabs Clustering is a small [Chrome](http://www.google.com/chrome/) extension which I developed to learn a bit about the extension API as well as some simple clustering algorithms.

This extension allows you to use clustering algorithms on your tabs in order to group them into a new window. This way you can group single topics at the click of a button instead of doing it all manually yourself.

Requirements
------------

* [Chrome](http://www.google.com/chrome/)

Clustering features
-------------------

As of now, it should be possible to cluster by the following:

- Attribute
	- Domain
	- (Page) Title
- Method
	- Key collision
		- Keying function
			- Fingerprint
			- Ngram-fingerprint
			- Metaphone3
			- Cologne-phonetic
	- Nearest neighbor
		- Ngram size
		- Distance function
			- Levenshtein
			- PPM
			- Radius
			- Block Chars

Acknowledgements
-----------

This extension was partially inspired by the clustering feature of [OpenRefine](http://openrefine.org/).


License
-------

The code is licensed under the [MIT license](http://choosealicense.com/licenses/mit/). See license.txt.