/**
 * $.Slider
 *
 * @author     RaNa gRam
 *             Naoki Sekiguchi
 * @url        http://ranagram.com/
 *             http://likealunatic.jp/
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @requires   jQuery.js, Underscore.js, Backbone.js, jQuery Transit
 */

(function($, _, Backbone, window, document) {

$.Slider = Backbone.View.extend({
	options: {
		slideContainerEl: '.slide-container',
		slideEl: '.slide',
		directionNavEl: '.direction',
		prevEl: '.prev',
		nextEl: '.next',
		controllNavEl: '.controll',
		currentControllClassName: 'current',
		defaultIndex: 0,
		maxView: 1,
		mask: true,
		maskClassName: 'mask',
		animateDuration: 750,
		animateEasing: 'swing',
		animateOpt: { },
		renderComplete: function () { }
	},
	events: {
		'click a.next': '_scrollNext',
		'click a.prev': '_scrollPrev',
		'click .controll a': '_jump'
	},
	initialize: function (opt) {
		_.extend(this.options, opt);
		if (!$.support.transition) {
			this.options.animateEasing = this.options.animateEasingFallback;
		}
		_.extend(this.action, opt.action);
		var self = this,
			opt = this.options;
		// element
		this.$container = $(opt.slideContainerEl);
		this.$slide = this.$container.find(opt.slideEl);
		this.$next = this.$el.find(opt.nextEl);
		this.$prev = this.$el.find(opt.prevEl);
		this.$controllContainer = this.$el.find(opt.controllNavEl);
		this.$controll = {};
		this.$mask = [];
		// property
		this.itemWidth = this.$slide.width() + parseInt(this.$slide.css('margin-left'), 10) + parseInt(this.$slide.css('margin-right'), 10);
		this.index = opt.defaultIndex;
		this.$cover = $('<div class="slider-cover"/>');

		this.render();
	},
	render: function () {
		this._buildControll();
		if (this.options.mask) { this._buildMask(); }
		this.$container.css({
			'margin-left': -1 * this.itemWidth * this.index,
			'width': this._getWholeWidth(),
			'visibility': 'visible' 
		});
		$('body').append(this.$cover);
		this._updateNav();
		this.options.renderComplete();
	},
	_buildControll: function () {
		for (var i=0,l=this.$slide.length; i<l ; i++) {
			var el = $('<a/>', { href: '#' + this.$slide[i].id });
			el[0].index = i;
			this.$controllContainer.append(el);
		}
		this.$controll = this.$controllContainer.find('a');
	},
	_buildMask: function () {
		for (var i=0,l=this.$slide.length; i<l ; i++) {
			var mask = $('<div/>', { 'class': this.options.maskClassName });
			if (i === this.index) { mask.hide(); }
			$(this.$slide[i]).append(mask);
			// save element
			this.$mask.push(mask);
		}
	},
	_scrollNext: function (e) {
		var self = this;
		if (this.index < (this.$slide.length - this.options.maxView)) {
			this.action.scrollStart(); // callback
			this.$cover.show(); // prevent other events
			if ($.support.transition) {
				this.$container.stop(true, true).transition({
					'margin-left': '-=' + this.itemWidth
					},
					this.options.animateDuration,
					this.options.animateEasing, function () {
						self.$cover.hide();
						self.action.scrollEnd(); // callback
					});
			} else {
				this.$container.stop(true, true).animate({
					'margin-left': '-=' + this.itemWidth
					},
					this.options.animateDuration,
					this.options.animateEasing, function () {
						self.$cover.hide();
						self.action.scrollEnd(); // callback
					});
			}
			this.index ++;
			this._updateNav();
		}
		e.preventDefault();
	},
	_scrollPrev: function (e) {
		var self = this;
		if (this.index > 0) {
			this.action.scrollStart(); // callback
			this.$cover.show(); // prevent other events
			if ($.support.transition) {
				this.$container.stop(true, true).transition({
						'margin-left': '+=' + this.itemWidth
					},
					this.options.animateDuration,
					this.options.animateEasing,
					function () {
						self.$cover.hide();
						self.action.scrollEnd(); // callback
					});
			} else {
				this.$container.stop(true, true).animate({
						'margin-left': '+=' + this.itemWidth
					},
					this.options.animateDuration,
					this.options.animateEasing,
					function () {
						self.$cover.hide();
						self.action.scrollEnd(); // callback
					});
			}
			this.index --;
			this._updateNav();
		}
		e.preventDefault();
	},
	_updateNav: function () {
		var self = this;
		if (this.index <= 0) {
			this.$prev.hide();
			this.action.firstSlide();
		} else {
			this.$prev.show();
		}
		if (this.index >= (this.$slide.length - this.options.maxView)) {
			this.$next.hide();
			this.action.lastSlide();
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
	_jump: function (e) {
		var nav = event.currentTarget,
			$slide = this.$slide[nav.index],
			movePos = -1 * this.itemWidth * nav.index;

		if ($.support.transition) {
			this.$container.stop(true, true).transition({
				'margin-left': movePos
			}, this.options.animateOpt);
		} else {
			this.$container.stop(true, true).animate({
				'margin-left': movePos
			}, this.options.animateOpt);
		}

		this.index = nav.index;
		this._updateNav();

		e.preventDefault();
	},
	reset: function (index) {
		var movePos = -1 * this.itemWidth * index;
		this.$container.stop(true, true).css({
			'margin-left': movePos
		});
		_.each(this.$mask, function (mask, i) {
			if (i === index) {
				$(mask).hide();
			} else {
				$(mask).show();
			}
		});
		this.index = index;
		this._updateNav();
	},
	// interface
	action: {
		scrollStart: function () { },
		scrollEnd: function () { },
		firstSlide: function () { },
		lastSlide: function () { }
	}
});

})(jQuery, _, Backbone, this, this.document);
