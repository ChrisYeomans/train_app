/*jshint esversion: 8 */

const React = require('react');
const fetch = require("node-fetch");
const parseString = require('xml2js').parseString;

export class StationInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stationName: props.stationName,
            stationCode: "",
            stationInfo: {},
            isLoaded: false
        };
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
                stationCode: keyMap[this.state.stationName][0]
            });
        }.bind(this)));
        await fetch(
            `http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML?StationCode=${this.state.stationCode}`
            )
            .then(response => response.text())
            .then(str => parseString(str, function (err, result) {
                try {
                    this.setState({
                        stationInfo: JSON.stringify(result.ArrayOfObjStationData.objStationData),
                        isLoaded: true
                    });
                } catch (error) {
                    console.log(error.message);
                }
        }.bind(this)));
        console.log(this.state);
    }
    render() {
        const { isLoaded, stationInfo } = this.state;
        if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div class="table-responsive-md">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr class="text-center">
                                <th scope="col">Server Time</th>
                                <th scope="col">Train Code</th>
                                <th scope="col">Station Name</th>
                                <th scope="col">Station Code</th>
                                <th scope="col">Query Time</th>
                                <th scope="col">Train Date</th>
                                <th scope="col">Origin</th>
                                <th scope="col">Destination</th>
                                <th scope="col">Origin Time</th>
                                <th scope="col">Destination Time</th>
                                <th scope="col">Status</th>
                                <th scope="col">Last Location</th>
                                <th scope="col">Due In</th>
                                <th scope="col">Late</th>
                                <th scope="col">Expected Arrival</th>
                                <th scope="col">Expected Departure</th>
                                <th scope="col">Scheduled Arrival</th>
                                <th scope="col">Scheduled Departure</th>
                                <th scope="col">Direction</th>
                                <th scope="col">Train Type</th>
                                <th scope="col">Location Type</th>
                            </tr>
                        </thead>

                        <tbody>
                                {JSON.parse(stationInfo).map((train) => (
                                    <tr class="text-center">
                                        <td>{ train.Servertime }</td>
                                        <td>{ train.Traincode }</td>
                                        <td>{ train.Stationfullname }</td>
                                        <td>{ train.Stationcode }</td>
                                        <td>{ train.Querytime }</td>
                                        <td>{ train.Traindate }</td>
                                        <td>{ train.Origin }</td>
                                        <td>{ train.Destination }</td>
                                        <td>{ train.Origintime }</td>
                                        <td>{ train.Destinationtime }</td>
                                        <td>{ train.Status }</td>
                                        <td>{ train.Lastlocation}</td>
                                        <td>{ train.Duein }</td>
                                        <td>{ train.Late }</td>
                                        <td>{ train.Exparrival }</td>
                                        <td>{ train.Expdepart }</td>
                                        <td>{ train.Scharrival }</td>
                                        <td>{ train.Schdepart }</td>
                                        <td>{ train.Direction }</td>
                                        <td>{ train.Traintype }</td>
                                        <td>{ train.Locationtype }</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    }
}

