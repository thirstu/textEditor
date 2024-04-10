import React, { useCallback, useEffect, useRef, useState } from 'react'
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import './index.css';
import {io} from 'socket.io-client'
import { useParams } from 'react-router-dom'; 

///////////////
const save_interval_ms=1000;
const Toolbar_Options =[
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],

  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  [{ 'direction': 'rtl' }],                         // text direction

  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],

  ['clean']                                         // remove formatting button
];


function TextEditor() {
  

   const {id:documentId}=useParams();
  const [socket,setSocket]=useState();
  const [quill,setQuill]=useState();
  // console.log(socket);
  // const [cursorPosition,setCursorPosition]=useState({});

  // setting socket
  useEffect(()=>{
    
    
    const s=io('http://localhost:5174');
    setSocket(s);


    return ()=>{
      s.disconnect();
    }

  },[]);
/////end of useEffect
// setting quill and editor document
useEffect(()=>{
  // console.log(socket);
  if(socket==null||quill==null)return;
  socket.once('load-document',document=>{
    quill.setContents(document);
    quill.enable();
  })
  socket.emit('get-document',documentId)
},[socket,quill,documentId])
/////end of useEffect
//update current cursor position
useEffect(()=>{
  let cursorPosition;
  // let container;

  if(socket==null||quill==null)return;
  const container=document.querySelector('.container');
  const cursorEl=document.createElement('span');
  cursorEl.classList.add('cursor');
  container.appendChild(cursorEl);
  //////////////////////////////////////
  const showCurrentCursor=(cursorPosition)=>{
   
    cursorEl.style.top=`${cursorPosition.y}px`;
    cursorEl.style.left=`${cursorPosition.x}px`;
  }
 /////////////////////////////////
  const handleMouseMove=(event) =>{
       cursorPosition={
          x: event.clientX,
          y: event.clientY
      };
      // showCurrentCursor(cursorPosition);
      // if(!cursorPosition)return;
      // socket.emit('Cursor',JSON.stringify(cursorPosition));
  
  }
  /////////////////////////////////////////
    container.addEventListener('mousemove', handleMouseMove );
 /////////////////////////////////
    socket.on('receive-newCursorPosition',newCursorPosition=>{
    const cursorPosition = JSON.parse(newCursorPosition.data);
    showCurrentCursor(cursorPosition);

      })
  const interval=setInterval(()=>{
    if(!cursorPosition)return;
    socket.emit('Cursor',JSON.stringify(cursorPosition));
    socket.emit('save-document',quill.getContents())
  },save_interval_ms);

return ()=>{
  clearInterval(interval);
  container.removeEventListener('mousemove',handleMouseMove);
}
},[socket,quill])
/////end of useEffect
// useEffect(()=>{
//   if(socket==null||quill==null)return;

  
// },[save_interval_ms])
/////end of useEffect

useEffect(()=>{
  if(socket == null || quill == null)return;
  ////sending data to the server depending on who's making changes
  const handler=(delta) => {
   quill.updateContents(delta);
  }
  socket.on('receive-changes',handler );

 return ()=>{
  socket.off('receive-changes',handler);
 }

},[socket,quill]);
/////end of useEffect
useEffect(()=>{
  if(socket == null || quill == null)return;
  ////sending data to the server depending on who's making changes
  const handler=(delta, oldDelta, source) => {
    if (source !== 'user') {
      return ;
    } else if (source == 'user') {
      // sending changes to server
      socket.emit("send-changes",delta)
    }
  }
  quill.on('text-change',handler );

 return ()=>{
  quill.off('text-change',handler);
 }

},[socket,quill]);
/////end of useEffect


  const wrapperRef=useCallback((wrapper) => {
    // checking if wrapper does have editor el (div)
    if(wrapper===null)return;
    // if wrapper does have editor el (div) then empty it out so new one can be created(to avoid rendering same thing more than once);
    wrapper.innerHTML ="";

    // creating div element
    const editor=document.createElement("div");
    // appending editor el in container
    wrapper.append(editor);
    
    // creating editor tool
    const q=new Quill(editor,{theme:'snow',
  modules:{
    toolbar: Toolbar_Options,
  }
  });
    q.disable();
    q.setText('Loading...')
   setQuill(q)
  },[])
/////end of wrapper

  return (
    <div className='container' ref={wrapperRef}></div>
  )
}

export default TextEditor;