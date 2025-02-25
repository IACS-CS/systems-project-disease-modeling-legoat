/* Update this code to simulate a simple disease model! */

/* For this simulation, you should model a *real world disease* based on some real information about it.
*
* Options are:
* - Mononucleosis, which has an extremely long incubation period.
*
* - The flu: an ideal model for modeling vaccination. The flu evolves each season, so you can model
    a new "season" of the flu by modeling what percentage of the population gets vaccinated and how
    effective the vaccine is.
* 
* - An emerging pandemic: you can model a new disease (like COVID-19) which has a high infection rate.
*    Try to model the effects of an intervention like social distancing on the spread of the disease.
*    You can model the effects of subclinical infections (people who are infected but don't show symptoms)
*    by having a percentage of the population be asymptomatic carriers on the spread of the disease.
*
* - Malaria: a disease spread by a vector (mosquitoes). You can model the effects of the mosquito population
    (perhaps having it vary seasonally) on the spread of the disease, or attempt to model the effects of
    interventions like bed nets or insecticides.
*
* For whatever illness you choose, you should include at least one citation showing what you are simulating
* is based on real world data about a disease or a real-world intervention.
*/

/**
 * Authors: ryan dean
 * 
 * What we are simulating: ebola 
 * 
 * What we are attempting to model from the real world: the infection rate and death rate of ebola 
 * 
 * What we are leaving out of our model: things like geography and real world factors like quarantine.
 * 
 * What elements we have to add: incubation rate of 9 days (average of 2-21 days) the recovery rate of 50% and the death rate of 50%
 * 
 * What parameters we will allow users to "tweak" to adjust the model: the population size and the infection rate (25-70%)
 * 
 * In plain language, what our model does: This model shows the affect of ebola throughout a population it shows the incubation rate the death and recovery rate and the infection rate of the illness over a population
 * 
 */

import { shufflePopulation } from "../../lib/shufflePopulation";

export const defaultSimulationParameters = {
  infectionRate: 50, // Default infection rate (adjustable between 25-70%)
};

export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize,
      y: (100 * Math.floor(i / sideSize)) / sideSize,
      infected: false,
      newlyInfected: false,
      daysInfected: 0,
      recovered: false,
      dead: false,
    });
  }
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  patientZero.newlyInfected = true;
  return population;
};

export const updatePopulation = (population, params) => {
  const infectionRate = Math.max(25, Math.min(70, params.infectionRate));
  let newPopulation = population.map((person) => {
    if (person.newlyInfected) {
      person.newlyInfected = false;
    }
    if (person.infected) {
      person.daysInfected++;
      if (person.daysInfected >= 9) {
        if (Math.random() < 0.5) {
          person.dead = true;
          person.infected = false;
        } else {
          person.recovered = true;
          person.infected = false;
        }
      }
    }
    return person;
  });

  newPopulation = shufflePopulation(newPopulation);

  for (let i = 0; i < newPopulation.length; i += 2) {
    if (i + 1 < newPopulation.length) {
      let personA = newPopulation[i];
      let personB = newPopulation[i + 1];
      if (personA.infected && !personB.infected && !personB.dead) {
        if (Math.random() < infectionRate / 100) {
          personB.infected = true;
          personB.newlyInfected = true;
        }
      } else if (personB.infected && !personA.infected && !personA.dead) {
        if (Math.random() < infectionRate / 100) {
          personA.infected = true;
          personA.newlyInfected = true;
        }
      }
    }
  }

  return newPopulation;
};

export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Recovered", value: "recovered" },
  { label: "Total Dead", value: "dead" },
];

export const computeStatistics = (population, round) => {
  let infected = 0;
  let recovered = 0;
  let dead = 0;
  for (let p of population) {
    if (p.infected) infected++;
    if (p.recovered) recovered++;
    if (p.dead) dead++;
  }
  return { round, infected, recovered, dead };
};
