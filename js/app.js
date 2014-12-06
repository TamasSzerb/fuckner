/*global $, _ */

(function () {
	'use strict';

	var fuckner = {
		data: {},

		init: function () {
			var that = this;

			$.ajax('data/data.json', {
				dataType: 'text',
				success: function (data) {
					that.data = JSON.parse(data);
					that.render();
					that.initSearch();
				}
			});
		},

		initSearch: function () {
			console.log('search');
			var search = function () {
				var $input = $('#search input'),
					phrase = $input.val();

				$('#because span').each(function () {
					$(this).toggle($(this).text().toLowerCase().indexOf(phrase) > -1);
				});
			};

			$('#search input').on('keyup', search);

			$('#search span').on('click', function () {
				$('#search input').val('');
				search();
				$('#search input').focus();
			});
		},

		render: function () {
			var tags = 0,
				urls = 0,
				that = this;

			$('#because-print').html(_.map(this.data, function (line, topic) {
				return '<span class="plm vpn mvn">' + line.text + '</span>';
			}));

			$('#because').html(_.map(this.data, function (line, topic) {
				tags++;
				if (line.urls === null || line.urls.length === 0) {
					return $('<span>' + line.text + '</span>');
				} else {
					urls += line.urls.length;
					if (line.urls.length > 1) {
						return $('<span><a href="#" class="multi-url" data-topic="' + topic + '">' + line.text + '</a></span>' + print);
					} else {
						return $('<span><a href="' + line.urls[0] + '">' + line.text + '</a></span>' + print);
					}
				}
			}));

			$('.multi-url').on('click', function (e) {
				var $modal = $('#topic-modal'),
					topicId = $(e.currentTarget).data('topic'),
					itemTemplate = _.template($('#topic-url').html().trim());

				$modal.find('.title').html(that.data[topicId].text);
				$modal.find('.url-container').empty();
				_.each(that.data[topicId].urls, function (url) {
					$modal.find('.url-container').append(itemTemplate(_.extend({
						ogTitle: url.ogUrl,
						ogImage: '',
						ogDescription: ''
					}, url)));
				});

				$modal.foundation('reveal', 'open');
				return false;
			});

			$('#tags').html(tags + ' téma');
			$('#urls').html(urls + ' URL');
		}
	};

	$(document).foundation();
	fuckner.init();
}());
