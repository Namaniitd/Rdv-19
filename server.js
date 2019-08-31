/**
 * Sunil and Manish
 */
const express = require('express');
const app = express();
app.set('port', (process.env.PORT || 3000));

const cors = require('cors');
const corsOption = {
  origin: true,
  methods: 'GET,HEAD,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('main'));
  app.set('views', __dirname + '/main/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'ejs');
}

const favicon = require('serve-favicon');
app.use(favicon(__dirname + '/main/favicon.ico'));

const upload = require('multer')({ dest: 'backend/uploads/' });
//  Controllers for web and app
// const budgetController = require('./backend/controllers/budgetController');
const authorize = require('./backend/controllers/adminController');
const categoryController = require('./backend/controllers/categoryController');
const eventController = require('./backend/controllers/eventController');
const inviteController = require('./backend/controllers/inviteController');
const passBookController = require('./backend/controllers/passBookController');
const passConfirmController = require('./backend/controllers/passConfirmController');
const rdvPointsController = require('./backend/controllers/rdvPointsController');
const regController = require('./backend/controllers/regController');
const sessionController = require('./backend/controllers/sessionController');
const teamController = require('./backend/controllers/teamController');
const venueController = require('./backend/controllers/venueController');

// app.get('/api/admin/budget', authorize('budget', 'create_budget_request'), budgetController.getBudgetRequests);
// app.get('/api/admin/budget/:id', authorize('budget', 'create_budget_request'), budgetController.getBudgetRequest);
// app.post('/api/admin/budget', authorize('budget', 'create_budget_request'), budgetController.addBudgetRequest);
// app.post('/api/admin/budget/:id', authorize('budget', 'approve_budget_request'), budgetController.updateBudgetRequest);

app.delete('/api/admin/category/:key', authorize('fest', 'manage_event_categories'), categoryController.deleteCategory);
app.get('/api/category', categoryController.getCategories);
app.post('/api/admin/category', authorize('fest', 'manage_event_categories'), categoryController.addCategory);

app.delete('/api/admin/event/:id', authorize('event', 'delete'), eventController.deleteEvent);
app.get('/api/admin/event-reg/:id', authorize('event', 'delete'), eventController.getEventReg);
app.get('/api/category-event/:category', eventController.getEventsCategory);
app.get('/api/event', eventController.getEvents);
app.get('/api/event/:id', eventController.getEvent);
app.post('/api/admin/event', authorize('event'), eventController.addEvent);
app.post('/api/admin/event/upload-photo', upload.single('photo'), eventController.uploadPhoto);
app.post('/api/event/register/:id', eventController.eventReg);

app.get('/api/invitee-pdf', inviteController.getInviteePDF);
app.get('/api/sponsor-pdf', inviteController.getSponsorPDF);
app.post('/api/pronite/invite', inviteController.invite);

app.get('/api/pronite/live-reg', passConfirmController.overallReg);
app.get('/api/pronite/live-registration', passConfirmController.overallReg);
app.get('/api/pronite/pdf', passConfirmController.getPDF);
app.get('/api/pronite/verify', passConfirmController.verify);
app.get('/api/pronite/waitlist-book', passBookController.waitListBook);
app.post('/api/pronite/book', passBookController.book);
app.post('/api/pronite/confirm', passConfirmController.confirm);

app.get('/api/admin/registrations', regController.getRegistrations);
app.get('/api/captcha', regController.recaptcha);
app.get('/api/reg-count', regController.getRegCount);
app.post('/api/change', regController.changePassword);
app.post('/api/forgot', regController.forgotPassword);
app.post('/api/login', regController.login);
app.post('/api/register', regController.register);

app.get('/api/admin/validate-token', sessionController.validateToken);
app.post('/api/admin/login', sessionController.login);

app.delete('/api/admin/team/:email', authorize('fest', 'update_team') ,teamController.deleteTeamMember);
app.get('/api/team', teamController.getTeam);
app.get('/api/team/:email', teamController.getTeamMember);
app.post('/api/admin/self-update', authorize('self-update'), teamController.selfUpdate);
app.post('/api/admin/team', authorize('fest', 'add_team'), teamController.addTeamMember);
app.post('/api/admin/team/:email', authorize('fest', 'update_team'), teamController.updateTeamMember);
app.post('/api/admin/update-permissions/:email', authorize('perms', 'update_perms'), teamController.updatePermissions);

app.delete('/api/admin/venue/:venue', authorize('fest', 'manage_venues'), venueController.deleteVenue);
app.get('/api/venue', venueController.getVenues);
app.post('/api/admin/venue', authorize('fest', 'manage_venues'), venueController.addVenue);

const mainRoutes = require('./backend/MainRoutes');
app.use('/', mainRoutes);
app.use('/admin', express.static('client/build'));

app.listen(app.get('port'),function(){
  console.log("Started listening on port", app.get('port'));
});
