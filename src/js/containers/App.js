import React, { Component } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable
} from 'react-beautiful-dnd';
import Map from './Map';

const reorder=(list, startIndex, endIndex) => {
  const result=Array.from(list);
  const [removed]=result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

class App extends Component {
  constructor(props) {
		super(props);

    this.state={
      defaultAddress: '',
      editRouteValue: '',
      routes: []
    };

    this.onHandleSubmit=(e) => {
      e.preventDefault();

      let newRouteItem=this.editRouteInput.value;

      if (newRouteItem) {
        const geocoder=new google.maps.Geocoder();

        geocoder.geocode({
          'address': newRouteItem
        }, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                  const isExistRoute=this.state.routes && this.state.routes.some((item, index) => {
                    return item.id == results[0].place_id;
                  });

                  if (!isExistRoute) {
                    const addRouteItem={
                      id: results[0].place_id,
                      text: newRouteItem,
                      lat: results[0].geometry.location.lat(),
                      lng: results[0].geometry.location.lng()
                    };

                    this.setState({
                      routes: [...this.state.routes, addRouteItem]
                    });

                    this.editRouteInput.value='';
                  } else {
                    alert('This point of the route already exists!');
                  }
              } else {
                alert('No results found');
              }
            } else {
              const errorGeo=`Geocode was not successful for the following reason: ${status}`;
              alert(errorGeo);
            }
        });
      }
    };

    this.onDragEnd=(result) => {
      if(!result.destination) {
         return;
      }

      const changedOrderRoutes=reorder(
        this.state.routes,
        result.source.index,
        result.destination.index
      );

      this.setState({
        routes: changedOrderRoutes
      });
    };

    this.onHandleDeleteRoutes=(id) => {
      this.setState({
        routes: this.state.routes.filter(item => item.id !== id)
      });
    }
  }

  componentDidMount() {
    new google.maps.places.Autocomplete(this.editRouteInput);
  }

  render() {
    return (
      <div>
        <div className="wrapper">
          <div className="box header">
            <img src={require('../../../assets/images/route.png')} width="40" height="40" />
            <p>edit route</p>
          </div>
          <div className="box">
            <form id="directions-form" onSubmit={this.onHandleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  ref={value => { this.editRouteInput=value }}
                  className="form-control"
                  placeholder="Enter a route point" />
              </div>
            </form>
            <DragDropContext onDragEnd={this.onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className="todos-list"
                    {...provided.droppableProps}>
                    {this.state.routes.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}>
                        {(provided, snapshot) => (
                          <div className="todo-grid">
                            <div
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              className="todo-item">
                              {item.text}
                              <div className="todo-item-delete-button" onClick={() => this.onHandleDeleteRoutes(item.id)}>×</div>
                            </div>
                            {provided.placeholder}
                          </div>
                         )}
                      </Draggable>
                     ))}
                    {provided.placeholder}
                  </div>
                 )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className="box content">
            <Map routes={this.state.routes} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
