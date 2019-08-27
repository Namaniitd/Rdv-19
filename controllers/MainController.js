

module.exports = {
    home:home
}


//==========================================================
//========== get request handling==========================
//==========================================================

function home(req,res){
    res.render('index.ejs', {
        user:req.session.user
    });
}