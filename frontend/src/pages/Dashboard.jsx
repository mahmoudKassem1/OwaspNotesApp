import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Import the new components
import Layout from '../components/Layout';
import NotesGrid from '../components/NotesGrid';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get('/notes');
        setNotes(response.data);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch notes.',
          icon: 'error',
          background: '#18181b',
          color: '#f4f4f5'
        });
      }
    };

    if (!user) {
      navigate('/login');
    } else {
      fetchNotes();
    }
  }, [user, navigate]);
  
  const resetForm = () => {
      setTitle('');
      setContent('');
      setIsPrivate(true);
  }

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/notes', { title, content, isPrivate });
      setNotes([...notes, response.data]);
      resetForm();
      setCreateModalOpen(false);
      Swal.fire({
        title: 'Success!',
        text: 'Note saved successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#18181b',
        color: '#f4f4f5'
      });
    } catch (error) {
      console.error('Failed to create note:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to create note.',
        icon: 'error',
        background: '#18181b',
        color: '#f4f4f5'
      });
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/notes/${currentNote._id}`, {
        title: currentNote.title,
        content: currentNote.content,
        isPrivate: currentNote.isPrivate,
      });
      setNotes(
        notes.map((note) =>
          note._id === currentNote._id ? response.data : note
        )
      );
      setIsEditing(false);
      setCurrentNote(null);
      Swal.fire({
        title: 'Success!',
        text: 'Note updated successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#18181b',
        color: '#f4f4f5'
      });
    } catch (error) {
      console.error('Failed to update note:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update note.',
        icon: 'error',
        background: '#18181b',
        color: '#f4f4f5'
      });
    }
  };

  const handleEditClick = async (note) => {
    if (note.isPrivate) {
      const { value: password } = await Swal.fire({
        title: 'Enter Password',
        text: 'This is a private note. Please enter your password to edit.',
        input: 'password',
        inputPlaceholder: 'Enter your password',
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Verify',
        confirmButtonColor: '#6366f1',
        background: '#18181b',
        color: '#f4f4f5',
        showLoaderOnConfirm: true,
        preConfirm: (password) => {
          return axios.post('/auth/verify-password', { password })
            .then(response => {
              if (response.status !== 200) {
                throw new Error(response.statusText);
              }
              return password;
            })
            .catch(error => {
              Swal.showValidationMessage(
                `Request failed: ${error.response?.data?.message || 'Invalid password'}`
              );
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
      });

      if (password) {
        setCurrentNote(note);
        setIsEditing(true);
      }
    } else {
      setCurrentNote(note);
      setIsEditing(true);
    }
  };

  const handleDeleteNote = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
      background: '#18181b',
      color: '#f4f4f5'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/notes/${id}`);
          setNotes(notes.filter((note) => note._id !== id));
          Swal.fire({
            title: 'Deleted!', 
            text: 'Your note has been deleted.', 
            icon: 'success',
            background: '#18181b',
            color: '#f4f4f5'
        });
        } catch (error) {
          console.error('Failed to delete note:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete note.',
            icon: 'error',
            background: '#18181b',
            color: '#f4f4f5'
          });
        }
      }
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const handleOpenCreateModal = () => {
      resetForm();
      setCreateModalOpen(true);
  }

  const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
  }

  const filteredNotes = useMemo(() => {
    return notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm]);

  const renderModal = (titleText, handleSubmit, noteData, setNoteData, closeModal) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4">
        <h3 className="text-2xl font-semibold mb-6 text-center text-zinc-100">{titleText}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                id="title"
                value={noteData.title}
                onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                className="appearance-none block w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                placeholder="Note Title"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-zinc-400 mb-1">Content</label>
              <textarea
                id="content"
                rows={5}
                value={noteData.content}
                onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                className="block w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                placeholder="What's on your mind?"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-zinc-400 text-sm font-medium">Make this note private</span>
              <button
                type="button"
                onClick={() => setNoteData({ ...noteData, isPrivate: !noteData.isPrivate })}
                className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none transition-colors duration-200 ease-in-out ${noteData.isPrivate ? 'bg-indigo-500' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${noteData.isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="pt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4">
            <button
              type="button"
              onClick={closeModal}
              className="mt-3 sm:mt-0 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white bg-transparent rounded-lg hover:bg-zinc-800 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <Layout 
        user={user} 
        onLogout={handleLogout}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
    >
        <NotesGrid 
            notes={filteredNotes}
            onEdit={handleEditClick}
            onDelete={handleDeleteNote}
            onCreate={handleOpenCreateModal}
            authUser={user}
        />

        {isCreateModalOpen && renderModal(
          'Create a New Note',
          handleCreateNote,
          { title, content, isPrivate },
          (data) => {
            setTitle(data.title);
            setContent(data.content);
            setIsPrivate(data.isPrivate);
          },
          () => setCreateModalOpen(false)
        )}

        {isEditing && currentNote && renderModal(
          'Edit Note',
          handleUpdateNote,
          currentNote,
          setCurrentNote,
          () => setIsEditing(false)
        )}
    </Layout>
  );
};

export default Dashboard;