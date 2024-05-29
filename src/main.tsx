import React, { useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { BsX, BsPencilSquare } from "react-icons/bs";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

const TodoItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 400px;
  border: 1px solid grey;
  margin-bottom: 5px;
  background-color: lightblue;
  padding: .5rem .5rem;
`;
const TodoContent = styled.div``;

const TodoButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0 5px;
  cursor: pointer;
`;

const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const InputContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const TodoInput = styled.input`
  padding:10px 10px;
  width: 100%;
`;

const AddTodoButton = styled.button`
  padding:10px 12px;
  margin:0 0 0 .2rem;
  width: 200px;
  background-color: lightgreen;
  border: none;
  cursor: pointer;
`;

interface Todo {
  id: string;
  content: string;
}

interface TodoListProps {
  todos: Todo[];
  onDeleteTodo: (id: string) => void;
  onEditTodo: (id: string, newContent: string) => void;
}

const Todo = ({ todo, index, onDelete, onEdit }: { todo: Todo; index: number; onDelete: (id: string) => void; onEdit: (id: string, newContent: string) => void; }) => {
  const [showModal, setShowModal] = useState(false);
  const [editedContent, setEditedContent] = useState(todo.content);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleSaveChanges = () => {
    onEdit(todo.id, editedContent);
    handleCloseModal();
  };

  return (
    <>
      <Draggable draggableId={todo.id} index={index}>
        {(provided) => (
          <TodoItemContainer ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <TodoContent>{todo.content}</TodoContent>
            <div>
              <TodoButton onClick={handleShowModal}>
                <BsPencilSquare size={24} color="black" />
              </TodoButton>
              <TodoButton onClick={() => onDelete(todo.id)}>
                <BsX size={28} color="black" />
              </TodoButton>
            </div>
          </TodoItemContainer>
        )}
      </Draggable>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Todo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TodoInput
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const TodoList = React.memo(({ todos, onDeleteTodo, onEditTodo }: TodoListProps) => (
  <>
    {todos.map((todo, index) => (
      <Todo key={todo.id} todo={todo} index={index} onDelete={onDeleteTodo} onEdit={onEditTodo} />
    ))}
  </>
));

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  function handleAddTodo() {
    if (inputValue.trim() !== "") {
      const newTodo: Todo = {
        id: `todo-${Date.now()}`,
        content: inputValue.trim()
      };

      setTodos((prevTodos) => [...prevTodos, newTodo]);
      setInputValue("");
    }
  }

  function handleDeleteTodo(id: string) {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }

  function handleEditTodo(id: string, newContent: string) {
    setTodos((prevTodos) =>
      prevTodos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, content: newContent };
        }
        return todo;
      })
    );
  }

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const reorderedTodos = Array.from(todos);
    const [removed] = reorderedTodos.splice(result.source.index, 1);
    reorderedTodos.splice(result.destination.index, 0, removed);

    setTodos(reorderedTodos);
  }

  return (
    <CenteredContainer>
      <div>
        <h1 className="text-center mb-3">Draggable Todo List</h1>
        <InputContainer>
          <TodoInput
            type="text"
            placeholder="Enter a new todo..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                handleAddTodo();
              }
            }}
          />
          <AddTodoButton onClick={handleAddTodo}>Add Todo</AddTodoButton>
        </InputContainer>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="todo-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <TodoList todos={todos} onDeleteTodo={handleDeleteTodo} onEditTodo={handleEditTodo} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </CenteredContainer>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<TodoApp />, rootElement);
