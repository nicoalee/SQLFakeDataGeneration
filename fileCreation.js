var fs = require('fs');

fs.appendFile('hello_world.sql', 'CREATE TABLE Studnets', function (err) {
    if(err) console.log(err);
    else {
        console.log("File creation successful");
        
    }
})