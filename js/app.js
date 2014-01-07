(function () {
	var fuckner = {
		lines: [],

		init: function () {
			var that = this;

			$.ajax('data/data.txt', {
				dataType: 'text',
				success: function (text) {
					that.lines = _.filter(text.split('\n'), function (line) {
						return line.trim() !== '';
					});

					that.sortLines();
					that.renderLines();
				}
			});
		},

		sortLines: function () {
			var plainLetters = function (s) {
				var from = 'áéíóöőúüű',
					to = 'aeioouuu',
					l = s.length,
					retval = '',
					i;

				return _.map(s, function (letter, i) {
					var t = from.indexOf(s.charAt(i));
					if (t == -1) {
						return s.charAt(i);
					} else {
						return to.charAt(t) + 'x';
					}
				}).join('');
			};

			this.lines = this.lines.sort(function (a, b) {
				var pa = plainLetters(a.toLowerCase()),
					pb = plainLetters(b.toLowerCase());

				if (pa > pb) {
					return 1;
				} else if (pa < pb) {
					return -1;
				} else {
					return 0;
				}
			});
		},

		renderLines: function () {
			$('#because').html(_.map(this.lines, function (line) {
				return $('<a href="https://www.facebook.com/pages/Fuck-NER/658444140873575">' + line + '</a>');
			}));
		}
	};

	$(document).foundation();
	fuckner.init();
}());
