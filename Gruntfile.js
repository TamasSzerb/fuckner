/*global module, require, console */

module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			options: {
				includePaths: [
					'bower_components/foundation/scss'
				]
			},
			dist: {
				options: {
					outputStyle: 'compressed'
				},
				files: {
					'css/app.css': 'scss/app.scss'
				}
			}
		},

		watch: {
			sass: {
				files: 'scss/**/*.scss',
				tasks: [
					'sass'
				]
			},

			data: {
				files: 'data/data.txt',
				tasks: [
					'generate-data'
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('generate-data', function () {
		var done = this.async(),
			loadData = function () {
				var lines = grunt.file.read('data/data.txt').split('\n').filter(function (line) {
						return line.trim() !== '';
					}),
					splitUrls = function(lines) {
						lines = lines.map(function(line) {
							return {
								text: line.replace(/https?:\/\/\S+/g, '').trim(),
								urls: line.match(/https?:\/\/\S+/g)
							};
						});

						return lines;
					},
					retval = splitUrls(lines);

				return retval;
			},
			sortLines = function (lines) {
				var plainLetters = function (s) {
						var from = 'áéíóöőúüű',
							to = 'aeioouuu';

						s = s.replace(/<(?:.|\n)*?>/gm, '').toLowerCase();
						return s.split('').map(function (letter, i) {
							var t = from.indexOf(s.charAt(i));
							if (t === -1) {
								return s.charAt(i);
							} else {
								return to.charAt(t) + 'x';
							}
						}).join('');
					},
					plainLines = {};

				lines.forEach(function (line) {
					plainLines[line.text] = plainLetters(line.text);
				});

				lines = lines.sort(function (a, b) {
					if (plainLines[a.text] > plainLines[b.text]) {
						return 1;
					} else if (plainLines[a.text] < plainLines[b.text]) {
						return -1;
					} else {
						return 0;
					}
				});

				return lines;
			},
			data = sortLines(loadData()),
			callbacksNeeded = 0,
			callbacksDone = 0,
			ogFields = {
				ogTitle: 'og:title',
				ogDescription: 'og:description',
				ogImage: 'og:image',
				ogUrl: 'og:url'
			},
			plusOne = function (url) {
				callbacksDone += 1;
				grunt.log.ok(callbacksDone + '/' + callbacksNeeded + ': ' + url);

				if (callbacksDone === callbacksNeeded) {
					grunt.file.write('data/data.json', JSON.stringify(data));
					done();
				}
			};

		data.forEach(function (item, itemIndex) {
			if (item.urls !== null) {
				if (item.urls.length > 1) {
					callbacksNeeded += item.urls.length;
					item.urls.forEach(function (url, urlIndex) {
						setTimeout(function () {
							var fetch = require('fetch'),
								cookies = new fetch.CookieJar();

							fetch.fetchUrl(url, {
								maxRedirects: 20,
								cookieJar: cookies,
								headers: {
									'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36'
								}
							}, function (error, meta, body) {
								var jsdom = require('jsdom');

								if (error) {
									grunt.log.error(url);
									grunt.log.error(error);
								} else {
									try {
										jsdom.env(body.toString(), function (errors, window) {
											var $ = require('jquery')(window),
												$b = $(body.toString()),
												results = {};

											if (errors) {
												grunt.log.error(url);
												console.log(errors);
											} else {
												Object.keys(ogFields).forEach(function (fieldName) {
													var value = $b.find('meta[property="' + ogFields[fieldName] + '"]').attr('content');

													if (value) {
														results[fieldName] = value;
													}
												});
											}

											if (!results.ogUrl) {
												results.ogUrl = url;
											}

											data[itemIndex].urls[urlIndex] = results;
											plusOne(url);
										});
									} catch (e) {
										grunt.log.error(url);
										grunt.log.error(e);
										data[itemIndex].urls[urlIndex] = {
											ogUrl: url
										};
										plusOne(url);
									}
								}
							});
						}, callbacksNeeded * 250);
					});
				}
			}
		});
	});

	grunt.registerTask('build', [
		'sass'
	]);

	grunt.registerTask('default', function () {
		grunt.log.writeln('Listening on port 9090, open the page in your browser: http://localhost:9090/')
		var connect = require('connect'),
			serveStatic = require('serve-static'),
			app = connect();

		app.use(serveStatic('.', {
			'index': [
				'index.html'
			]
		}));
		app.listen(9090);

		grunt.task.run([
			'build',
			'watch'
		]);
	});
};
