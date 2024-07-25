import classNames from 'classnames';
import { Todo } from '../../types/Todo';
import { useAppContextContainer } from '../../context/AppContext';
import { useState } from 'react';

/* eslint-disable jsx-a11y/label-has-associated-control */
type Props = {
  todo: Todo;
};

const TodoListInfo = ({ todo }: Props) => {
  const { dltTodo, switchTodoCompleted, inputRef, changeTitle, switchEdited } =
    useAppContextContainer();
  const { completed, title, id } = todo;
  const [loadingTodoId, setLoadingTodoId] = useState<boolean>(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [pastTitle, setPastTitle] = useState<string>('');

  console.log(isEdited);

  const handleDoubleclickEdited = () => {
    setIsEdited(true);
  };

  const handleClickDeleteTodo = (todoId: number) => {
    setLoadingTodoId(true);
    dltTodo(todoId);
  };

  const handleClickSwitch = (change: Todo) => {
    setLoadingTodoId(true);
    switchTodoCompleted(change, setLoadingTodoId);
  };

  const handleBlurSwitch = () => {
    if (!title.length) {
      inputRef.current?.focus();

      return dltTodo(id);
    }

    setIsEdited(false);
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    changeTitle(id, value);
  };

  const handleSubmitNewTitle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.length) {
      return dltTodo(id);
    }

    return switchEdited(todo);
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: completed })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          onClick={() => handleClickSwitch(todo)}
          defaultChecked={completed}
        />
      </label>

      {isEdited ? (
        <form onSubmit={handleSubmitNewTitle}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={title}
            onChange={handleChangeTitle}
            onBlur={handleBlurSwitch}
            autoFocus
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onClick={handleDoubleclickEdited}
          >
            {title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => handleClickDeleteTodo(id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal', 'overlay', {
          'is-active': loadingTodoId,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};

export default TodoListInfo;

// {/* This todo is being edited */}
// <div data-cy="Todo" className="todo">
//   <label className="todo__status-label">
//     <input
//       data-cy="TodoStatus"
//       type="checkbox"
//       className="todo__status"
//     />
//   </label>

//   {/* This form is shown instead of the title and remove button */}
//   <form>
//     <input
//       data-cy="TodoTitleField"
//       type="text"
//       className="todo__title-field"
//       placeholder="Empty todo will be deleted"
//       value="Todo is being edited now"
//     />
//   </form>

//   <div data-cy="TodoLoader" className="modal overlay">
//     <div className="modal-background has-background-white-ter" />
//     <div className="loader" />
//   </div>
// </div>
