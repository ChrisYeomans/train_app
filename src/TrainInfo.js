const React = require('react');
const fetch = require("node-fetch");
const parseString = require('xml2js').parseString;

export class TrainInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            trainCode: props.trainCode,
            trainInfo: {},
            isLoaded: false
        };
    }
    async componentDidMount() {
        await fetch(
            `http://api.irishrail.ie/realtime/realtime.asmx/getTrainMovementsXML?TrainId=${this.state.trainCode}&TrainDate=`
            )
            .then(response => response.text())
            .then(str => parseString(str, function (err, result) {
                try {
                    this.setState({
                        trainInfo: JSON.stringify(result.ArrayOfObjTrainMovements.objTrainMovements),
                        isLoaded: true
                    });
                } catch (error) {
                    console.log(error.message);
                }
        }.bind(this)));
    }
    render() {
        const { isLoaded, trainInfo } = this.state;
        if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div class="table-responsive-md">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr class="text-center">
                                <th scope="col">TrainCode</th>
                                <th scope="col">TrainDate</th>
                                <th scope="col">LocationCode</th>
                                <th scope="col">LocationOrder</th>
                                <th scope="col">LocationType</th>
                                <th scope="col">TrainOrigin</th>
                                <th scope="col">TrainDestination</th>
                                <th scope="col">ScheduledArrival</th>
                                <th scope="col">ExpectedArrival</th>
                                <th scope="col">ExpectedDeparture</th>
                                <th scope="col">Arrival</th>
                                <th scope="col">Departure</th>
                                <th scope="col">LocationFullName</th>
                                <th scope="col">StopType</th>
                            </tr>
                        </thead>

                        <tbody>
                                {JSON.parse(trainInfo).map((stop) => (
                                    <tr class="text-center">
                                        <td>{ stop.TrainCode }</td>
                                        <td>{ stop.TrainDate }</td>
                                        <td>{ stop.LocationCode }</td>
                                        <td>{ stop.LocationOrder }</td>
                                        <td>{ stop.LocationType }</td>
                                        <td>{ stop.TrainOrigin }</td>
                                        <td>{ stop.TrainDestination }</td>
                                        <td>{ stop.ScheduledArrival }</td>
                                        <td>{ stop.ExpectedArrival }</td>
                                        <td>{ stop.ExpectedDeparture }</td>
                                        <td>{ stop.Arrival }</td>
                                        <td>{ stop.Departure }</td>
                                        <td>{ stop.LocationFullName }</td>
                                        <td>{ stop.StopType }</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    }
}

