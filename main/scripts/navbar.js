var menuBtn = $('#toggle');
var innerSpace = $('.inner-space');
var innerContent = $('.inner-content');
var menu = $('#menu');
var nav  = $('.nav');
var link  = $('.nav-link');
var ban = $('.ban-img');
menuBtn.on('click',function(){
  menuBtn.toggleClass('project-open');
  if(menu.hasClass('visible')){
    innerContent.toggleClass('visible',false);
    link.toggleClass('is-visible',false);
     ban.toggleClass('is-visible',false);
    innerSpace.toggleClass('active',false).one('transitionend',function(){
      menu.toggleClass('visible',false);
    });
  }else{
    innerContent.toggleClass('visible');
    menu.toggleClass('visible').one('transitionend',function(){

      innerSpace.toggleClass('active');
      link.toggleClass('is-visible')
          ban.toggleClass('is-visible');
    });
  }
})
