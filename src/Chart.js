import React, { useState, useEffect } from 'react';
import { GetData, GetFirstDate, GetLastDate } from './Firebase';
import * as d3 from 'd3';
import { Button, Grid, Menu, MenuItem, IconButton, Popover } from '@mui/material';
import MuiInput from '@mui/material/Input';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { styled } from '@mui/system';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import "dayjs/plugin/isSameOrAfter"
import "dayjs/plugin/isSameOrBefore"

const Chart = ({ mode, clientId, selectedUnitId, allUnitIds, type, metric, measUnit, unitNames, metricName, defaultFirstDate = 0, defaultLastDate = 0, graphHeight = 400 }) => {
  const [myData, setMyData] = useState([]);
  const [firstDate, setFirstDate] = useState(defaultFirstDate);
  const [lastDate, setLastDate] = useState(defaultLastDate);
  const [FIRST_DATE, setFIRST_DATE] = useState(defaultFirstDate);
  const [LAST_DATE, setLAST_DATE] = useState(defaultLastDate);
  const [unitIds, setUnitIds] = useState([...selectedUnitId])
  const [availableUnitIds, setAvailableUnitIds] = useState(allUnitIds);

  const fetchData = async unitId => {
    if (firstDate > LAST_DATE || lastDate < FIRST_DATE)
      setMyData("Nessun valori");
    else
      GetData(clientId, unitId, type, metric, firstDate, lastDate, snapshot => {
        const data = [];
        snapshot.forEach(childSnapshot => {
          data.push({ date: new Date(parseInt(childSnapshot.key) * 1000), value: childSnapshot.val() });
        });
        setMyData(myData.length === 0 ? [data] : myData.concat([data]));
      });
  };
  const fetchDatas = async _unitIds => {
    const data = [];
    _unitIds.forEach(unitId => GetData(clientId, unitId, type, metric, firstDate, lastDate, snapshot => {
      const _data = [];
      snapshot.forEach(childSnapshot => {
        _data.push({ date: new Date(parseInt(childSnapshot.key) * 1000), value: childSnapshot.val() });
      })
      data.push(_data)
      if (data.length == _unitIds.length)
        setMyData(data);
    }))
  };
  const fetchFirstDate = async () => {
    GetFirstDate(clientId, selectedUnitId, type, metric, date => {
      setFIRST_DATE(date)
      setFirstDate(date);
    });
  };
  const fetchLastDate = async () => {
    GetLastDate(clientId, selectedUnitId, type, metric, date => {
      setLAST_DATE(date)
      setLastDate(date);
    });
  };

  useEffect(() => {
    if (!defaultFirstDate && !defaultLastDate) {
      fetchFirstDate();
      fetchLastDate();
    }
  }, []);

  useEffect(() => {
    if (mode === 1)
      fetchDatas(unitIds)
  }, [unitIds])

  useEffect(() => {
    if (mode === 1) {
      setFirstDate(defaultFirstDate)
      setFIRST_DATE(defaultFirstDate)
      setLastDate(defaultLastDate)
      setLAST_DATE(defaultLastDate)
      setUnitIds([...selectedUnitId])
      setAvailableUnitIds(allUnitIds)
    }
  }, [defaultFirstDate, defaultLastDate, selectedUnitId, allUnitIds]);

  useEffect(() => drawChart(), [graphHeight])

  useEffect(() => {
    if (myData.length > 0 && firstDate !== 0 && lastDate !== 0) {
      if (Array.isArray(myData))
        drawChart();
      else if (typeof myData === 'string')
        drawNoValueChart(myData);
    }
  }, [myData, firstDate, lastDate]);

  useEffect(() => {
    if (firstDate !== 0 && lastDate !== 0) {
      fetchDatas(unitIds)
    }
  }, [firstDate, lastDate]);

  const drawChart = () => {
    d3.selectAll("#chart-" + metric + " svg").remove(); // Utilizza l'indice per selezionare il grafico corretto

    let margin = { top: mode === 2 ? 10 : 0, right: 30, bottom: mode === 2 ? 30 : 0, left: 60 },
      width = window.innerWidth - margin.left - margin.right,
      height = graphHeight - margin.top - margin.bottom;

    let svg = d3.select("#chart-" + metric)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("position", "relative")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scaleTime()
      .domain([firstDate, lastDate])
      .range([0, width]);
    if (mode === 2)
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d %H:%M")));
    else
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")

        .text(metricName);

    let y = d3.scaleLinear()
      .domain(d3.extent(myData.flat(), d => d.value))
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y).ticks(height / 40).tickFormat(d => d + " " + measUnit));

    // Aggiungi punti al grafico
    const colorScale = d3.scaleLinear()
      .domain(d3.extent(myData.flat(), d => d.value))
      .range([d3.interpolateBlues(0.8), d3.interpolateReds(0.8)]);

    // Aggiungi la linea
    for (let i = 0; i < myData.length; i++) {
      // Aggiungi il grafico lineare
      svg.append("path")
        .datum(myData[i])
        .attr("class", "graph-" + metric + "-" + i)
        .attr("fill", "none")
        .attr("stroke", getColorForUnit(i))
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(d => x(d.date))
          .y(d => y(d.value)))
        .on("mouseover", () => {
          // Mostra i cerchietti del grafico lineare corrente
          d3.selectAll(".circle-" + metric + "-" + i)
            .classed("hidden", false);
        })
        .on("mouseout", () => {
          // Nascondi i cerchietti del grafico lineare corrente
          d3.selectAll(".circle-" + metric + "-" + i)
            .classed("hidden", true);
        });

      // Aggiungi i cerchietti per il grafico lineare corrente
      svg.selectAll(".-circle-" + metric + "-" + i) // Aggiungi un'identificatore univoco per i cerchietti del grafico lineare corrente
        .data(myData[i])
        .enter().append("circle")
        .attr("class", "circle-" + metric + "-" + i + " hidden") // Aggiungi una classe e un identificatore univoco per i cerchietti
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 2)
        .attr("fill", d => colorScale(d.value));
    }

    // Aggiungi la barra verticale
    const verticalLine = svg.append("line")
      .attr("class", "vertical-line")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "4")
      .style("opacity", 0.5)
      .style("pointer-events", "none")
      .attr("y1", 0)
      .attr("y2", height);

    // Aggiungi rettangolo e testo per visualizzare i dettagli
    const toolTip = d3.select("#tool-tip-" + metric).append("div")
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "fixed")
      .style("transform", "translateX(40%)")
      .style("pointer-events", "none")
      .style("opacity", 0)

    // Gestisci l'evento mousemove per mostrare il testo con i dettagli
    svg.on("mousemove", (event, d) => {
      let [mouseX, mouseY] = d3.pointer(event)
      if (mouseX <= 0 || mouseY >= height - 1)
        return;
      mouseY = event.pageY - window.scrollY
      // Posiziona la barra verticale
      verticalLine
        .attr("x1", mouseX)
        .attr("x2", mouseX)
        .style("opacity", 1);

      // Posiziona il rettangolo e il testo per visualizzare i dettagli
      let rectX = mouseX + 10; // Posizione iniziale del rettangolo

      // Se il rettangolo si estende oltre il limite destro del bordo, posizionalo a sinistra del mouse
      if (rectX + 120 > width) {
        rectX = mouseX - 155; // Posizione a sinistra del mouse
      }

      toolTip
        .html(y.invert(mouseY).toFixed(2) + " " + measUnit + "<br/>" + x.invert(mouseX).toLocaleString())
        .style("left", rectX + "px")
        .style("top", mouseY + "px")
        .style("opacity", 1);
    });

    // Gestisci l'evento mouseout per nascondere il rettangolo e il testo
    svg.on("mouseout", (event, d) => {
      toolTip.style("opacity", 0);
    });
  };

  const drawNoValueChart = (message) => {
    d3.selectAll("#chart-" + metric + " svg").remove();

    let margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = window.innerWidth - margin.left - margin.right,
      height = graphHeight - margin.top - margin.bottom;

    let svg = d3.select("#" + metric + "-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("position", "relative")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scaleTime()
      .domain([firstDate, lastDate])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d %H:%M")));

    let y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => d + " " + measUnit));

    // Aggiungi il testo al centro del grafico
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .text(message);
  };

  const handleUnitAdded = (updatedUnitIds) => {
    fetchData(updatedUnitIds);
    setUnitIds([...unitIds, updatedUnitIds])
    setAvailableUnitIds(availableUnitIds.map(i => { if (i !== updatedUnitIds) return i }))
  };

  const handleUnitRemoved = (updatedUnitIds, i) => {
    setUnitIds(unitIds.filter((v) => v !== updatedUnitIds))
    setAvailableUnitIds([...availableUnitIds, updatedUnitIds])
    setMyData(myData.filter((_, _i) => _i !== i))
  };

  return (
    <div>
      <div>
        {mode === 2 && <div><Grid container spacing={3} alignItems="center">
          <Grid item xs="auto">
            <h2>{metricName}</h2>
          </Grid>
          {firstDate > 0 && lastDate > 0 &&
            <Grid item xs>
              <DateRangeSelector firstDate={firstDate} lastDate={lastDate} onSubmit={(start, end) => { setFirstDate(start); setLastDate(end) }} />
            </Grid>}
        </Grid>
          <UnitSelector unitIds={unitIds} availableUnitIds={availableUnitIds} onAdded={handleUnitAdded} onRemoved={handleUnitRemoved} unitNames={unitNames} /></div>}
        <div id={"chart-" + metric} />
      </div>
      <div id={"tool-tip-" + metric} />
    </div>
  );
};

export const DateRangeSelector = ({ firstDate, lastDate, onSubmit }) => {
  const [startDate, setStartDate] = useState(dayjs(firstDate));
  const [endDate, setEndDate] = useState(dayjs(lastDate));

  useEffect(() => {
    setStartDate(dayjs(firstDate));
    setEndDate(dayjs(lastDate));
  }, [firstDate, lastDate]);

  const handleStartDateChange = (date) => {
    if (date.isAfter(endDate) || date.isSame(endDate)) {
      // Se la data d'inizio è uguale o successiva alla data di fine, sottrai un giorno dalla data di fine
      setEndDate(date.add(1, 'day'));
    }
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    if (date.isBefore(startDate) || date.isSame(startDate)) {
      // Se la data di fine è uguale o precedente alla data d'inizio, aggiungi un giorno alla data d'inizio
      setStartDate(date.subtract(1, 'day'));
    }
    setEndDate(date);
  };

  const handleSubmit = () => {
    onSubmit(startDate.valueOf(), endDate.valueOf());
    handleClose()
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setStartDate(dayjs(firstDate));
    setEndDate(dayjs(lastDate));
  };

  const open = Boolean(anchorEl);
  const id = open ? 'data-selector-popover' : undefined;

  return (
    <div>
      <Button aria-describedby={id} variant="outlined" onClick={handleOpen} endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />} sx={{ borderRadius: '20px' }}>
        {dayjs(firstDate).format('DD/MM/YY HH:mm') + " - " + dayjs(lastDate).format('DD/MM/YY HH:mm')}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Grid container spacing={2} justify="center" alignItems="center" p={2}>
          <Grid item>
            <DateTimePicker
              label="Data d'inizio"
              value={startDate}
              onChange={handleStartDateChange}
              format="DD/MM/YYYY HH:mm"
            />
          </Grid>
          <Grid item>
            <DateTimePicker
              label="Data di fine"
              value={endDate}
              onChange={handleEndDateChange}
              format="DD/MM/YYYY HH:mm"
              minDate={startDate}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Conferma
            </Button>
          </Grid>
        </Grid>
      </Popover>
    </div>
  );
};


const ColorCircle = styled('div')({
  width: 20,
  height: 20,
  borderRadius: '50%',
  margin: 5,
  marginRight: 10
});

const UnitSelector = ({ unitIds, availableUnitIds, onAdded, onRemoved, unitNames }) => {
  console.log(unitIds, availableUnitIds)
  const handleAddUnit = unitId => {
    onAdded(unitId);
  };

  const handleRemoveUnit = (unitId, i) => {
    onRemoved(unitId, i);
  };

  return (
    <Grid container spacing={2} alignItems="center">
      {/* Sezione di destra */}
      <Grid item xs>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {unitIds.map((unitId, i) => (
            <div key={"item-" + i} style={{ display: 'flex', alignItems: 'center', margin: '5px', paddingRight: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', borderRadius: '12px' }}>
              <ColorCircle style={{ backgroundColor: getColorForUnit(i), marginRight: '5px' }} />
              <span>{unitNames[unitId]}</span>
              {unitIds.length > 1 && <IconButton size="small" style={{ paddingRight: 0, marginLeft: 5 }} onClick={() => handleRemoveUnit(unitId, i)}>
                <CloseIcon />
              </IconButton>}
            </div>
          ))}
        </div>
      </Grid>

      {/* Sezione di sinistra */}
      <Grid item>
        {availableUnitIds.length > 0 && <AddUnit availableUnitIds={availableUnitIds} handleAddUnit={handleAddUnit} unitNames={unitNames} />}
      </Grid>
    </Grid>
  );
};

const AddUnit = ({ availableUnitIds, handleAddUnit, unitNames }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = unitId => {
    handleAddUnit(unitId)
    handleClose()
  }

  return <div>
    <IconButton
      id="units-add-button"
      aria-controls={open ? 'basic-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      onClick={handleClick}
      color='primary'
    >
      <AddCircleIcon fontSize='large' />
    </IconButton>
    <Menu
      id="units-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      {availableUnitIds.map((unitId) => (
        <MenuItem key={"list" + unitId} value={unitId} onClick={() => handleItemClick(unitId)}>
          {unitNames[unitId]}
        </MenuItem>
      ))}
    </Menu>
  </div>
}

const getColorForUnit = index => ["blue", "red", "green", "yellow"][index]

export const GlobalDatesAndUnits = ({ firstDate, lastDate, onSubmit, unitIds, availableUnitIds, handleUnitAdded, handleUnitRemoved, unitNames, onSetHeight }) => {
  const [height, setHeight] = React.useState(100);

  const handleHeightChange = (event) => {
    let h = event.target.value === '' ? 0 : Number(event.target.value)
    if (h > 1000)
      setHeight(1000)
    else {
      setHeight(h)
      onSetHeight(h)
    }
  };

  return <div><Grid container spacing={3} alignItems="center">
    <Grid item xs="auto">
      <p>Data: </p>
    </Grid>
    <Grid item>
      <DateRangeSelector firstDate={firstDate} lastDate={lastDate} onSubmit={onSubmit} />
    </Grid>
    <Grid item >
      <UnitSelector unitIds={unitIds} availableUnitIds={availableUnitIds} onAdded={handleUnitAdded} onRemoved={handleUnitRemoved} unitNames={unitNames} />
    </Grid>
    <Grid item sx>
    <span>Altezza: </span>
      <MuiInput
        value={height}
        size="small"
        onChange={handleHeightChange}
        inputProps={{
          step: 10,
          min: 10,
          max: 1000,
          type: 'number',
          'aria-labelledby': 'height',
        }}
      />
      <span>px</span>
    </Grid>
  </Grid>
  </div>
}

export default Chart;