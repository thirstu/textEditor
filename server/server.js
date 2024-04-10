


const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/textEditorDB');
const Document = require('./document');
const Cursor = require('./document');



const io=require('socket.io')(5174,{
    cors:{
        origin:'http://localhost:5173',
        methods:['GET', 'POST' ]
    }
})

const defaultValue="";

io.on('connection', socket=>{
    socket.on('get-document',async documentId=>{
    try {
        const document=await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit('load-document', document.data);
        socket.on('send-changes',delta=>{
        // console.log(delta);
        socket.broadcast.to(documentId).emit('receive-changes',delta);
    });
    ///////////////////////
    socket.on("Cursor",async cursorData =>{
        try {
        const newCursorPosition=await updateOrCreateCursor(documentId,{cursorData });
        // socket.join(newCursorPosition.id);
        console.log('hello',newCursorPosition);
        socket.broadcast.to(documentId).emit('receive-newCursorPosition',newCursorPosition);

        // socket.emit('newCursorPosi',newCursorPosi);
        // console.log(newCursorPosi.cursorData );
        // console.log(newCursorPosi.id);
        } catch (error) {
            console.log("Cursor",error);
        }
        

    } );
    } catch (error) {
        console.log("server error: " + error);
    }
        
    })
   
})

const findOrCreateDocument=async (id)=>{
    if(id == null)return;
    const document = await Document.findById(id);
    if(document)return document;

    return await Document.create({_id:id,data:defaultValue});

}

const updateOrCreateCursor = async (documentId, cursorData) => {
    try {
        // if(Cursor===null)return;
        const newCursorPosition = await Cursor.findOneAndUpdate(
            { _id: documentId }, // Correcting the field to `_id`
            { cursor: cursorData }, // Passing cursorData directly
            { new: true, upsert: true }
        );
        if (!newCursorPosition) {
            throw new Error("Failed to update/create cursor");
        }
        console.log('newCursorPosition',newCursorPosition);
        return newCursorPosition;
    } catch (error) {
        console.error("Error updating/creating cursor:", error);
        throw error;
    }
};