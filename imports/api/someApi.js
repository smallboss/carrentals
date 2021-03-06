/**
 * Created by watcher on 10/22/16.
 */
/* for normal work module mongo-xlsx need set 
 path: path.resolve('../../../../../') + '/public/fromBase/', it must be at 81 string in node_modules/mongo-xlsx/lib/xlsx-rw.js
 */

var mongoXlsx = require('mongo-xlsx');

Meteor.methods({
    exportMongoToExcel: function (selectedCars) {
        /*var data = [
            {name: "Peter", lastName: "Parker", isSpider: true},
            {name: "Remy", lastName: "LeBeau", powers: ["kinetic cards"]}
        ];*/
        // const data = ApiPayments.find({}).fetch()
        const data = selectedCars;
        //Generate automatic model for processing (A static model should be used)
        var model = mongoXlsx.buildDynamicModel(data);
        // Generate Excel

        mongoXlsx.mongoData2Xlsx(data, model, function (err, data) {
            path = data.fullPath;
            console.log('File saved at:', data.fullPath);
        });
    }
})

