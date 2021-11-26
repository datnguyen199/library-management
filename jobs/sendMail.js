const sendMailService = require('../services/sendMailService');
const Borrow = require('../models/borrow');

module.exports = function (agenda) {
  agenda.define('notify return book', { concurrency: 10 }, async job => {
    // const { userName, email } = job.attrs.data;
    let borrowUsers = Borrow.findWithUserADayBeforeReturn(new Date());
    // let mockBorrowUsers =  [
      // {"bookInstances":[{"_id":"bookID1","book":{"_id":"61a086e63c13b99266e993f4","title":"Book 1"}}],"_id":"61a086e63c13b99266e993f8","user":{"_id":"61a086e63c13b99266e993f2","firstName":"A","lastName":"B","email":"zqb55363@cuoly.com"}},
    //   {"bookInstances":[{"_id":"bookID2","book":{"_id":"61a086e63c13b99266e993f4","title":"Book 2"}}],"_id":"61a086e63c13b99266e993fa","user":{"_id":"61a086e63c13b99266e993f2","firstName":"Cornell","lastName":"McCullough","email":"fvy89513@boofx.com"}}
    // ]
    if(borrowUsers.length > 0) {
      for(let data of borrowUsers) {
        let { firstName, lastName, email } = data['user'],
            listBooks = '';
        for(let bookInstance of data['bookInstances']) {
          let { _id: bookInstanceId, book: { title: bookName } } = bookInstance;
          listBooks += `- book id: ${bookInstanceId}, title: ${bookName} <br>`
        }
        let mailData = {
          toEmail: `${email}`,
          subject: 'Booking room app',
          content: `Hi ${firstName} ${lastName}, we notify to let you know tommorow is
            deadline to return following books: <br>
            ${listBooks} <br>
            Thank you and have a nice day!
          `
        };
        sendMailService.sendEmail(mailData);
      }
    }
  })
}
