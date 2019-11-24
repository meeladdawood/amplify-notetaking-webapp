import React, { useState } from 'react';
import { withAuthenticator } from "aws-amplify-react";

function App() {
  const [notes, setNotes] = useState([{
    id: 1,
    noteData: 'sample note'
  }]);

  const l1 = 'flex flex-column items-center justify-center pa3 bg-washed-red'
  const renderedNotes = notes.map((note) => {
    return (
      <div
        key={note.id}
        className='flex items-center'>
        <li className="pa1 f3">
          {note.noteData}
        </li>
        <button className="bg-transparent bn f4">
          <span> &times;</span>
        </button>
      </div>
    )
  })

  return (
    <div className={l1}>
      <h1 className="code f2-1">Note Taker</h1>
      <form className="mb3">
        <input
          type="text"
          className="pa2 f4"
          placeholder='Write your note' />
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
