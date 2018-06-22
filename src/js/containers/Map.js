import React, { Component } from 'react';
import {
  compose,
  withProps,
  withStateHandlers
} from 'recompose';
import {
  withGoogleMap,
  GoogleMap,
  Marker,
  Polygon,
  Polyline,
  InfoWindow
} from 'react-google-maps';

class Map extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.routes != prevState.routes) {
      return {
        routes: nextProps.routes
      };
    }
    return null;
  }

  constructor(props) {
		super(props);

    this.state={
      defaultCoordinates: {
        lat: 55.755826,
        lng: 37.617299900000035
      },
      defaultAddress: 'Москва',
      routes: [],
      routesPolygonCoordinates: []
    };
  }

  componentDidMount() {
  	if (window.navigator.geolocation) {
  		window.navigator.geolocation.getCurrentPosition((position: Object) => {
  			const { latitude: lat, longitude: lon }=position.coords;
  			const geocoder=new google.maps.Geocoder();

  			geocoder.geocode({
          'location': {
             lat,
             lng: lon
           }
        }, (results, status) => {
          if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
            this.setState({
              defaultCoordinates: {
                lat,
                lng: lon
              },
              defaultAddress: results[1].address_components[0].long_name
            });
          } else {
            const error=`Geocoder failed due to: ${status}`;
            alert(error);
          }
  			});
  		}, (error: string) => {
        const errorGeo=`Geocode was not successful for the following reason: ${status}`;
        alert(errorGeo);
  		});
  	} else {
  		const error='Your browser does not support geolocation.';
      alert(error);
  	}
  }

  render() {
    const labels='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let labelIndex=0;

    const MapComponent=compose(
      withStateHandlers(() => ({
        isOpen: false,
        openInfoMarkerId: '',
        defaultCoordinates: this.state.defaultCoordinates,
        routes: this.state.routes
      }), {
        onToggleOpen: ({ isOpen }) => () => ({
          isOpen: !isOpen
        }),
        onClickOpenInfoMarked: ({ isOpen, openInfoMarkerId }) => (index) => ({
          isOpen: !isOpen,
          openInfoMarkerId: index
        }),

        onHandleDragMarker: ({ routes }) => (result, item) => {
          let newRoutes=routes.map((route, index) => {
            if (route.id == item.id) {
              return {
                ...route,
                lat: result.latLng.lat(),
                lng: result.latLng.lng()
              }
            }
            return route;
          });

          return {
            routes: newRoutes
          }
        }
      }),
      withGoogleMap)(props => (
      <GoogleMap
        ref={value => { this.googleMapComponent=value }}
        defaultZoom={11}
        defaultCenter={{ lat: props.defaultCoordinates.lat, lng: props.defaultCoordinates.lng }}
        center={{lat: (props.routes.length && props.routes[props.routes.length - 1].lat) || props.defaultCoordinates.lat, lng: (props.routes.length && props.routes[props.routes.length - 1].lng) || props.defaultCoordinates.lng}}>
        {
          !props.routes.length ? (
            <Marker
              defaultDraggable={true}
              position={{lat: props.defaultCoordinates.lat, lng: props.defaultCoordinates.lng}}
              onClick={props.onToggleOpen}>
              {
                props.isOpen && (
                  <InfoWindow onCloseClick={props.onToggleOpen}>
                    <div>
                      <span style={{
                        fontSize: '16px',
                        color: '#444'
                      }}>{this.state.defaultAddress}</span>
                    </div>
                  </InfoWindow>
                )
              }
            </Marker>
          ) : (
            props.routes.map((item, index) => (
              <Marker
                key={item.id}
                defaultDraggable={true}
                onMouseOut={(result) => { props.onHandleDragMarker(result, item) }}
                defaultLabel={labels[labelIndex++ % labels.length]}
                position={{lat: item.lat, lng: item.lng}}
                onClick={() => { props.onClickOpenInfoMarked(index)}}>
                {
                  props.isOpen && (index == props.openInfoMarkerId) && (
                    <InfoWindow onCloseClick={props.onToggleOpen}>
                      <div>
                        <span style={{
                          fontSize: '16px',
                          color: '#444'
                        }}>{item.text}</span>
                      </div>
                    </InfoWindow>
                  )
                }
              </Marker>
            ))
          )
        }
        <Polyline path={props.routes} options={{
          strokeColor: '#6ab3e7',
          strokeOpacity: 1.0,
          strokeWeight: 4
        }} />
      </GoogleMap>
    ));

    return (
      <div>
        <MapComponent
          routes={this.state.routes}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `400px` }} />}
          mapElement={<div style={{ height: `100%` }} />} />
      </div>
    );
  }
}

export default Map;
