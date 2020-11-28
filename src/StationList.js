/*jshint esversion: 8 */

import { StationInfo } from './StationInfo.js';
const React = require('react');
const fetch = require("node-fetch");
const parseString = require('xml2js').parseString;

export class StationList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stationList: null,
            fullList: null,
            isLoaded: false,
            selectedStation: null
        };
        this.filterList = this.filterList.bind(this);
        this.selectStation = this.selectStation.bind(this);
    }
    async componentDidMount() {
        await fetch("http://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML")
        .then(response => response.text())
        .then(str => parseString(str, function(err, result) {
            let objMap = result.ArrayOfObjStation.objStation;
            let keyMap = new Map();
            objMap.forEach(s => {
                keyMap[s.StationDesc] = s.StationCode;
            });
            this.setState({
                stationList: Object.keys(keyMap),
                fullList: Object.keys(keyMap),
                isLoaded: true
            });
        }.bind(this)));
    }

    selectStation(s) {
        this.setState({
            selectedStation: s.nativeEvent.srcElement.outerText
        });
    }

    filterList() {
        let e = this.refs.inp.value;
        this.setState({
            stationList: this.state.fullList.filter(function(a) {
                return a.toUpperCase().includes(e.toUpperCase());
            })
        });
    }

    render() {
        const { isLoaded, stationList, selectedStation } = this.state;
        if (!isLoaded) {
            return <div>Loading...</div>;
        } else if (selectedStation != null) {
            return <StationInfo stationName={ selectedStation } />;
        } else {
            return (
                <div>
                    <input id='input' onKeyUp={ this.filterList } ref='inp'></input>
                    <ul>
                    { stationList.map((s) => (
                        <li>
                            <button onClick={ s => this.selectStation(s) }>{ s }</button>
                        </li>

                    )) }
                    </ul>
                </div>
            );
        }
    }
}

