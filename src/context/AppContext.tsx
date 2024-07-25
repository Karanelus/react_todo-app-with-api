import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Todo } from '../types/Todo';
import { SortType } from '../enums/SortType';
import {
  deleteTodo,
  editTodo,
  editTodoCheck,
  getTodos,
  postTodo,
  USER_ID,
} from '../api/todos';

type AppContextContainerProps = {
  addTodo: (value: string) => void;
  dltTodo: (id: number) => void;
  error: string | null;
  handleClickCloseError: () => void;
  filterType: SortType;
  changeFilterType: (newType: SortType) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  tempTodo: Todo | null;
  todos: Todo[] | null;
  changeTitle: (id: number, value: string) => void;
  deleteCompleted: () => Promise<void>;
  switchTodoCompleted: (
    todo: Todo,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  ) => void;
  toggleAllActive: () => void;
  toggleAllCompleted: () => void;
  switchEdited: (todo: Todo) => void;
  queryText: string;
  handleChangeQueryText: (text: string) => void;
};

type Props = {
  children: ReactNode;
};

const AppContextContainer = createContext({} as AppContextContainerProps);

export const useAppContextContainer = () => {
  const context = useContext(AppContextContainer);

  if (context === undefined) {
    throw new Error(
      'Context must be used within an AppContextContainerProvider',
    );
  }

  return context;
};

export const AppContext = ({ children }: Props) => {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [filterType, setFilterType] = useState<SortType>(SortType.ALL);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [queryText, setQueryText] = useState<string>('');

  const changeFilterType = (newType: SortType) => setFilterType(newType);

  const handleClickCloseError = () => setError(null);

  const handleChangeQueryText = (text: string) => setQueryText(text);

  const addTodo = (value: string) => {
    if (!value.length || !value.trim().length) {
      return setError(`Title should not be empty`);
    }

    if (inputRef.current !== null) {
      inputRef.current.disabled = true;
    }

    setTempTodo({
      id: 0,
      title: value.trim(),
      completed: false,
      userId: USER_ID,
    });

    return postTodo(value.trim())
      .then(data => {
        setTodos(prev => {
          if (prev) {
            return [...prev, data];
          }

          return prev;
        });
        setTempTodo(null);
        setQueryText('');
        if (inputRef.current !== null) {
          inputRef.current.disabled = false;
          inputRef.current.focus();
        }
      })
      .catch(() => {
        setError('Unable to add a todo');
        setTempTodo(null);
        if (inputRef.current !== null) {
          inputRef.current.disabled = false;
          inputRef.current.focus();
        }
      });
  };

  const dltTodo = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(prev => {
        if (prev) {
          return prev.filter(el => el.id !== id);
        }

        return prev;
      });
    } catch {
      return setError(`Unable to delete a todo`);
    }
  };

  const deleteCompleted = async () => {
    const completedTodo = todos?.filter(todo => todo.completed);
    const deletePromises = completedTodo?.map(todo =>
      deleteTodo(todo.id)
        .then(() => ({ status: 'fulfilled', id: todo.id }))
        .catch(errorTodo => ({ status: 'rejected', id: todo.id, errorTodo })),
    );

    if (deletePromises) {
      const results = await Promise.all(deletePromises);

      const successfulDeletions = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.id);

      const failedDeletions = results
        .filter(result => result.status === 'rejected')
        .map(result => result.id);

      if (failedDeletions.length > 0) {
        setError('Unable to delete a todo');
      }

      setTodos(prev => {
        if (prev) {
          return prev?.filter(todo => !successfulDeletions.includes(todo.id));
        }

        return prev;
      });
    }
  };

  const switchTodoCompleted = (
    todo: Todo,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    editTodoCheck(todo.id, !todo.completed)
      .then(() => {
        setTodos(prev => {
          if (prev) {
            return prev.map(el => {
              if (el.id == todo.id) {
                return { ...el, completed: !el.completed };
              }

              return el;
            });
          }

          return prev;
        });
        setLoading(false);
      })
      .catch(() => setError(`Unable to update a todo`));
  };

  const toggleAllCompleted = () => {
    if (todos) {
      todos.map(todo => {
        editTodoCheck(todo.id, true)
          .then(() => {
            setTodos(prev => {
              if (prev) {
                return prev.map(el => ({ ...el, completed: true }));
              }

              return prev;
            });
          })
          .catch(() => setError(`Unable to update a todo`));
      });
    }
  };

  const toggleAllActive = () => {
    if (todos) {
      todos.map(todo => {
        editTodoCheck(todo.id, false)
          .then(() => {
            setTodos(prev => {
              if (prev) {
                return prev.map(el => ({ ...el, completed: false }));
              }

              return prev;
            });
          })
          .catch(() => setError(`Unable to update a todo`));
      });
    }
  };

  const changeTitle = (id: number, value: string) => {
    setTodos(prev => {
      if (prev) {
        return prev.map(el => {
          if (id === el.id) {
            return { ...el, title: value };
          }

          return el;
        });
      }

      return prev;
    });
  };

  const switchEdited = (todo: Todo) => {
    editTodo({ ...todo, title: todo.title.trim() })
      .then(req => {
        setTodos(prev => {
          if (prev) {
            return prev.map(el => {
              if (todo.id === el.id) {
                return req;
              }

              return el;
            });
          }

          return prev;
        });
      })
      .catch(() => setError('XXX'));
  };

  useEffect(() => {
    getTodos()
      .then(data => setTodos(data))
      .catch(() => setError(`Unable to load todos`));
  }, []);

  useEffect(() => {
    if (error !== null) {
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }, [error]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [todos, error]);

  return (
    <AppContextContainer.Provider
      value={{
        addTodo,
        dltTodo,
        error,
        handleClickCloseError,
        switchEdited,
        filterType,
        changeFilterType,
        inputRef,
        todos,
        changeTitle,
        deleteCompleted,
        switchTodoCompleted,
        toggleAllActive,
        toggleAllCompleted,
        tempTodo,
        queryText,
        handleChangeQueryText,
      }}
    >
      {children}
    </AppContextContainer.Provider>
  );
};
