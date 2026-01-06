import React from 'react';

const dummyNotes = [
    // Dummy data is useful for testing but will be replaced by props.
    // It's good practice to keep it for isolated development or storybook.
    {
        id: 1,
        title: 'Meeting Notes 2024-07-26',
        content: 'Discussed Q3 roadmap. Key takeaways: focus on user retention, and push for new feature X. Marketing to ramp up efforts in August. Engineering needs to provide estimates by next week.',
        isPrivate: false,
    },
    {
        id: 2,
        title: 'Personal Project Ideas',
        content: 'Build a secure note-taking app. Explore using MERN stack with Tailwind CSS. Implement end-to-end encryption as a stretch goal. Privacy-first design.',
        isPrivate: false,
    },
    {
        id: 3,
        title: 'Secret Access Codes',
        content: 'Area 51: 1234-5678. Project Aurora: 9876-5432. Do not share with anyone. This information is critical and sharing could compromise the entire operation.',
        isPrivate: true,
    },
];

const NoteCard = ({ note, onEdit, onDelete }) => {
    // A Pen icon for the edit button
    const EditIcon = (props) => (
        <svg {...props} viewBox="0 0 20 20" fill="currentColor" ><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
    );

    // A Trash can icon for the delete button
    const DeleteIcon = (props) => (
       <svg {...props} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
    );

    const LockIcon = (props) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 4V5a1 1 0 012 0v1H9z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className="group relative break-inside-avoid mb-4 p-5 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors duration-300 ease-in-out">
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {onEdit && (
                    <button onClick={() => onEdit(note)} className="p-1.5 text-zinc-400 hover:text-indigo-400 bg-zinc-800/50 hover:bg-zinc-800 rounded-full">
                        <EditIcon className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button onClick={() => onDelete(note._id || note.id)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800/50 hover:bg-zinc-800 rounded-full">
                        <DeleteIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            
            <div className="flex items-center gap-2">
                {note.isPrivate && <LockIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
                <h3 className="text-lg font-semibold tracking-tight text-zinc-100 truncate pr-12">{note.title}</h3>
            </div>
            
            <div className={`mt-2 ${note.isPrivate ? 'blur-sm select-none' : ''}`}>
                <p className="text-zinc-400 whitespace-pre-wrap">{note.content}</p>
            </div>
        </div>
    );
};


export default function NotesGrid({ notes = dummyNotes, onEdit, onDelete, onCreate }) {
    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                     <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50">Your Notes</h1>
                     <p className="text-zinc-400 mt-2">A secure and private space for your thoughts.</p>
                </div>
                {onCreate && (
                     <button
                        onClick={onCreate}
                        className="w-full md:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-colors"
                      >
                        Create Note
                      </button>
                )}
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                {notes.map(note => (
                    <NoteCard 
                        key={note._id || note.id} 
                        note={note} 
                        onEdit={onEdit} 
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}
