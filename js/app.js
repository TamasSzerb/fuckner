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
				}
			});
		},

		render: function () {
			var tags = 0,
				urls = 0,
				that = this;

			$('#because').html(_.map(this.data, function (line, topic) {
				tags++;
				var print = '<span class="print-only plm">' + line.text + '</span>';
				if (line.urls === null || line.urls.length === 0) {
					return $('<span class="hide-on-print">' + line.text + '</span>' + print);
				} else {
					urls += line.urls.length;
					if (line.urls.length > 1) {
						return $('<span class="hide-on-print"><a href="#" class="multi-url" data-topic="' + topic + '">' + line.text + '</a></span>' + print);
					} else {
						return $('<span class="hide-on-print"><a href="' + line.urls[0] + '">' + line.text + '</a></span>' + print);
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
