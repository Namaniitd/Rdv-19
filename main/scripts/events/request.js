dance = [];
literary = [];
music = [];
facc = [];
hindisamiti = [];
quizzing = [];
informal = [];
debating = [];
pfc = [];
dramatics = [];
sm = [];
adventure = [];
comedy = [];
culinary = [];
glamour = [];
tal = [];
professional = [];
magic = [];


$.get( "https://rdviitd.org/api/event").done(function( data) {
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
  generateEvents(dance);
  createEvents(dance);
  createModal(dance);
  alert( "Load was performed." );
}).always($.fn.fullpage.reBuild());

function generateEvents(eventList){
  var parent = $('.m-artists-container .fp-tableCell');
  for(var i=0;i<eventList.length;i++){
    var eventName = eventList[i].name;
    var url = "https://assets.rdviitd.org/images/events/artist/artist1.jpg";
    var element = '<figure class="effect-artist">'+
        '<img src='+url+' alt="" />'+
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
    var date = eventList[i].dtv.date;
    var time = eventList[i].dtv.time;
    var venue = eventList[i].dtv.venue;
    var url = "https://assets.rdviitd.org/images/events/artist/artist1.jpg";
    var element = '<div class="l-slide fp-slide fp-table artist-slide artist'+(i+1)+'" data-anchor="event'+(i+1)+'">'+
        '<div class="fp-tableCell">'+
        '<div class="artist-slide-next"><i class="fa fa-angle-right"></i></div>'+
        '<div class="artist-slide-name">'+
            '<h1>'+eventName+'</h1>'+
        '</div>'+
        '<div class="artist-slide-details">'+
            '<div class="artist-slide-details-center">'+
                '<div><span>'+date+'</span></div>'+
                '<div><span>'+venue+'</span></div>'+
                '<div><span>'+time+'</span></div>'+
            '</div>'+
        '</div>'+
        '<div class="artist-slide-social">'+
            '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modal_'+eventName.split(' ').join('')+'">Description</button>'+
        '</div>'
        '<div class="artist-slide-prev"><i class="fa fa-angle-left"></i>'+
        '</div>'+
      '</div>'+
      '</div>';
    parent.append(element)
  }
}
function createModal(eventList){
  var parent = $('.main');
  for(var i=0;i<eventList.length;i++){
    var eventName = eventList[i].name;
    var date = eventList[i].dtv.date;
    var time = eventList[i].dtv.time;
    var venue = eventList[i].dtv.venue;
    var desc = eventList[i].description;
    var rules = eventList[i].rules;
    var regStatus = eventList[i].reg_status;
    var regType = eventList[i].reg_type;
    var regMode = eventList[i].reg_mode;
    var prizes = eventList[i].prizes;
    var url = "https://assets.rdviitd.org/images/events/artist/artist1.jpg";
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
                        '<input class="inputn" id="tab1" type="radio" name="tabs" checked>'+
                        '<label class="labelall" for="tab1">Description</label>'+
                        '<input id="tab2" class="inputn" type="radio" name="tabs">'+
                        '<label class="labelall" for="tab2">Rules</label>'+
                        '<input id="tab3" type="radio" class="inputn" name="tabs">'+
                        '<label for="tab3" class="labelall">Eligibility</label>'+
                        '<input id="tab5" type="radio" class="inputn" name="tabs">'+
                        '<label class="labelall" for="tab5">Prizes</label>'+
                        '<section id="content1" class="sectionall">'+
                            '<div class="scr">'+
                                '<p>'+desc+'</p>'+
                            '</div>'+
                        '</section>'+
                        '<section id="content2" class="sectionall">'+
                            '<div class="scr">'+
                                '<p>'+rules+'</p>'+
                            '</div>'+
                        '</section>'+

                        '<section id="content3" class="sectionall">'+
                            '<div class="scr">'+
                              '<p>Registration Status :'+regStatus+'</p>'+
                                '<p>Registration Type :'+regType+'</p>'+
                                '<p>Registration Mode :'+regMode+'</p>'+
                              '</div>'+
                        '</section>'+

                        '<section id="content4" class="sectionall">'+
                            '<div class="scr">'+
                                '<p>'+prizes+'</p>'+
                            '</div>'+
                        '</section>'+
                    '</main>'+
                '</div>'+
                '<div class="modal-footer">'+
                    '<button type="button" class="btn btn-primary">Register </button>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>';
    parent.after(element)
  }
}
