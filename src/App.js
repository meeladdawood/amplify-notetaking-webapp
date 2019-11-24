import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";

import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from './graphql/queries';
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions';

function App() {
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState([]);
  const [updatedNoteId, setUpdatedNoteId] = useState(null);
  const owner = 'D1636841@urhen.com'

  //ALL LifeCycle below
  useEffect(() => {
    onLoad();
  }, []);

  useEffect(() => {
    const onCreateNoteSubscription = API.graphql(graphqlOperation(onCreateNote,{owner})).subscribe({
      next: noteData => {
        const newNote = noteData.value.data.onCreateNote;

        setNotes(prevNotes => {
          const oldNotes = prevNotes.filter(note => note.id !== newNote.id)
          return [...oldNotes, newNote]
        })
        setNewNote('')
      },
    })
    return () => onCreateNoteSubscription.unsubscribe();
  },[notes])

  useEffect(() => {
    const onDeleteNoteSubscription = API.graphql(graphqlOperation(onDeleteNote,{owner})).subscribe({
      next: noteData => {
        const deletedNoteId = noteData.value.data.onDeleteNote.id;

        setNotes(prevNotes => {
          return prevNotes.filter(note => note.id !== deletedNoteId);
        })
      }
    })
    return () => onDeleteNoteSubscription.unsubscribe();
  },[notes])

  useEffect(() => {
    const onUpdateNoteSubscription = API.graphql(graphqlOperation(onUpdateNote,{owner})).subscribe({
      next: noteData => {;

        const updatedNote = noteData.value.data.onUpdateNote

        setNotes(prevNotes => {
          const index = prevNotes.findIndex(note => note.id === updatedNote.id);
          const updatedNotes = [
            ...prevNotes.slice(0,index),
            updatedNote,
            ...prevNotes.slice(index+1)
          ];
          return updatedNotes
        })
        setNewNote('')
        setUpdatedNoteId('')
      },
    })
    return () => onUpdateNoteSubscription.unsubscribe();
  },[notes])


  const onLoad = async () => {
    const result = await API.graphql(graphqlOperation(listNotes))
    setNotes(result.data.listNotes.items)
  }

  //ALL HELPER FUNCS
  const hasExistingNote = () => {
    if (updatedNoteId) {
      const isNote = notes.findIndex(note => note.id === updatedNoteId) > -1
      return isNote;
    }
    return false;
  }

  // ALL EVENT HANDLING BELOW
  const handleAddNote = async (event) => {
    event.preventDefault();

    if(hasExistingNote()) {
      handleUpdateExistingNote(updatedNoteId)
    } else {
      const input = { note: newNote }
      await API.graphql(graphqlOperation(createNote, { input }));
    }
  }

  const handleDeleteNote = async (noteId) => {
    const input = { id: noteId }
    await API.graphql(graphqlOperation(deleteNote, { input }))
  }

  const handleUpdateExistingNote = async (noteId) => {
    const input = { id: updatedNoteId, note: newNote }
    await API.graphql(graphqlOperation(updateNote, { input }));
  }

  const handleUpdateNote = ({note, id}) => {
    setNewNote(note);
    setUpdatedNoteId(id);

  }

  // ALL UI formatting below
  const renderedNotes = notes.map((note) => {
    return (
      <div
        key={note.id}
        className='flex items-center'>
        <li className="pa1 f3" onClick={() => handleUpdateNote(note)}>
          {note.note}
        </li>
        <button
          className="bg-transparent bn f4"
          onClick={() => handleDeleteNote(note.id)}>
          <span> &times;</span>
        </button>
      </div>
    )
  })

  return (
    <div className='flex flex-column items-center justify-center pa3 bg-washed-red'>
      <h1 className="code f2-1">Note Taker</h1>
      <form className="mb3" onSubmit={handleAddNote}>
        <input
          type="text"
          className="pa2 f4"
          placeholder='Write your note'
          onChange={e => setNewNote(e.target.value)}
          value={newNote} />
        <button
          className="pa2 f4"
          type='submit'>
          {updatedNoteId ? 'Update Note' : 'Add Note'}
          </button>
      </form>
      {renderedNotes}

    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
