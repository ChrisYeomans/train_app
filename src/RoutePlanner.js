const React = require('react');
const fetch = require("node-fetch");
const parseString = require('xml2js').parseString;

export class RoutePlanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTrains: {},
            hasCurrentTrains: false,
            trainMap: new Map(),
            trainMapLoaded: false,
            choiceMade: false,
            stationList: [],
            fullList: [],
            isLoaded: false,
            s1: null,
            s2: null
        };

        this.handleChangeS1 = this.handleChangeS1.bind(this);
        this.handleChangeS2 = this.handleChangeS2.bind(this);
        this.selectStations = this.selectStations.bind(this);
    }
    async componentDidMount() {
        await fetch(
            `http://api.irishrail.ie/realtime/realtime.asmx/getCurrentTrainsXML`
            )
            .then(response => response.text())
            .then(str => parseString(str, function (err, result) {
                try {
                    this.setState({
                        currentTrains: JSON.stringify(result.ArrayOfObjTrainPositions.objTrainPositions),
                        hasCurrentTrains: true
                    });
                } catch (error) {
                    console.log(error.message);
                }
        }.bind(this)));
        let a = new Map()
        await JSON.parse(this.state.currentTrains).map((train) => (
            fetch(
                `http://api.irishrail.ie/realtime/realtime.asmx/getTrainMovementsXML?TrainId=${train.TrainCode[0]}&TrainDate=`
                )
                .then(response => response.text())
                .then(str => parseString(str, function (err, result) {
                    try {
                        a.set(train.TrainCode[0], result.ArrayOfObjTrainMovements.objTrainMovements);
                    } catch (error) {
                        console.log(error.message);
                    }
                }))
                .then(() => {
                    if (a.size <= JSON.parse(this.state.currentTrains).length-1) {
                        this.setState({
                            trainMap: a,
                            trainMapLoaded: true
                        });
                    }
                })
        ));
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

    getStationList(v) {
        let out = [];
        v.forEach((val, k) => {
            out.push(val.LocationFullName[0]);
        });
        return out;
    }


    // DFS like algorithm to find route
    getRoute(s1, t1, s2, t2, out) {
        if (s1 === s2) {
            return null;
        }
        let m = new Map(this.state.trainMap);
        for(let [code, train] of m) {
            let a = this.getStationList(train);
            if (a.includes(s1) && a.includes(s2)) {
                out.push(code);
                return out;
            }
        };

        for(let [code, train] of m) {
            let a = this.getStationList(train);
            if ((a.includes("Dublin Connolly") || a.includes("Dublin Heuston")) && a.includes(s1)) {
                for(let [code1, train1] of m) {
                    let a1 = this.getStationList(train1);
                    if (a1.includes(s2) && a1.includes("Dublin Connolly")) {
                        out.push(code1);
                        out.push(code);
                        return out;
                    } else if (a1.includes(s2) && a1.includes("Dublin Heuston")) {
                        out.push(code1);
                        out.push(code);
                        return out;
                    }
                };
            }
        };
        return null;
    }

    selectStations(e) {
        console.log("RUNNING");
        this.setState({
            choiceMade: true
        })
    }

    handleChangeS1(e){
        this.setState({s1:e.target.value});
    }
    handleChangeS2(e){
        this.setState({s2:e.target.value});
    }
      

    render() {
        const { trainMapLoaded, choiceMade, isLoaded, stationList, s1, s2 } = this.state;
        if (!trainMapLoaded) {
            return <div>Loading...</div>;
        } else if (choiceMade) {
            let p = this.getRoute(s1, 1, s2, 1, []);
            if (p != null) {
                return (
                    <div class="table-responsive-md">
                        <p>Take the following trains:</p>
                        {p.map((t) => (
                            <p>{ t }</p>
                        ))}
                    </div>
                );
            } else {
                return <div>Loading...</div>; 
            }
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
            <div>
                <label for="stations">Choose a station:</label>
                <select name="stations" id="s1" value={this.state.s1} onChange={this.handleChangeS1} >
                    { stationList.map((s) => (
                        <option value={ s }>{ s }</option>
                    )) }
                </select>
                <br /><br />
                <select name="stations" id="s2" value={this.state.s2} onChange={this.handleChangeS2}>
                    { stationList.map((s) => (
                        <option>{ s }</option>
                    )) }
                </select>
                <button onClick={(s) => this.selectStations(s)} class="button1">Submit</button>
            </div>
            );
        }
    }
}

