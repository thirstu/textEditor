const {Schema,model} = require('mongoose');

const Document= new Schema({
    _id:String,
    data:Object,
});

const Cursor =new Schema({
    _id:String,
    cursor:Object, 

});

module.exports=model('Cursor', Cursor);
module.exports=model('Document', Document);