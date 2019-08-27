/**
 * demo2.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
    // From https://davidwalsh.name/javascript-debounce-function.
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
    };

    class Slideshow {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.settings = {
                animation: {
                    slides: {
                        duration: 1000,
                        easing: 'easeInOutSine'
                    },
                    shape: {
                        duration: 10,
                        easing: {in: 'easeInQuart', out: 'easeOutQuart'}
                    }
                },
                frameFill: 'url(#gradient2)'
            }
            this.init();
        }
        init() {
            this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides > .slide'));
            this.slidesTotal = this.DOM.slides.length;
            this.DOM.nav = this.DOM.el.querySelector('.slidenav');
            this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav__item--next');
            this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav__item--prev');
            this.current = 0;
            this.createFrame();
            this.initEvents();
        }
        createFrame() {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.frameSize = this.rect.width/25;
            this.paths = {
                initial: this.calculatePath('initial'),
                final: this.calculatePath('final')
            };
            this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.DOM.svg.setAttribute('class', 'shape');
            this.DOM.svg.setAttribute('width','100%');
            this.DOM.svg.setAttribute('height','100%');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.svg.innerHTML =`
            <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#711a14"/>
                <stop offset="100%" stop-color="#492d11"/>
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="  #ffffff">
                    </stop>
                    <stop offset="100%" stop-color="#000000">
                    </stop>
            </linearGradient>
            </defs>
            <path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
            this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
            this.DOM.shape = this.DOM.svg.querySelector('path');
        }
        updateFrame() {
            this.paths.initial = this.calculatePath('initial');
            this.paths.final = this.calculatePath('final');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
        }
        calculatePath(path = 'initial') {
            return path === 'initial' ?
                    `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z` :
                    `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize} Z`;
        }
        initEvents() {
            this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
            this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));

            window.addEventListener('resize', debounce(() => {
                this.rect = this.DOM.el.getBoundingClientRect();
                this.updateFrame();
            }, 20));

            document.addEventListener('keydown', (ev) => {
                const keyCode = ev.keyCode || ev.which;
                if ( keyCode === 38 ) {
                    this.navigate('prev',1);
                    $('.slide_abc').each(function(i,obj){
                        if (i==($that.current-1)) {
                            $(obj).addClass("active");
                        }else{
                            $(obj).removeClass("active");
                        }

                    });
                }
                else if ( keyCode === 40 ) {
                    this.navigate('next',1);
                    $('.slide_abc').each(function(i,obj){
                        if (i==($that.current+1)) {
                            $(obj).addClass("active");
                        }else{
                            $(obj).removeClass("active");
                        }

                    });
                }
            });
            var $that = this;
            window.onwheel = function (e) {
                if($that.isAnimating)
                    e.preventDefault();
                else{
                if (e.deltaY > 0) {
                    $that.navigate('next',1);
                    $('.slide_abc').each(function(i,obj){
                        if (i==($that.current+1)) {
                            $(obj).addClass("active");
                        }else{
                            $(obj).removeClass("active");
                        }

                    });
                }
                if (e.deltaY < 0) {
                    $that.navigate('prev',1);
                    $('.slide_abc').each(function(i,obj){
                        if (i==($that.current-1)) {
                            $(obj).addClass("active");
                        }else{
                            $(obj).removeClass("active");
                        }

                    });
                }
            }
            };
						window.addEventListener('load', function(){
						    var touchsurface = $that.DOM.el,
						        startX,
						        startY,
						        dist,
						        threshold = 50,
						        allowedTime = 600,
						        elapsedTime,
						        startTime,
										swipe="";
						    function handleswipe(swipe){
						        if (swipe=="up")
						            $that.navigate('next',1);
						        else if(swipe=="down"){
						            $that.navigate('prev',1);
						        }
						    }
						    touchsurface.addEventListener('touchstart', function(e){
						        var touchobj = e.changedTouches[0]
						        dist = 0
						        startX = touchobj.pageX
						        startY = touchobj.pageY
						        startTime = new Date().getTime()
						        // e.preventDefault()
						    }, false)

						    touchsurface.addEventListener('touchmove', function(e){
						        // e.preventDefault() // prevent scrolling when inside DIV
						    }, false)

						    touchsurface.addEventListener('touchend', function(e){
						        var touchobj = e.changedTouches[0]
						        dist = touchobj.pageY - startY // get total dist traveled by finger while in contact with surface
						        elapsedTime = new Date().getTime() - startTime // get time elapsed
						        // check that elapsed time is within specified, horizontal dist traveled >= threshold, and vertical dist traveled <= 100
						        var swiperightBol = (elapsedTime <= allowedTime && dist <= -threshold )
										if(elapsedTime <= allowedTime && dist <= -(threshold/2)){
											swipe = "up";
										}
										else if(elapsedTime <= allowedTime && dist >= threshold){
											swipe = "down";
										}
						        handleswipe(swipe)
						        // e.preventDefault()
						    }, false)

						}, false);
        }
        navigate(dir = 'next',noofslides=1) {
            if(this.current === this.slidesTotal-1 && dir !== 'prev')
            {
                return;
            }
            if(this.current === this.slidesTotal-1 && dir === 'prev')
            {
                var y=$("#burger").scrollTop().valueOf();
                if(y>0)
                return;

            }
            if (this.current === 0 && dir !== 'next')
            {
                return;
            }
            if ( this.isAnimating ) return false;
            this.isAnimating = true;

            const animateShapeIn = anime({
                targets: null,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.in,
                d: this.paths.final
            });

            const animateSlides = () => {
                return new Promise((resolve, reject) => {
                    const currentSlide = this.DOM.slides[this.current];
                    anime({
                        targets: currentSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
												opacity: [1,0],
                        // scale: [dir === 'next' ? 1.15 : 1],
                        complete: () => {
                            currentSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });

                    this.current = dir === 'next' ?
                        this.current < this.slidesTotal-noofslides ? this.current + noofslides : 0 :
                        this.current > 0 ? this.current - noofslides : this.slidesTotal-noofslides;

                    const newSlide = this.DOM.slides[this.current];
                    newSlide.classList.add('slide--current');
                    anime({
                        targets: newSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
												opacity: [0,1]
                        // translateY: [dir === 'next' ? this.rect.width*noofslides : -1*this.rect.width*noofslides,0]
                    });

										if(newSlide.querySelector('.slide_bg')){
											const newSlideImg = newSlide.querySelector('.slide_bg');
	                    anime.remove(newSlideImg);
											// anime({
	                    //     targets: newSlideImg,
	                    //     duration: 0,
	                    //     translateX: -1*this.rect.width/2,
	                    //     translateY: -1*this.rect.height/2
	                    // });
	                    anime({
	                        targets: newSlideImg,
	                        duration: this.settings.animation.slides.duration,
	                        easing: this.settings.animation.slides.easing,
	                        opacity: [0,1],
	                        // scale: [dir === 'next' ? 1.15 : 1],
	                        // translateX: -1*this.rect.width/2,
	                        // translateY: -1*this.rect.height/2
	                    });
										} else{
											const newSlideImg = newSlide.querySelector('.slide__img');
	                    anime.remove(newSlideImg);
	                    anime({
	                        targets: newSlideImg,
	                        duration: this.settings.animation.slides.duration,
	                        easing: this.settings.animation.slides.easing,
	                        opacity: [0,1],
	                        // scale: [dir === 'next' ? 1 : 1.15]
											});
									}


                    anime({
                        targets: [newSlide.querySelector('.banner-text')],
                        duration: this.settings.animation.slides.duration*2,
                        easing: this.settings.animation.slides.easing,
                        delay: 400,
                        opacity: [0,1]
                    });
                });
            };

            const animateShapeOut = () => {
                anime({
                    targets: null,
                    duration: this.settings.animation.shape.duration,
                    delay: 10,
                    easing: this.settings.animation.shape.easing.out,
                    d: this.paths.initial,
                    complete: () => this.isAnimating = false
                });
            }
						// animateSlides();
            animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
        }
    };

    new Slideshow(document.querySelector('.slideshow'));
    imagesLoaded('.slide__img', { background: true }, () => document.body.classList.remove('loading'));
};
