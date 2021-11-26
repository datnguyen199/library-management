const Agenda = require('agenda');

require('dotenv').config();

const connectionOpts = {
  db: { address: process.env.MONGODB_URL, collection: 'agendaJobs' }
};

const agenda = new Agenda(connectionOpts);

require('../jobs/sendMail')(agenda);

agenda
  .on('ready', () => console.log('Agenda started!'))
  .on('error', () => console.log('Agenda connection error!'));

agenda.start();

agenda.on('fail:notify return book', (err, job) => {
  console.log(`Job failed with error: ${err.message}`);
});

// agenda.on("success:notify return book", (job) => {
//   console.log(`Sent Email Successfully`);
// });

module.exports = agenda;
