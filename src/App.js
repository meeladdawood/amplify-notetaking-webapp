import React, { useState } from 'react';
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { createNote, deleteNote} from "./graphql/mutations";

function App() {
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState([]);

  const renderedNotes = notes.map((note) => {
    return (
      <div
        key={note.id}
        className='flex items-center'>
        <li className="pa1 f3">
          {note.note}
        </li>
        <button className="bg-transparent bn f4">
          <span> &times;</span>
        </button>
      </div>
    )
  })

  const handleAddNote = async (event) => {
      event.preventDefault();
      const input = {
        note: newNote
      }

      const result = await API.graphql(graphqlOperation(createNote, {input}));
      const newlyAddedNote = result.data.createNote;
      const newListOfNotes = [newlyAddedNote, ...notes];
      setNotes(newListOfNotes)
      setNewNote('')
  }

  return (
    <div className='flex flex-column items-center justify-center pa3 bg-washed-red'>
      <h1 className="code f2-1">Note Taker</h1>
      <form className="mb3" onSubmit={handleAddNote}>
        <input
          type="text"
          className="pa2 f4"
          placeholder='Write your note' 
          onChange={(e)=> setNewNote(e.target.value)}
          value={newNote}/>
        <button
          className="pa2 f4"
          type='submit'>
          Add Note
          </button>
      </form>
      {renderedNotes}

    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
