/**
 * Sunil and Manish
 */
const express = require('express');
const bodyParser = require('body-parser');

const upload = require('multer')({ dest: 'uploads/' });
var app = require('./ApplicationInstance');
var _ = require("underscore");
var mainRoutes = require('./backend/routes/MainRoutes');

//  Controllers for web and app
const authorize = require('./controllers/adminController');
const sessionController = require('./controllers/sessionController');
const regController = require('./controllers/regController');
const teamController = require('./controllers/teamController');
const categoryController = require('./controllers/categoryController');
const venueController = require('./controllers/venueController');
const eventController = require('./controllers/eventController');
// const budgetController = require('./controllers/budgetController');
const passBookController = require('./controllers/passBookController');
const passConfirmController = require('./controllers/passConfirmController');
const inviteController = require('./controllers/inviteController');
const rdvPointsController = require('./controllers/rdvPointsController');
// const passRouter = require('./main/bohogetaway/app');

const cors = require('cors');
// enable cors
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

app.set('port', (process.env.PORT || 3000));


// for static content
if ((process.env.NODE_ENV === 'production')) {
  app.use('/admin' ,express.static('client/build'));
  app.use(express.static('main'));
  app.set('views', __dirname + '/main/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'ejs');
}
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/api/admin/login', sessionController.login);
app.get('/api/admin/validate-token', sessionController.validateToken);


// REg APIS
app.post('/api/register', regController.register);
app.post('/api/register1', regController.register1);
app.post('/api/login', regController.login);
app.post('/api/forgot', regController.forgotPassword);
app.post('/api/change', regController.changePassword);
app.get('/api/captcha', regController.recaptcha);
app.get('/api/reg-count', regController.getRegCount);
app.get('/api/admin/registrations', regController.getRegistrations);

//Team Api
app.get('/api/team', teamController.getTeam);
app.get('/api/team/:email', teamController.getTeamMember);
app.post('/api/admin/team', authorize('fest', 'add_team'), teamController.addTeamMember);
app.post('/api/admin/team/:email', authorize('fest', 'update_team'), teamController.updateTeamMember);
app.delete('/api/admin/team/:email', authorize('fest', 'update_team') ,teamController.deleteTeamMember);
app.post('/api/admin/update-permissions/:email', authorize('perms', 'update_perms'), teamController.updatePermissions);
app.post('/api/admin/self-update', authorize('self-update'), teamController.selfUpdate);

app.get('/api/category', categoryController.getCategories);
app.post('/api/admin/category', authorize('fest', 'manage_event_categories'), categoryController.addCategory);
app.delete('/api/admin/category/:key', authorize('fest', 'manage_event_categories'), categoryController.deleteCategory);

app.get('/api/venue', venueController.getVenues);
app.post('/api/admin/venue', authorize('fest', 'manage_venues'), venueController.addVenue);
app.delete('/api/admin/venue/:venue', authorize('fest', 'manage_venues'), venueController.deleteVenue);

app.get('/api/event', eventController.getEvents);
app.get('/api/event/:id', eventController.getEvent);
app.post('/api/admin/event', authorize('event'), eventController.addEvent);
app.post('/api/admin/event/upload-photo', upload.single('photo'), eventController.uploadPhoto);
app.delete('/api/admin/event/:id', authorize('event', 'delete'), eventController.deleteEvent);
app.get('/api/category-event/:category', eventController.getEventsCategory);
app.get('/api/admin/event-reg/:id', authorize('event', 'delete'), eventController.getEventReg);

app.post('/api/event/register/:id', eventController.eventReg);

// // bugget api
// app.get('/api/admin/budget', authorize('budget', 'create_budget_request'), budgetController.getBudgetRequests);
// app.get('/api/admin/budget/:id', authorize('budget', 'create_budget_request'), budgetController.getBudgetRequest);
// app.post('/api/admin/budget', authorize('budget', 'create_budget_request'), budgetController.addBudgetRequest);
// app.post('/api/admin/budget/:id', authorize('budget', 'approve_budget_request'), budgetController.updateBudgetRequest);

// app.post('/api/app/rdvPoints', rdvPointsController.set);

// API router for pass system
// app.use('/bohogetaway', passRouter);
// app.set('views', 'main/bohogetaway/views');
// app.set('view engine', 'pug');

app.post('/api/pronite/book', passBookController.book);
app.get('/api/pronite/waitlist-book', passBookController.waitListBook);
app.post('/api/pronite/confirm', passConfirmController.confirm);
app.get('/api/pronite/verify', passConfirmController.verify);
app.get('/api/pronite/pdf', passConfirmController.getPDF);
app.get('/api/pronite/live-reg', passConfirmController.overallReg);
app.get('/api/pronite/live-registration', passConfirmController.overallReg);

app.post('/api/pronite/invite', inviteController.invite);
app.get('/api/invitee-pdf', inviteController.getInviteePDF);
app.get('/api/sponsor-pdf', inviteController.getSponsorPDF);

if ((process.env.NODE_ENV === 'production')) {
  app.use('/admin/favicon.ico', (req, res) => res.sendFile(`${__dirname}/client/build/favicon.ico`));
  app.use('/admin', (req, res) => res.sendFile(`${__dirname}/client/build/index.html`));
}
app.use('/', mainRoutes);
app.listen(app.get('port'),function(){
    console.log("Started listening on port", app.get('port'));
});
