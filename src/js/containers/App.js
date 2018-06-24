import React, { Component } from 'react';
import {
  compose,
  withProps,
  withStateHandlers,
  lifecycle
} from 'recompose';
import {
  DragDropContext,
  Draggable,
  Droppable
} from 'react-beautiful-dnd';
import createHistory from 'history/createBrowserHistory';
import Map from './Map';
const { StandaloneSearchBox } = require("react-google-maps/lib/components/places/StandaloneSearchBox");

const reorder=(list, startIndex, endIndex) => {
  const result=Array.from(list);
  const [removed]=result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const history=createHistory();

class App extends Component {
  constructor(props) {
		super(props);

    this.state={
      defaultAddress: '',
      editRouteValue: '',
      routes: []
    };

    this.onHandleSubmit=() => {
      let newRouteItem=this.searchBoxInput.getPlaces();

      if (newRouteItem[0].name) {
        const isExistRoute=this.state.routes && this.state.routes.some((item, index) => {
          return item.id == newRouteItem[0].place_id;
        });

        if (!isExistRoute) {
          const addRouteItem={
            id: newRouteItem[0].place_id,
            text: newRouteItem[0].name,
            lat: newRouteItem[0].geometry.location.lat(),
            lng: newRouteItem[0].geometry.location.lng()
          };

          this.setState({
            routes: [...this.state.routes, addRouteItem]
          });

          this.editRouteInput.value='';
        }
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
    };

    this.getCurrentUrl=(currentLocation) => {
      return (currentLocation.substr(0, currentLocation.indexOf('lat')) == '') ? currentLocation : currentLocation.substr(0, currentLocation.indexOf('lat'))
    };

    this.onMapIdle=(googleMapComponent) => {
      const currentUrl=this.getCurrentUrl(history.location.pathname);

      history.push(`${currentUrl}`,  {
        latSouthWest: googleMapComponent.getBounds().getSouthWest().lat(),
        lngSouthWest: googleMapComponent.getBounds().getSouthWest().lng(),
        latNorthEast: googleMapComponent.getBounds().getNorthEast().lat(),
        lngNorthEast: googleMapComponent.getBounds().getNorthEast().lng(),
        latCenter: googleMapComponent.getCenter().lat(),
        lngCenter: googleMapComponent.getCenter().lng()
      });
    };
  }

  render() {
    const SearchBox=compose(
      withStateHandlers(() => ({
        bounds: null
      })),
      lifecycle({
        componentDidMount() {
          this.unlisten=history.listen((location, action) => {
            let bounds=new google.maps.LatLngBounds(
              new google.maps.LatLng(location.state.latSouthWest, location.state.lngSouthWest),
              new google.maps.LatLng(location.state.latNorthEast, location.state.lngNorthEast)
            );

            this.setState({
              bounds
            });
          });
        },

        componentWillUnmount() {
          this.unlisten();
        }
      }),
    )(props =>
      <div className="form-group">
        <StandaloneSearchBox
          ref={value => { this.searchBoxInput=value }}
          bounds={props.bounds}
          onPlacesChanged={this.onHandleSubmit}>
          <input
            type="text"
            ref={value => { this.editRouteInput=value }}
            className="form-control"
            placeholder="Enter a route point" />
        </StandaloneSearchBox>
      </div>
    );

    return (
      <div>
        <div className="wrapper">
          <div className="box header">
            <img src={require('../../../assets/images/route.png')} width="40" height="40" />
            <p>edit route</p>
          </div>
          <div className="box">
            <div className="form-group">
              <SearchBox />
            </div>
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
            <Map routes={this.state.routes} onMapIdle={(googleMapComponent) => { this.onMapIdle(googleMapComponent) }} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
