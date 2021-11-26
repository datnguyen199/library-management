const agenda = require('./agenda');

module.exports = {
  scheduleNotifyReturnBook: async () => {
    await agenda.schedule('0 0 12 * * ?', 'notify return book')
  }
}
