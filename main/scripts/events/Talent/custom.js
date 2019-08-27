/*----------------------------------------------------
Theme Name: ergo7
Version:    1.1

| ----------------------------------------------------------------------------------
| TABLE OF CONTENT
| ----------------------------------------------------------------------------------
-Fullpage js
-Home
-Timeline
-Artist Lineup
-Sponsors
-Gallery
-Ask Us
-Loader
-Menu
-Window Resize

*/

// Dom Ready Function
    $(function() {
    'use strict';
    var windowWidth;
    var windowHeight;
    /* Fullpage js initialise
    /*---------------------------------------------------- */
    var scrollingSpeed = 700;
    var logoBackground = $('#top-logo');
    var artistBack = $('#artist_back'); //artist artist back button
    var videoHome = $('#ergo_video_bg');
    var parallaxHome = $('#parallax-home');

    function createFullpage(Overflow) {
        $('#fullpage').fullpage({
            anchors: ['artist-section', 'sponsor-section'],

            // anchors: ['home-section', 'timeline-section', 'artist-section', 'sponsor-section', 'gallery-section', 'askus-section', 'contact-section'],
            scrollingSpeed: scrollingSpeed,
            sectionSelector: '.l-screen',
            slideSelector: '.l-slide',
            css3: true,
            responsiveWidth: 1200,
            scrollOverflow: Overflow,
			afterRender: function(){
				if (videoHome.length) {
                $('#bgvid')[0].play(); //Play home page background video
				}
             },
            controlArrows: false,
            'afterLoad': function(anchorLink, index) {
                logoBackground.addClass("menu_color_" + index); //Hide logo on artist click event
				windowWidth=$(window).width();
				windowHeight = $(window).height();
				if ( index === 1) {
					if (videoHome.length) {
				        $('#bgvid')[0].play(); //Play home page background video
					}
				}

            },
            'onLeave': function(index, nextIndex, direction) {
                logoBackground.removeClass(function(index, css) {
                    return (css.match(/(^|\s)menu_color_\S+/g) || []).join(' ');
                });
                if (index === 4 && direction === 'down' || index === 6 && direction === 'up') {
                    var sectionElement = $('.section').eq(5);
                    $(sectionElement).next("section").removeAttr("anm-info");
                    if ($(sectionElement).attr('anm-info') === undefined) {
                        if (windowWidth > 1200)
                            galleryReset(); //Animate gallery on page scroll for desktop
                    }
                    $(sectionElement).attr('anm-info', 'animated');
                }
            },

            onSlideLeave: function(anchorLink, index, slideIndex, direction) {
                barStart(direction); //Start artist line-up bars animation on slide leave
                $.fn.fullpage.setScrollingSpeed(0);
                if (artistBack.hasClass('active')) {
                    artistBack.removeClass('active'); //hide artist artist close button
                }
            },
            // Display the slides container by fading it in after the next slide has been loaded.
            afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex) {
                $.fn.fullpage.setScrollingSpeed(scrollingSpeed);
                if (anchorLink === "artist-section") {
                    if (slideIndex !== 0) {
                        setTimeout(function() {
                            artistBack.addClass('active'); //show artist close button
                        }, 1500);
                    } else {
                        if (artistBack.hasClass('active')) {
                            artistBack.removeClass('active'); //hide artist close button
                        }
                        if (logoBackground.hasClass('hide_logo')) {
                            setTimeout(function() {
                                logoBackground.removeClass("hide_logo"); //show right logo
                            }, 1500);
                        }

                    }

                }
            },
        });

    }
    if (document.documentElement.clientWidth > 1200) {
        var Overflow = true; //Enable each section overflow for desktop
    } else {
        var Overflow = false;
    }
    //Fullpage js initialising
    createFullpage(Overflow);
    if (!Overflow)
        $.fn.fullpage.setAllowScrolling(false);
    // HOME
    /*----------------------------------------------------*/
    //Animate background color for home
    (function($, window, document, undefined) {

        $.fn.animatedBG = function(options) {
            var defaults = {
                    colorSet: ['#ef008c', '#00be59', '#654b9e', '#ff5432', '#00d8e6'],  //background colours for home
                    speed: 3000
                },
                settings = $.extend({}, defaults, options);

            return this.each(function() {
                var $this = $(this);
                $this.each(function() {
                    var $el = $(this),
                        colors = settings.colorSet;

                    function shiftColor() {
                        var color = colors.shift();
                        colors.push(color);
                        return color;
                    }
                    // initial color
                    var initColor = shiftColor();
                    $el.css('backgroundColor', initColor);
                    setInterval(function() {
                        var color = shiftColor();
                        $el.animate({
                            backgroundColor: color
                        }, 3000);
                    }, settings.speed);
                });
            });
        };


    }(jQuery, window, document));


    // jQuery Selections
    var $html = $('html'),
        $container = $('#container'),
        $prompt = $('#prompt'),
        $toggle = $('#toggle'),
        $about = $('#about'),
        $scene = $('#scene');

    // Resize handler.
    function homeResize() {
        $scene[0].style.height = window.innerHeight + 'px';
        if (!$prompt.hasClass('hide')) {
            if (window.innerWidth < 600) {
                $toggle.addClass('hide');
            } else {
                $toggle.removeClass('hide');
            }
        }
    };


    if (parallaxHome.length) {
	 $('#background').animatedBG({}); //Initialize home background colour animation for home
    var scene = document.getElementById('scene');
    var parallax = new Parallax(scene);
    homeResize();
	}

    /* timeline
    /*---------------------------------------------------- */
    var timeline = $('#timeline-wrap');
    if (timeline.length) {
        var numItems = timeline.find('.time-wrap ').length; //count circle
    }
    if (numItems < 5) {
        var ll = $('#column-one').css("left").replace(/[^-\d\.]/g, '');
        ll = ll / 2;
        $('#timeline-wrap  .wrap-container').css("right", ll + "px"); //Adjust timeline with window size
        if (numItems < 4) $('#timeline-wrap  .wrap-container').css("top", ll + "px");
    }

    /* Artist lineup
    /*---------------------------------------------------- */
    /* artist bar animation */
    var barStart = function(direction) {
        $('#artist-description').addClass("active");
        setTimeout(
            function() {
                $('#artist-description').removeClass('active');
            }, 2000);
        logoBackground.addClass("hide_logo"); //hide logo on artist click

    };

    /* Sponsors
    /*---------------------------------------------------- */
    var contentHeight = $("#sponsors_details").height();
    var windowHeight = $(window).height();
    if (contentHeight > windowHeight) {
        $(".sponsor-section .vertical-center").css("height", "auto");
    }

    /* Gallery
    /*---------------------------------------------------- */




    /* Window Resize
    /*---------------------------------------------------- */
    var waitForFinalEvent = (function() {
        var timers = {};
        return function(callback, ms, uniqueId) {
            if (!uniqueId) {
                uniqueId = "uniqueId";
            }
            if (timers[uniqueId]) {
                clearTimeout(timers[uniqueId]);
            }
            timers[uniqueId] = setTimeout(callback, ms);
        };
    })();
    $(window).resize(function() {
        // Check window width has actually changed and it's not just iOS triggering a resize event on scroll
        if ($(window).width() !== windowWidth || $(window).height() !== windowHeight) {
            // Update the window width for next resize
            windowWidth = $(window).width();
            windowHeight = $(window).height();
            waitForFinalEvent(function() {
                var contentHeight = $("#sponsors_details").height();

                if (contentHeight > windowHeight)
                    $(".sponsor-section .vertical-center").css("height", "auto"); //Reset sponsors

                var resetOverflow = Overflow;
                if (document.documentElement.clientWidth > 1200) {
                    Overflow = true;
                } else {
                    Overflow = false;
                }
                if (resetOverflow !== Overflow) {
                    $.fn.fullpage.destroy('all');
                    createFullpage(Overflow);
                } else
                    $.fn.fullpage.reBuild();
                if (!Overflow)
                    $.fn.fullpage.setAllowScrolling(false);


            }, 1000, "some unique string");
			if (parallaxHome.length) {
            homeResize();
			}

        }
    });

    $(window).on('load', function(e) {
        //initialise artist artist previous click event
        $(".artist-slide-prev").on("click", function() {
            console.log("hi")
            $.fn.fullpage.moveSlideLeft();
        });
        //initialise artist artist next click event
        $(".artist-slide-next").on("click", function() {
            $.fn.fullpage.moveSlideRight();
        });
        //Remove loader
        $('body').addClass('loaded');

        setTimeout(function() {

            $("#loader-wrapper").remove("#loader-wrapper");
        }, 1500);
    });
    $(".artist-slide-prev").on("click", function() {
        console.log("hi")
        $.fn.fullpage.moveSlideLeft();
    });
  var dance = [];
  var literary = [];
  var music = [];
  var facc = [];
  var hindisamiti = [];
  var quizzing = [];
  var informal = [];
  var debating = [];
  var pfc = [];
  var dramatics = [];
  var sm = [];
  var adventure = [];
  var comedy = [];
  var culinary = [];
  var glamour = [];
  var tal = [];
  var professional = [];
  var magic = [];


    $.get( "http://rdv-iitd.com/api/event").done(function( data) {
      for(var i=0;i<data.events.length;i++){
        // console.log(data.events[i].category)
        if(data.events[i].category=="literary") literary.push(data.events[i])
        else if(data.events[i].category=="dance") dance.push(data.events[i])
        else if(data.events[i].category=="music") music.push(data.events[i])
        else if(data.events[i].category=="FACC") facc.push(data.events[i])
        else if(data.events[i].category=="hindisamiti") hindisamiti.push(data.events[i])
        else if(data.events[i].category=="quizzing") quizzing.push(data.events[i])
        else if(data.events[i].category=="informal") informal.push(data.events[i])
        else if(data.events[i].category=="debating") debating.push(data.events[i])
        else if(data.events[i].category=="pfc") pfc.push(data.events[i])
        else if(data.events[i].category=="dramatics") dramatics.push(data.events[i])
        else if(data.events[i].category=="glamour") glamour.push(data.events[i])
        else if(data.events[i].category=="tal") tal.push(data.events[i])
        else if(data.events[i].category=="magic") magic.push(data.events[i])
        else if(data.events[i].category=="professional") professional.push(data.events[i])
        else if(data.events[i].category=="culinary") culinary.push(data.events[i])
        else if(data.events[i].category=="comedy") comedy.push(data.events[i])
        else if(data.events[i].category=="adventure") adventure.push(data.events[i])
        else if(data.events[i].category=="sm") sm.push(data.events[i])
        else console.log(data.events[i].category)
      }
      generateEvents(tal);
      createEvents(tal);
      createModal(tal);
    }).always(function(){
      $.fn.fullpage.destroy('all');
      createFullpage(Overflow);
      $(".artist-slide-prev").click(function() {
          $.fn.fullpage.moveSlideLeft();
      });
      $(".artist-slide-next").click(function() {
          $.fn.fullpage.moveSlideRight();
      });
    });

    function generateEvents(eventList){
      var parent = $('.m-artists-container .fp-tableCell');
      for(var i=0;i<eventList.length;i++){
        var eventName = eventList[i].name;
        if(eventList[i].photos){
          var url1 = eventList[i].photos[0];
          var url2 = eventList[i].photos[1];
        }else{
          var url1 = "../../../../assets/images/events/artist/artist1.jpg";
          var url2 = "../../../../assets/images/events/artist/artist1.jpg";
        }
        var element = '<figure class="effect-artist">'+
            '<img src='+url1+' alt="" />'+
            '<figcaption>'+
                '<h2>'+eventName+'</h2>'+
                '<a href="#artist-section/event'+(i+1)+'">'+'<span class="artist-name">'+eventName+'</span> </a>'+
            '</figcaption>'+
        '</figure>';
        parent.append(element)
      }
    }

    function createEvents(eventList){
      var parent = $('.fp-slidesContainer');
      for(var i=0;i<eventList.length;i++){
        var eventName = eventList[i].name;
        var finalsDate = "Contact Event Coordinator for details";
        if(eventList[i].dtv.length!=0){
          var finalsDate = eventList[i].dtv[eventList[i].dtv.length-1].date;
        }

        if(eventList[i].photos){
          var url1 = eventList[i].photos[0];
          var url2 = eventList[i].photos[1];
        }else{
          var url1 = "../../../../assets/images/events/artist/artist1.jpg";
          var url2 = "../../../../assets/images/events/artist/artist1.jpg";
        }
        var element = '<div class="l-slide artist-slide artist'+(i+1)+'" style="background-image: url('+url1+')" data-anchor="event'+(i+1)+'">'+
            '<div class="artist-slide-next"><i class="fa fa-angle-right"></i></div>'+
            '<div class="artist-slide-name"><h1>'+eventName+'</h1></div>'+
            '<div class="artist-slide-details">'+
                '<div class="artist-slide-details-center">'+
                    '<div><span>Finals : '+finalsDate+'</span></div>'+
                '</div>'+
            '</div>'+
            '<div class="artist-slide-social">'+
                '<button type="button" class="btn btn-primary" data-toggle="modal" style="font-size:2.2em;padding: 0px 15px;" data-target="#modal_'+eventName.split(' ').join('')+'">Description</button>'+
            '</div>'+
            '<div class="artist-slide-prev"><i class="fa fa-angle-left"></i></div>'+
          '</div>';
        parent.append(element)
      }
    }
    function createModal(eventList){
      var parent = $('.main');
      function formatTime(string){
        var time = new Date(string);
        return time.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}).replace(/(:\d{2}| [AP]M)$/, "");
      }
      for(var i=0;i<eventList.length;i++){
        var eventName = eventList[i].name;
        var desc = eventList[i].description;
        var rules = eventList[i].rules;
        var regStatus = eventList[i].reg_status;
        var regType = eventList[i].reg_type;
        var regMode = eventList[i].reg_mode;
        var prizes = eventList[i].prizes;
        var numberContact = eventList[i].poc.length;
        var id  = eventList[i].id;
        var maxTeamSize = eventList[i].reg_max_team_size;
        var input = "";
        var contacts = eventList[i].poc;
        var contactDetails = "";
        var registerElement = "";
        var dtvDetails ="";
        if(contacts.length>0){
          for(var k=0;k<contacts.length;k++){
            contactDetails += '<div class="col-md-6" style="text-align:center; margin-bottom:20px;"><p style="margin-bottom:8px;">'+contacts[k].name+'</p><p style="margin-bottom:8px;">'+contacts[k].designation+'</p><a href="mailto:'+contacts[k].email+'"><i class="fa fa-envelope"></i></a><br><a href="tel:'+contacts[k].contact+'"><i class="fa fa-phone">&nbsp;&nbsp;'+contacts[k].contact+'</i></a></div>'
          }
        }
        if(maxTeamSize!=null){
          for(var j=1;j<maxTeamSize;j++){
            input += '<div class="form-group"><input class="input form-control" id="#'+eventName.split(' ').join('')+'field'+j+'" name="register" type="text" placeholder="Team Member\'s RDV Id"/></div>';
          }
        }
        if(regMode=="Website" && regStatus){
          registerElement = '<form class="input-append" method="POST" action="/api/event/register/'+id+'">'+
                                  '<div class="form-group"><input type="text" class="form-control" name="team_name" placeholder="Enter Team Name"></div>'+
                                  '<div class="form-group"><input class="input form-control" id="#'+eventName.split(' ').join('')+'field" name="register" type="text" placeholder="Enter your RDV Id" required/></div>'+
                                    input+
                                  '<div class="form-group"><input class="input form-control" id="#'+eventName.split(' ').join('')+'sub" name="submission" type="text" placeholder="Enter submission link(if any)"/></div>'+
                                  '<button type="submit" class="btn btn-primary">Register</button>'+
                                  '</form>';
        }else if(regMode=="External" && regStatus){
          registerElement = '<p>Registration Link: <a href="'+eventList[i].reg_link+'">'+eventList[i].reg_link+'</a></p>';
        }else if(regStatus){
          registerElement = '<p>Contact Event Coordinator for details</p>';
        }else{
          registerElement = '<p>Registration has been <b>closed</b>.</p>';
        }
        if(eventList[i].dtv.length!=0){
          for(var l=0;l<eventList[i].dtv.length;l++){
            dtvDetails += '<div class="col-md-6" style="text-align:center; margin-bottom:20px;"><p style="margin-bottom:8px;">'+eventList[i].dtv[l].type+'</p><p style="margin-bottom:8px;">'+eventList[i].dtv[l].venue+'</p><p style="margin-bottom:8px;">'+eventList[i].dtv[l].date+'</p><p style="margin-bottom:8px;">'+formatTime(eventList[i].dtv[l].start_time)+'</p></div>'
          }
        }else{
          dtvDetails = "Contact Event Co-ordinator for all details";
        }
        var element = '<div class="modal fade" id="modal_'+eventName.split(' ').join('')+'" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">'+
            '<div class="modal-dialog modal-dialog-centered" role="document">'+
                '<div class="modal-content">'+
                    '<div class="modal-header">'+
                        '<h5 class="modal-title" id="exampleModalLongTitle">'+eventName+'</h5>'+
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                            '<span aria-hidden="true">&times;</span>'+
                        '</button>'+
                    '</div>'+

                    '<div class="modal-body">'+
                        '<main class="mainn">'+
                            '<input class="inputn" id="tab1_'+eventName.split(' ').join('')+'" type="radio" name="tabs" checked>'+
                            '<label class="labelall" for="tab1_'+eventName.split(' ').join('')+'">Description</label>'+
                            '<input id="tab2_'+eventName.split(' ').join('')+'" class="inputn" type="radio" name="tabs">'+
                            '<label class="labelall" for="tab2_'+eventName.split(' ').join('')+'">Rules</label>'+
                            '<input id="tab3_'+eventName.split(' ').join('')+'" type="radio" class="inputn" name="tabs">'+
                            '<label for="tab3_'+eventName.split(' ').join('')+'" class="labelall">Venue</label>'+
                            '<input id="tab4_'+eventName.split(' ').join('')+'" type="radio" class="inputn" name="tabs">'+
                            '<label class="labelall" for="tab4_'+eventName.split(' ').join('')+'">Prizes</label>'+
                            '<input id="tab5_'+eventName.split(' ').join('')+'" type="radio" class="inputn" name="tabs">'+
                            '<label class="labelall" for="tab5_'+eventName.split(' ').join('')+'">Register</label>'+
                            '<input id="tab6_'+eventName.split(' ').join('')+'" type="radio" class="inputn" name="tabs">'+
                            '<label class="labelall" for="tab6_'+eventName.split(' ').join('')+'">Contact</label>'+
                            '<section id="content1_'+eventName.split(' ').join('')+'" class="sectionall">'+
                                '<div class="scr">'+
                                    '<p>'+desc+'</p>'+
                                '</div>'+
                            '</section>'+
                            '<section id="content2_'+eventName.split(' ').join('')+'" class="sectionall">'+
                                '<div class="scr">'+
                                    '<p>'+rules+'</p>'+
                                '</div>'+
                            '</section>'+

                            '<section id="content3_'+eventName.split(' ').join('')+'" class="sectionall">'+
                                '<div class="scr">'+
                                  dtvDetails+
                                  '</div>'+
                            '</section>'+

                            '<section id="content4_'+eventName.split(' ').join('')+'" class="sectionall">'+
                                '<div class="scr">'+
                                    '<p>'+prizes+'</p>'+
                                '</div>'+
                            '</section>'+
                            '<section id="content5_'+eventName.split(' ').join('')+'" class="sectionall">'+
                                '<div class="scr">'+
                                  registerElement+
                                '</div>'+
                            '</section>'+
                            '<section id="content6_'+eventName.split(' ').join('')+'" class="sectionall">'+
                                '<div class="scr">'+
                                    '<div class="row">'+contactDetails+'</div>'+
                                '</div>'+
                            '</section>'+
                        '</main>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>';
        parent.after(element);
      }
    }


});

$(window).on('load', function(e) {
    //initialise artist artist previous click event
    $(".artist-slide-prev", '#artist_all_container').on("click", function() {
        $.fn.fullpage.moveSlideLeft();
    });
    //initialise artist artist next click event
    $(".artist-slide-next", '#artist_all_container').on("click", function() {
        $.fn.fullpage.moveSlideRight();
    });
    //Remove loader
    $('body').addClass('loaded');

    setTimeout(function() {

        $("#loader-wrapper").remove("#loader-wrapper");
    }, 1500);
});
