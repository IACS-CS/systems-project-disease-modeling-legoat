import { shufflePopulation } from "../../lib/shufflePopulation";
// chatgpt removes all comments that are there previously idk why i added back what i could remember Authors: ryan dean
/* 
* What we are simulating: handshake virus infection and recovery rate
* 
* 
* 
*
* What elements we have to add: recovery period and immunity 
* 
* 
* 
* In plain language, what our model does: this model shows the infection rate of the handshake virus and its rate of recovery throughout a population of 400 it shows who is healthy who is infected and who has recovered / is immune
* 
*/

export const defaultSimulationParameters = {
  infectionChance: 50, // 50% chance of infection
};

// Creates the initial population
export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);

  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize,
      y: (100 * Math.floor(i / sideSize)) / sideSize,
      infected: false,
      immune: false, // New property to track immunity
      daysInfected: 0, // Tracks how long a person has been sick
    });
  }

  // Infect patient zero
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  patientZero.daysInfected = 1; // Start infection count

  return population;
};

const updateIndividual = (person, contact, params) => {
  // If the person is infected, increase their infection duration
  if (person.infected) {
    person.daysInfected += 1; // Track infection duration
    person.newlyInfected = false; // Reset after first turn

    // If they have been sick for 5 full turns, they recover and become immune
    if (person.daysInfected === 5) {
      person.infected = false;
      person.immune = true;
    }
  }

  // Infection spread logic (only if the person is not immune)
  if (!person.infected && !person.immune && contact.infected) {
    if (Math.random() * 100 < params.infectionChance) {
      person.infected = true;
      person.newlyInfected = true; // Mark as newly infected
      person.daysInfected = 0; // Start infection duration
    }
  }
};



// Updates the population each round
export const updatePopulation = (population, params) => {
  // Shuffle population to create random pairings
  population = shufflePopulation(population);

  for (let i = 0; i < population.length; i += 2) {
    let p1 = population[i];
    let p2 = population[i + 1] || population[0]; // Pair up (or loop back)

    updateIndividual(p1, p2, params);
    updateIndividual(p2, p1, params);
  }

  return population;
};

// Statistics tracking
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Recovered", value: "recovered" }, // New stat for recovered people
];

// Computes statistics each round
export const computeStatistics = (population, round) => {
  let infected = 0;
  let recovered = 0;

  for (let p of population) {
    if (p.infected) {
      infected++;
    } else if (p.immune) {
      recovered++;
    }
  }

  return { round, infected, recovered };
};
