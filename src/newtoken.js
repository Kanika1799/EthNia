import React from "react";
import { Collapse,Container,Row, FormInput, Button,Col, Card,CardHeader,CardTitle,CardBody,FormTextarea,Badge } from "shards-react";
import Travel from "./contracts/Travel.json";
import getContractInstance from './utils.js';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
var ipfsClient = require('ipfs-http-client');

type State = {
  hasLocation: boolean,
  latlng: {
    lat: number,
    lng: number,
  },
}

export default class CreateToken extends React.Component<{}, State> {

  captureFile (event) {
    event.stopPropagation()
    event.preventDefault()
    this.setState({added_file_hash: event.target.files});
  }

  runExample = async () => {
    var ipfs = ipfsClient('ipfs.infura.io', '5001', { protocol: 'https' });
    let ipfsId;
    ipfs.add([...this.state.added_file_hash], { progress: (prog) => console.log(`received: ${prog}`) })
      .then((response) => {
        console.log(response);
        ipfsId = response[0].hash;
        console.log(ipfsId);
        ( async () => {
            const { accounts, contract } = this.state;
            let content = JSON.stringify(
              {
                "description": "This is a Travel Token.",
                "image": "https://ipfs.io/ipfs/" + ipfsId,
                "name": this.state.name,
              }
            );
            await contract.methods.mint_token(content).send({ from: accounts[0] });
        })();
        this.setState({});
      }).catch((err) => {
        console.error(err);
      });
    //this.setState({subject:'',details:'',name:''}, this.getApplications);
  };

  componentDidMount = async () => {
    const obj = await getContractInstance();
    this.setState({ web3:obj.web3, accounts:obj.accounts, contract: obj.contract});
  };
  
  mapRef = React.createRef();
  constructor(props){
    super(props);
    this.state = {
      name: '',
      details: '',
      web3: null,
      accounts: null,
      contract: null,
      hasLocation: false,
      latlng: {
      lat: 51.505,
      lng: -0.09,
    },
      added_file_hash: null
    };

    this.handleInput = this.handleInput.bind(this);
    this.runExample = this.runExample.bind(this);
    this.captureFile = this.captureFile.bind(this);
  }

  handleClick = () => {
    const map = this.mapRef.current
    if (map != null) {
      map.leafletElement.locate()
    }
  }

  handleLocationFound = (e: Object) => {
    this.setState({
      hasLocation: true,
      latlng: e.latlng,
    })
  }

  handleInput(event) {
    const target = event.target;
    if (target.name == "name"){
      this.setState(Object.assign({}, this.state, {name: target.value}));
    }
    else if (target.name == "details") {
      this.setState(Object.assign({}, this.state, {details: target.value}));
    }
    else {
      this.setState(Object.assign({}, this.state, {name: target.value}));
    }
  }
  render(){
    const marker = this.state.hasLocation ? (
      <Marker position={this.state.latlng}>
        <Popup>You are here</Popup>
      </Marker>
    ) : null
    return(
        
              <div>
               
                    <Map
                center={this.state.latlng}
                length={4}
                onClick={this.handleClick}
                onLocationfound={this.handleLocationFound}
                ref={this.mapRef}
                zoom={13}>
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {marker}
                  </Map>
                   
              </div>
           
    );
  }
}
