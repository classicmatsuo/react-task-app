import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import styled from 'styled-components';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
// import './index.css';
// import App from './App';
// import * as serviceWorker from './serviceWorker';
import initialData from './initial-data';
import Column from './column';

const Container = styled.div`
  display: flex;
`;

class InnerList extends React.PureComponent {
  render(){
    const {column, taskMap, index} = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId]);
    return <Column column={column} tasks={tasks} index={index} />
  }
}

class App extends React.Component {
  state = initialData;

  // onDragStart = () => {
  //   document.body.style.color = 'orange';
  // }

  onDragStart = (start, provided) => {
    // const homeIndex = this.state.columnOrder.indexOf(start.source.droppableId);
    // this.setState({
    //   homeIndex,
    // });
    provided.announce(
      `You have lifted the task in position ${start.source.index +1}`,
    )
  };

  onDragUpdate = (update, provided) => {
    // const {destination} = update;
    // const opacity = destination
    // ? destination.index / Object.keys(this.state.tasks).length
    // : 0;
    // document.body.style.backgroundColor = `rgba(153, 141, 217, ${opacity})`;
    const message = update.destination
      ? `You have moved the task to position ${update.destination.index + 1}`
      : `You are currently not over a droppable area`;
      provided.announce(message);
  }


  onDragEnd = (result, provided) => {
    const message = result.destination
      ? `You have moved the task to position ${result.destination.index + 1}`
      : `The task has been returned to its starting position of ${result.source.index + 1}`;
      provided.announce(message);

    // this.setState({
    //   homeIndex: null,
    // });
    // document.body.style.color = 'inherit';
    // document.body.style.backgroundColor = 'inherit';

    // TODO: reorder our column
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if(type === 'column'){
      const newColumnOrder = Array.from(this.state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        columnOrder: newColumnOrder,
      };
      this.setState(newState);
      return;
    }
    
    const start = this.state.columns[source.droppableId];
    const finish = this.state.columns[destination.droppableId];

    if(start === finish){
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
  
      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };
  
      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn,
        }
      };
  
      this.setState(newState);
      return;
    }

    // Moving frm one list to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      }
    };
    this.setState(newState);
  };


  render(){
    return (
      <DragDropContext 
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
        >
        <Droppable 
          droppableId="all-columns" 
          direction="horizontal" 
          type="column"
        >
          {provided => (
          <Container
            {...provided.droppableId}
            ref={provided.innerRef}
          >
            {this.state.columnOrder.map((columnId, index) => {
            const column = this.state.columns[columnId];
            // const tasks =  column.taskIds.map(taskId => this.state.tasks[taskId]);

            // const isDropDisabled = index < this.state.homeIndex;

            // return column.title;
            return (
              <InnerList
                key={column.id} 
                column={column} 
                // tasks={tasks} 
                taskMap={this.state.tasks} 
                // isDropDisabled={isDropDisabled} 
                index={index}
              />
            )
            })}
            {provided.placeholder}
          </Container>
          )}
        </Droppable>
      </DragDropContext>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
