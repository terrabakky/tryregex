define(['jquery', 'console', 'evaluate', 'globalFuncs'], function ($, regexConsole, evaluate, data) {
	'use strict';

	var currentLesson = localStorage.getItem('currentLesson') || 1;

	if (currentLesson !== 1) {
		$('.lesson1').hide();
		evaluate.init();
		startLesson(currentLesson);
	}


	// Called after code executed
	$(regexConsole).on('data', function (e, input, output) {
		var lesson = 'lesson' + currentLesson;
		if (lessonCompleted[lesson]) {
			var result = lessonCompleted[lesson].call(this, input, output);

			if (result) {
				$('.lesson' + currentLesson).hide();
				currentLesson++;

				localStorage.setItem('currentLesson', currentLesson);
				startLesson(currentLesson);
			}
		}
	});

	var lessonCompleted = {
		lesson1: function () {
			return !!data.name;
		},

		lesson2: function (input, output) {
			return ($.isArray(output) && output[0] === data.firstName);
		},

		lesson3: function (input, output) {
			return ($.isArray(output) && output[0] === data.firstName);
		},

		lesson4: function (input, output) {
			return (typeof output === 'boolean');
		},

		lesson5: function (input, output) {
			var expected = window.bio.replace(data.firstName, '[redacted]');
			return contains(input, 'replace') && output === expected;
		},

		lesson6: function (input, output) {
			if (!contains(input, 'num')) {
				return false;
			}

			if (contains(input, 'exec') || contains(input, 'match')) {
				return output === null;
			} else if (contains(input, 'test')) {
				return output === false;
			}

			return false;
		},

		lesson7: function (input, output) {
			if (!contains(input, '3.5')) {
				return false;
			}

			return (output === true ||
				($.isArray(output) && output[0] === '345'));
		},

		lesson8: function (input) {
			if (!contains(input, '?')) {
				return false;
			}

			var expr = data.lastAnswer;
			return (expr.test('frontend') && expr.test('front-end'));
		},

		lesson9: function (input, output) {
			if (contains(input, 'regex') || contains(input, '*')) {
				return false;
			}

			return (output[0] === '(also regex or regexp)');
		},

		lesson10: function (input, output) {
			if (contains(input, 'regex') || contains(input, '+')) {
				return false;
			}

			return (output[0] === '(also regex or regexp)');
		},

		lesson11: function (input, output) {
			if (contains(input, '34')) {
				return false;
			}

			return (output[0] === '(123456)');
		},

		lesson12: function () {
			// Much meta
			var answer = data.lastAnswer.toString().replace(/\s/g, '');
			return (answer === '/a{0,1}b{1,}c{0,}/');
		},

		lesson13: function (input) {
			return contains(input, '/CAT/i');
		},

		lesson14: function (input, output) {
			var expected = window.shortStory.replace(/a/g, 'e');
			return output.slice(1) === expected.slice(1); // Ignore first char
		},

		lesson15: function (input, output) {
			if (output !== true) {
				return false;
			}

			var regex = getRegex(input);

			if (!regex) {
				return false;
			}

			var result = regex.exec('BobbyTables');
			if (result === null || result[0] !== 'BobbyTables') {
				return false;
			}

			result = regex.exec('Bobby-Tables');
			if (result === null || result[0] !== 'Bobby-Tables') {
				return false;
			}

			result = regex.exec('Bobby');
			if (result === null || result[0] !== 'Bobby') {
				return false;
			}

			if (regex.test('B0bby')) {
				return false;
			}

			if (regex.test('abc')) {
				return false;
			}

			return true;
		},

		lesson16: function (input, output) {
			if (output !== true) {
				return false;
			}

			var regex = getRegex(input);

			if (!regex) {
				return false;
			}

			var result = regex.exec('Bobby-Tables');
			if (result === null || result[0] !== 'Bobby-Tables') {
				return false;
			}

			result = regex.exec('B0bby');
			if (result === null || result[0] !== 'B0bby') {
				return false;
			}

			if (regex.test('abc')) {
				return false;
			}

			if (regex.test('abc abc')) {
				return false;
			}

			return true;
		},

		lesson17: function (input, output) {
			if (contains(input, 'test') && output !== true) {
				return false;
			}

			if ((contains(input, 'exec') || contains(input, 'match')) &&
				(!$.isArray(output) || output[0] !== window.possibleUrl)) {
				return false;
			}

			var regex = getRegex(input);

			if (!regex) {
				return false;
			}

			output = regex.exec(window.possibleUrl);
			return $.isArray(output) && output[0] === window.possibleUrl;
		},

		lesson18: function (input, output) {
			return ($.isArray(output) && output[1] === '123456');
		},

		lesson19: function (input, output) {
			if (!contains(input, '(?:')) {
				return false;
			}

			return ($.isArray(output) && output.length === 1);
		},

		lesson20: function () {
			var expr = data.lastAnswer;

			return (expr.test('haha') && expr.test('hahaha') &&
				expr.test('hahahahaha') && !expr.test('ha') &&
				!expr.test('hahahah'));
		},

		lesson21: function (input, output) {
			if (contains(input, ['dog', 'cat', 'rabbit'])) {
				return output === true ||
					($.isArray(output) && output[1] === 'rabbit');
			}

			return false;
		},

		lesson22: function () {
			var regex = data.lastAnswer;

			// Everything here should be true
			return [
				regex.test('test test'),
				regex.test('This test test'),
				!regex.test('hello world hello'),
				regex.test('hi hi there'),
				regex.test('this is is a test'),
				!regex.test('nope no match')
			].reduce(function (prev, curr) {
					return prev && curr;
				}, true);
		}
	};

	function startLesson(num) {
		$('.lesson' + num).show()
			.find('p, h1, pre').each(function () {
				var $this = $(this),
					html = $this.html();

				// @todo: Don't use .html()!
				html = html.replace(/{{ (\S+) }}/, function (text, property) {
					return data[property] ? data[property] : text;
				});

				$this.html(html);
			});
	}

	function contains(string, substr) {
		if ($.isArray(substr)) {
			return substr.reduce(function (prev, actualSubstr) {
				return prev && contains(string, actualSubstr);
			}, true);
		}

		return string.indexOf(substr) !== -1;
	}

	function getRegex(input) {
		if (contains(input, 'test') || contains(input, 'exec')) {
			input = input.split('.')[0];
		} else {
			input = input.slice(input.indexOf('(') + 1, input.lastIndexOf(')'));
		}


		if (!/^\/.+\/[igny]*$/.test(input)) {
			return false;
		}

		var lastIndex = input.lastIndexOf('/');

		var body = input.slice(1, lastIndex);
		var flags = input.slice(lastIndex + 1);

		return new RegExp(body, flags);
	}
});