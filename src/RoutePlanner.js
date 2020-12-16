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
            trainMapLoaded: false
        };
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

    render() {
        const { trainMapLoaded, trainMap } = this.state;
        if (!trainMapLoaded) {
            return <div>Loading...</div>;
        } else {
            let p = this.getRoute("Arklow", 1, "Maynooth", 1, []);
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
        }
    }
}

