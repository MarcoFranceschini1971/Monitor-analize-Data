import React, { useState, useEffect } from "react"
import Chart, { GlobalDatesAndUnits } from './Chart.js';
import { GetClientData, GetFirstDate, GetLastDate } from "./Firebase"
import { Container, Grid, Typography, ToggleButton, ToggleButtonGroup, List, ListItem, ListItemText } from '@mui/material';

const Dashboard = ({ clientId }) => {
    const [clientName, setClientName] = useState("")
    const [units, setUnits] = useState({})
    const [metrics, setMetrics] = useState({})
    const [mode, setMode] = useState(1);
    const [firstDate, setFirstDate] = useState(0)
    const [lastDate, setLastDate] = useState(0);
    const [globalUnitIds, setGlobalUnitIds] = useState([])
    const [globalAvailableUnitIds, setGlobalAvailableUnitIds] = useState([])
    const [graphHeight, setGraphHeight] = useState(100)

    const handleModeChange = (event, newMode) => {
        if (newMode !== null) {
            setMode(newMode);
        }
    };

    const handleFirstLastDateChange = (first, last) => {
        setFirstDate(first)
        setLastDate(last)
    }

    const handleGlobalUnitAdded = (updatedUnitIds) => {
        setGlobalUnitIds([...globalUnitIds, updatedUnitIds])
        setGlobalAvailableUnitIds(globalAvailableUnitIds.filter(i => i !== updatedUnitIds))
        console.log("globalAvailableUnitIds", globalAvailableUnitIds, globalAvailableUnitIds.map(i => { if (String(i) !== updatedUnitIds) return i }))
    }

    const handleGlobalUnitRemoved = (updatedUnitIds, i) => {
        setGlobalUnitIds(globalUnitIds.filter((v) => v !== updatedUnitIds))
        setGlobalAvailableUnitIds([...globalAvailableUnitIds, updatedUnitIds])
    }

    useEffect(() => {
        GetClientData(clientId, snapshot => {
            setClientName(snapshot.val().clientName)
            setMetrics(snapshot.val().metrics)
            setUnits(snapshot.val().unitNames)
        });
    }, [])

    useEffect(() => {
        if (Object.keys(metrics).length !== 0) {
            if (mode === 1 && !firstDate && !lastDate) {
                GetFirstDate(clientId, metrics[Object.keys(metrics)[0]].units[0], "data", Object.keys(metrics)[0], setFirstDate)
                GetLastDate(clientId, metrics[Object.keys(metrics)[0]].units[0], "data", Object.keys(metrics)[0], setLastDate)
            }
            if (!globalUnitIds.length) {
                let _units = metrics[Object.keys(metrics)[0]].units
                setGlobalUnitIds([_units[0]])
                setGlobalAvailableUnitIds(_units.slice(1))
            }
        }
    }, [mode, metrics])

    return <Container maxWidth="lg" sx={{ marginTop: '2rem' }}>
        <h1>Dashboard</h1>
        {clientName ? <div><Grid container spacing={3} alignItems="start" justifyContent={"space-around"}>
            <Grid item>
                <Typography variant="h6" gutterBottom>Informazioni Cliente</Typography>
                <Typography variant="subtitle1" gutterBottom>Name: {clientName}</Typography>
                <Typography variant="subtitle1" gutterBottom>ID: {clientId}</Typography>
            </Grid>
            <Grid item>
            <Typography variant="subtitle1" gutterBottom>Unità:</Typography>
                <Grid container spacing={2} alignItems="start" justifyContent={"space-around"}>
                    <List>
                        {Object.keys(units).map(unitId =>
                            <Grid key={unitId} container>
                                <Grid item>
                                    <ListItem>
                                        <ListItemText primary={`Id: ${unitId}`} />
                                    </ListItem>
                                </Grid>
                                <Grid item>
                                    <ListItem>
                                        <ListItemText primary={`Name: ${units[unitId]}`} />
                                    </ListItem>
                                </Grid>
                            </Grid>
                        )}
                    </List>
                </Grid>
            </Grid>
        </Grid>
            <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleModeChange}
                aria-label="modalità"
            >
                <ToggleButton value={1} aria-label="compressa">
                    Overview
                </ToggleButton>
                <ToggleButton value={2} aria-label="visione-insieme">
                    Details
                </ToggleButton>
            </ToggleButtonGroup>
            {console.log(graphHeight)}
            {mode === 1 && Object.keys(metrics).length && <GlobalDatesAndUnits firstDate={firstDate} lastDate={lastDate} onSubmit={handleFirstLastDateChange} unitIds={globalUnitIds} availableUnitIds={globalAvailableUnitIds} handleUnitAdded={handleGlobalUnitAdded} handleUnitRemoved={handleGlobalUnitRemoved} unitNames={units} onSetHeight={setGraphHeight} />}
            {firstDate && lastDate && Object.keys(metrics).map(metricId => <Chart key={mode + " " + metricId} mode={mode} clientId={clientId} selectedUnitId={mode === 1 ? globalUnitIds : [metrics[metricId].units[0]]} allUnitIds={mode === 1 ? globalAvailableUnitIds : metrics[metricId].units.slice(1)} type="data" metric={metricId} measUnit={metrics[metricId].measUnit} unitNames={units} metricName={metrics[metricId].name} graphHeight={mode === 1 ? graphHeight : 400} defaultFirstDate={mode === 1 ? firstDate : 0} defaultLastDate={mode === 1 ? lastDate : 0} />)}
        </div> : <h2>Loading...</h2>}
    </Container>
}

export default Dashboard