var func = require('./basic_import_test.js');

func.testFunc();

load.action('Main', () => {
    const transaction = new load.Transaction("My Transaction");
transaction.start();
const request = new load.WebRequest("http://kalimanjaro.hpeswlab.net/WebTours/");
const response = request.sendSync();
load.sleep(2.5);
transaction.update();
transaction.stop();
x.foo() //this should throw
});