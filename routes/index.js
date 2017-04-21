var express = require('express');
var router = express.Router();

router.get('/', checkAuthentication, function(req, res) {
  res.render('index');
});

function checkAuthentication(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect('/users/login')
  }
}

module.exports = router;
