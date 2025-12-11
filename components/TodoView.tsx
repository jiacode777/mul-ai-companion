import React from 'react';
import { TodoItem } from '../types';
import { ambientSound } from '../services/audioService';

interface TodoViewProps {
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  switchToChat: () => void;
}

export const TodoView: React.FC<TodoViewProps> = ({ todos, setTodos, switchToChat }) => {
  
  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const isNowCompleted = !t.completed;
        if (isNowCompleted) {
          ambientSound.playChime(600 + Math.random() * 200); // Higher pitch happy chime
        }
        return { ...t, completed: isNowCompleted };
      }
      return t;
    }));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="flex flex-col h-full w-full p-6 overflow-y-auto bg-gradient-to-b from-white/40 to-white/10">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Gentle Plan</h2>
        <p className="text-slate-500">
          Small steps flowing with your mood.
        </p>
      </div>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-400 gap-4">
          <div className="text-6xl opacity-30">🍃</div>
          <p className="text-center max-w-xs leading-relaxed">
            Your list is empty. <br/>
            Tell Mul how you're feeling in the chat (e.g., "I feel drained" or "I feel happy") to get a gentle plan.
          </p>
          <button 
            onClick={switchToChat}
            className="mt-4 px-6 py-2 bg-mul-soft text-mul-deep rounded-full hover:bg-mul-light transition-colors font-medium"
          >
            Go to Chat
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-lg mx-auto w-full">
          
          {/* Active Tasks */}
          <div className="space-y-3">
            {activeTodos.map((todo) => (
              <div 
                key={todo.id} 
                className="group flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 animate-float"
                style={{ animationDuration: '6s', animationDelay: `${parseInt(todo.id) % 5 * 0.2}s` }}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="w-6 h-6 rounded-full border-2 border-mul-main flex items-center justify-center text-white hover:bg-mul-light transition-colors flex-shrink-0"
                >
                  {/* Empty circle when not done */}
                </button>
                <span className="text-slate-700 font-medium flex-1">{todo.text}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-opacity p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Completed Tasks Section */}
          {completedTodos.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Completed</h3>
              <div className="space-y-2">
                {completedTodos.map((todo) => (
                  <div 
                    key={todo.id} 
                    className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-transparent opacity-60 hover:opacity-100 transition-all"
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="w-6 h-6 rounded-full bg-mul-main border-2 border-mul-main flex items-center justify-center text-white flex-shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="text-slate-400 line-through decoration-slate-300 flex-1">{todo.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
