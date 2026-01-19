
import React, { useState } from 'react';
import { Todo } from '../types';

interface TodoSectionProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string) => void;
}

export const TodoSection: React.FC<TodoSectionProps> = ({ todos, onToggle, onDelete, onAdd }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue('');
    }
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="flex flex-col h-full space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          placeholder="What's next for your new life?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full bg-white/40 border border-white/50 rounded-2xl px-5 py-4 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
        />
        <button 
          type="submit"
          className="absolute right-3 top-3 p-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        {activeTodos.length > 0 && (
          <div className="space-y-2">
            {activeTodos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        )}

        {completedTodos.length > 0 && (
          <div className="space-y-2 opacity-60">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Done</h3>
            {completedTodos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        )}

        {todos.length === 0 && (
          <div className="h-40 flex flex-col items-center justify-center text-center space-y-2 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium">Your future is a blank canvas.<br/>Start adding goals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <div className="group flex items-center bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/40 hover:bg-white/50 transition-all shadow-sm">
      <button 
        onClick={() => onToggle(todo.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
          todo.completed 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-gray-300 group-hover:border-blue-400'
        }`}
      >
        {todo.completed && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      <span className={`ml-4 text-sm font-medium flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {todo.text}
      </span>

      <button 
        onClick={() => onDelete(todo.id)}
        className="ml-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-400 rounded-lg transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
