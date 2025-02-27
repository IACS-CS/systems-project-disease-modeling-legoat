import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";
import { renderTable } from "../../lib/renderTable";

let boxSize = 500; // World box size in pixels
let maxSize = 1000; // Max number of icons we render (we can simulate big populations, but don't render them all...)

const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize);
  }

  function renderEmoji(p) {
    if (p.newlyInfected) {
      return "🤧";
    } else if (p.infected) {
      return "🤢";
    } else if (p.recovered) {
      return "🤩";
    } else if (p.dead) {
      return "💀";
    } else {
      return "😀";
    }
  }

  function renderSubsetWarning() {
    if (amRenderingSubset) {
      return (
        <div className="subset-warning">
          Only showing {maxSize} ({((maxSize * 100) / popSize).toFixed(2)}%) of {popSize} patients...
        </div>
      );
    }
  }

  return (
    <>
      {renderSubsetWarning()}
      {population.map((p) => (
        <div
          key={p.id}
          data-patient-id={p.id}
          data-patient-x={p.x}
          data-patient-y={p.y}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${(p.y / 100) * boxSize}px)`,
          }}
        >
          {renderEmoji(p)}
        </div>
      ))}
    </>
  );
};

const Simulation = () => {
  const [popSize, setPopSize] = useState(20);
  const [incubationPeriod, setIncubationPeriod] = useState(9);
  const [population, setPopulation] = useState(createPopulation(popSize * popSize));
  const [diseaseData, setDiseaseData] = useState([]);
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [autoMode, setAutoMode] = useState(false);
  const [simulationParameters, setSimulationParameters] = useState({
    ...defaultSimulationParameters,
    incubationPeriod: 9,
  });

  const runTurn = () => {
    let newPopulation = updatePopulation([...population], simulationParameters);
    setPopulation(newPopulation);
    let newStats = computeStatistics(newPopulation, diseaseData.length);
    setDiseaseData([...diseaseData, newStats]);
  };

  const resetSimulation = () => {
    setSimulationParameters((prevParams) => ({
      ...prevParams,
      incubationPeriod: incubationPeriod,
    }));
    setPopulation(createPopulation(popSize * popSize));
    setDiseaseData([]);
  };

  useEffect(() => {
    if (autoMode) {
      setTimeout(runTurn, 500);
    }
  }, [autoMode, population]);

  return (
    <div>
      <section className="top">
        <h1>Ebola Simulation</h1>
        <p>
          This simulation model shows the infection, death, immunization, and incubation rate of the Ebola virus. The model randomizes the pairs of people and who comes in contact with who to create a randomized spread of the infection.
        </p>

        <p>
          Population: {population.length}. Infected: {population.filter((p) => p.infected).length}
        </p>

        <button onClick={runTurn}>Next Turn</button>
        <button onClick={() => setAutoMode(true)}>AutoRun</button>
        <button onClick={() => setAutoMode(false)}>Stop</button>
        <button onClick={resetSimulation}>Reset Simulation</button>

        <div>
          <label>
            Population:
            <div className="vertical-stack">
              <input
                type="range"
                min="3"
                max="1000"
                value={popSize}
                onChange={(e) => setPopSize(parseInt(e.target.value))}
              />
              <input
                type="number"
                value={Math.round(popSize * popSize)}
                step="10"
                onChange={(e) => setPopSize(Math.sqrt(parseInt(e.target.value)))}
              />
            </div>
          </label>
        </div>
        <div>
          <label>
            Incubation Period (Days):
            <div className="vertical-stack">
              <input
                type="range"
                min="2"
                max="21"
                value={incubationPeriod}
                onChange={(e) => setIncubationPeriod(parseInt(e.target.value))}
              />
              <input
                type="number"
                value={incubationPeriod}
                step="1"
                onChange={(e) => setIncubationPeriod(parseInt(e.target.value))}
              />
            </div>
          </label>
        </div>
      </section>

      <section className="side-by-side">
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}
        <div className="world">
          <div className="population-box" style={{ width: boxSize, height: boxSize }}>
            {renderPatients(population)}
          </div>
        </div>
        {renderTable(diseaseData, trackedStats)}
      </section>
    </div>
  );
};

export default Simulation;
