# partinfect
Infection particle simulation


## Simulation method

We take a number of noninteracting particles moving with random velocity inside a container. The illness level (health level) of every particles is recorded as a number between 0 to 100 which represents healthy to very sick condition. Every time a particle getting too close to another particle, its health level will decrease according to the condition of the other particle. A contact between two healthy particles will not change the health conditions. The distance that may infect a healthy particle is defined by the expossure distance. 
There is a chance that an ill particle become healthier (defined by the cure-probability), however, once a particle become infected, the condition will be worsened as a function of time. The rate of change in the health condition is defined by the infection growth time and the health worsen probability.

## Parameters

| name                         | meaning                 |
|:-----------------------------|:------------------------|
| population density           | the number of particles                                |
| initial infected             | the number of initially infected particles |
| health worsening probability | the probability that a particle <br>health level decreases |
| cure probability             | the probability that a particle can recover |
| infection growth time        | the time that the change of healt level evaluated |
| expossure radius             | the distance limit that a particle <br>can infect other particle |

## Measurements

This simulation does not use any measurement units. So the data can be interpretated as is. 

| name   | meaning |
|:-------|:--------|
| time   | elapsed simulation time |
| #infected | the number of infected particles |
| #cured    | the number of healing particles  |
| infected level | the sum of illness condition of all particles <br>devided by the maximum illness value |
