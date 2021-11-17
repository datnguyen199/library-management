const FactoryGirl = require('factory-girl');
FactoryGirl.factory.setAdapter(new FactoryGirl.MongooseAdapter());
require('../factories/index')();
