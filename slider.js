/**
 * $.Slider
 *
 * @author     Naoki Sekiguchi (RaNa gRam)
 * @url        https://github.com/seckie/backbone-slider
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @requires   jQuery.js, Underscore.js, Backbone.js
 */

(function($, _, Backbone, window, document) {

$.Slider = Backbone.View.extend({
	options: { // default
		slideContainerEl: '.slides',
		slideEl: '.slide',
		prevEl: '.prev',
		nextEl: '.next',
		controllNavEl: '.controll',
		currentControllClassName: 'current',
		defaultIndex: 0,
		maxView: 1,
		animateDuration: 750,
		animateEasing: 'swing',
		action: { }
	},
	initialize: function (options) {
		var opt = this.options;
		_.extend(this.options, options);
		_.extend(this.action, opt.action);
		// element
		this.$container = $(opt.slideContainerEl);
		this.$slide = this.$container.find(opt.slideEl);
		this.$next = this.$el.find(opt.nextEl);
		this.$prev = this.$el.find(opt.prevEl);
		this.$controllContainer = this.$el.find(opt.controllNavEl);
		this.$controll = {};
		// property
		this.itemWidth = this.$slide.width() + parseInt(this.$slide.css('margin-left'), 10) + parseInt(this.$slide.css('margin-right'), 10);
		this.index = opt.defaultIndex;
		this.$cover = $('<div class="slider-cover"/>').hide();
		this.action.initComplete.call(this); // action

		this._setupEvents();
		this.render();
	},
	render: function () {
		this._buildControll();
		this.$container.css({
			'margin-left': -1 * this.itemWidth * this.index,
			'width': this._getWholeWidth(),
			'visibility': 'visible' 
		});
		$('body').append(this.$cover);
		this._updateNav();
		this.action.renderComplete.call(this); // action
	},
	_setupEvents: function () {
		var events = {};
		var opt = this.options;
		events['click ' + opt.nextEl] = '_scrollNext';
		events['click ' + opt.prevEl] = '_scrollPrev';
		events['click ' + opt.controllNavEl + ' a'] = '_jump';

		this.delegateEvents(events);
	},
	_buildControll: function () {
		for (var i=0,l=this.$slide.length; i<l ; i++) {
			var el = $('<a/>', { href: '#' + this.$slide[i].id });
			el[0].index = i;
			this.$controllContainer.append(el);
		}
		this.$controll = this.$controllContainer.find('a');
	},
	_scrollNext: function (e) {
		var self = this,
			callback;
		if (this.index < (this.$slide.length - this.options.maxView)) {
			callback = this.action.scrollStart.call(this, this.index); // action
			this.$cover.show(); // prevent other events
			if (callback && callback.promise) {
				callback.done(function () {
					self._scroll(1);
				});
			} else {
				this._scroll(1);
			}
		}
		e.preventDefault();
	},
	_scrollPrev: function (e) {
		var self = this,
			callback;
		if (this.index > 0) {
			callback = this.action.scrollStart.call(this, this.index); // action
			this.$cover.show(); // prevent other events
			if (callback && callback.promise) {
				callback.done(function () {
					self._scroll(-1);
				});
			} else {
				this._scroll(-1);
			}
		}
		e.preventDefault();
	},
	_scroll: function (dir) {
		var self = this,
			pos = (dir > 0) ? '-=' + this.itemWidth : '+=' + this.itemWidth;
		if (!dir) { return; }
		this.$container.stop(true, true).animate({
				'margin-left': pos
			},
			this.options.animateDuration,
			this.options.animateEasing,
			function () {
				self.$cover.hide();
				self.action.scrollEnd.call(self, self.index); // action
			});
		(dir > 0) ? this.index ++ : this.index --;
		this._updateNav();
	},
	_updateNav: function () {
		var self = this;
		if (this.index <= 0) {
			this.$prev.hide();
			this.action.firstSlide.call(this, this.index); // action
		} else {
			this.$prev.show();
		}
		if (this.index >= (this.$slide.length - this.options.maxView)) {
			this.$next.hide();
			this.action.lastSlide.call(this, this.index); // action
		} else {
			this.$next.show();
		}
		this.$controll.each(function (i, controll) {
			$(controll).removeClass(self.options.currentControllClassName);
		});
		$(this.$controll[this.index]).addClass(this.options.currentControllClassName);
	},
	_getWholeWidth: function () {
		var sum = 0;
		for (var i=0,l=this.$slide.length; i<l ; i++) {
			sum += this.itemWidth;
		}
		return sum;
	},

	_jump: function (e, directIndex) {
		var self = this;
			nav = e ? e.currentTarget : null,
			index = nav ? nav.index : directIndex,
			$slide = this.$slide[index],
			movePos = -1 * this.itemWidth * index,
			callback = this.action.jumpStart.call(this, index, directIndex); // action
		this.$cover.show(); // prevent other events
		if (callback && callback.promise) {
			callback.done(function () {
				fire.call(self, index);
			});
		} else {
			fire.call(this, index);
		}

		function fire(index) {
			if (directIndex) {
				this.$container.css({
					'margin-left': movePos
				});
				this.$cover.hide();
				this.action.jumpEnd.call(this, this.index, directIndex); // action
			} else {
				this.$container.stop(true, true).animate({
						'margin-left': movePos
					}, 
					this.options.animateDuration,
					this.options.animateEasing,
					function () {
						self.$cover.hide();
						self.action.jumpEnd.call(self, self.index, directIndex); // action
					});
			}
			this.index = index;
			this._updateNav();
		}
		if (e) {
			e.preventDefault();
		}
	},
	jump: function (index) {
		this._jump(null, index);
	},
	reset: function (index) {
		var movePos = -1 * this.itemWidth * index;
		this.$container.stop(true, true).css({
			'margin-left': movePos
		});
		this.index = index;
		this._updateNav();
		this.action.resetComplete.call(this, index); // action
	},
	// interface functions that should be overridden
	action: {
		initComplete: function () { },
		renderComplete: function () { },
		resetComplete: function (index) { },
		jumpStart: function (index) { },
		jumpEnd: function (index) { },
		scrollStart: function (index) { },
		scrollEnd: function (index) { },
		firstSlide: function (index) { },
		lastSlide: function (index) { }
	}
});

})(jQuery, _, Backbone, this, this.document);
