import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Select, { SingleValue } from "react-select";
import "./App.css";

function App() {
  type OptionType = {
    value: string;
    label: string;
  };

  type PokemonType = {
    id: number;
    name: string;
    height: number;
    weight: number;
    sprites: { front_default: string };
  };

  const [pokemon, setPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonType | null>();
  const [highlightedPokemon, setHighlightedPokemon] =
    useState<PokemonType | null>();
  const [team, setTeam] = useState<PokemonType[]>(
    JSON.parse(localStorage.getItem("team") || "")
  );

  // Get all the pokemon from the API
  const getAllPokemon = async () => {
    try {
      const results = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/?limit=10000`
      );

      if (results) {
        setPokemon(results.data.results);
      }
    } catch (error) {
      console.error("Error getting all pokemon", error);
    }
  };

  // Get the data for a single pokemon from the API
  const getPokemon = async (option: SingleValue<OptionType>) => {
    try {
      if (option) {
        let result = await axios.get(option.value);

        if (result) {
          setSelectedPokemon(result.data);
        }
      }
    } catch (error) {
      console.error("Error getting pokemon stats", error);
    }
  };

  // Add a pokemon to the team
  const addPokemonToTeam = () => {
    let exists: PokemonType | undefined;

    if (selectedPokemon) {
      if (team && team.length) {
        // Check to see if the pokemon is already on the team
        exists = team.find((item) => item.name === selectedPokemon.name);
      }

      if (exists) {
        alert(`${selectedPokemon.name} is already on the team!`);
      } else {
        const newTeam = [...team, selectedPokemon];
        setTeam(newTeam);
        setSelectedPokemon(null);
      }
    }
  };

  // Remove a pokemon from the team
  const removePokemonFromTeam = (pokemonName: string) => {
    if (pokemonName) {
      let tempTeam = [...team];

      tempTeam = tempTeam.filter((item) => {
        return item.name !== pokemonName;
      });

      setTeam(tempTeam);
    }
  };

  // Get all the pokemon on init
  useEffect(() => {
    getAllPokemon();
  }, []);

  // Store the pokemon team in local storage whenever the team gets updated
  useEffect(() => {
    localStorage.setItem("team", JSON.stringify(team));
  }, [team]);

  return (
    <div className="App">
      <Dashboard>
        {highlightedPokemon ? (
          <ModalContainer>
            <Modal>
              <ModalClose onClick={() => setHighlightedPokemon(null)}>
                &times;
              </ModalClose>
              <ModalInner>
                <Image
                  src={highlightedPokemon.sprites.front_default}
                  alt={`Front default sprite for ${highlightedPokemon.name}`}
                />
                <Name>{highlightedPokemon.name}</Name>

                <Stat>Id: {highlightedPokemon.id}</Stat>

                <Stat>Height: {highlightedPokemon.height}</Stat>

                <Stat>Weight: {highlightedPokemon.weight}</Stat>
              </ModalInner>
            </Modal>
          </ModalContainer>
        ) : null}

        <Pokedex>
          {pokemon && pokemon.length ? (
            <SelectContainer>
              <Select
                placeholder="Select a Pokemon"
                options={pokemon.map((item: { name: string; url: string }) => {
                  return { label: item.name, value: item.url };
                })}
                onChange={(option) => {
                  getPokemon(option);
                }}
                isDisabled={team && team.length === 6}
                isSearchable
              ></Select>
            </SelectContainer>
          ) : null}

          <PokedexScreen>
            <PokedexScreenOuter>
              <PokedexScreenInner>
                {selectedPokemon ? (
                  <Image
                    onClick={() => setHighlightedPokemon(selectedPokemon)}
                    src={selectedPokemon.sprites.front_default}
                    alt={`Front default sprite for ${selectedPokemon.name}`}
                  />
                ) : null}
              </PokedexScreenInner>
            </PokedexScreenOuter>
          </PokedexScreen>

          {selectedPokemon ? (
            <>
              <Name>{selectedPokemon.name}</Name>
              <Button
                style={{ backgroundColor: "#0f0d12" }}
                onClick={() => {
                  addPokemonToTeam();
                }}
              >
                Add
              </Button>
            </>
          ) : null}
        </Pokedex>

        <TeamContainer>
          <TeamTitle>Team</TeamTitle>
          <Team>
            {team && team.length
              ? team.map((item, index) => {
                  return (
                    <TeamSpot key={index}>
                      <Image
                        onClick={() => setHighlightedPokemon(item)}
                        src={item.sprites.front_default}
                        alt={`Front default sprite for ${item.name}`}
                      />
                      <Name>{item.name}</Name>
                      <Button
                        onClick={() => {
                          removePokemonFromTeam(item.name);
                        }}
                      >
                        Remove
                      </Button>
                    </TeamSpot>
                  );
                })
              : null}

            {!team || (team && team.length < 6)
              ? [...Array(team && team.length ? 6 - team.length : 6)].map(
                  (value: undefined, index: number) => (
                    <TeamSpot key={index}></TeamSpot>
                  )
                )
              : null}
          </Team>
        </TeamContainer>
      </Dashboard>
    </div>
  );
}

export default App;

const Dashboard = styled.div`
  display: flex;
  background-color: #0f0d12;
  height: 100vh;
  width: 100vw;
`;

const SelectContainer = styled.div`
  text-align: left;
  text-transform: capitalize;
  margin-bottom: 70px;
  font-size: 20px;
`;

const Pokedex = styled.div`
  border: 2px solid black;
  width: 300px;
  height: 420px;
  margin: 70px;
  background-color: #e74c3c;
`;

const PokedexScreen = styled.div`
  border: 2px solid #0f0d12;
  margin: 0px 40px 20px 40px;
`;

const PokedexScreenOuter = styled.div`
  border: 20px solid #ecf0f1;
`;

const PokedexScreenInner = styled.div`
  background-color: #0f0d12;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  cursor: pointer;
`;

const Name = styled.p`
  margin: 0px 0px 20px 0px;
  font-weight: 500;
  text-transform: capitalize;
  font-size: 22px;
`;

const TeamContainer = styled.div`
  border: 2px solid black;
  flex: 1;
  height: 420px;
  background-color: #ecf0f1;
  margin: 70px;
`;

const TeamTitle = styled.h2`
  margin: 40px 0px 30px 0px;
  font-size: 50px;
  font-weight: normal;
  letter-spacing: 1px;
`;

const Team = styled.div`
  display: flex;
  padding: 40px;
  margin: 0px -20px;
`;

const TeamSpot = styled.div`
  width: calc(100% / 6);
  border: 2px dashed #0f0d12;
  margin: 0px 20px;
  min-height: 218px;
`;

const Button = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  outline: none;
  padding: 7px 15px;
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s ease-in-out;
  font-family: "VT323", monospace, sans-serif;
  letter-spacing: 1px;

  &:hover,
  &:focus {
    opacity: 0.7;
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 2;
  left: 0;
  top: 0;
`;

const Modal = styled.div`
  background-color: #ecf0f1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 500px;
  width: 500px;
`;

const ModalInner = styled.div`
  margin: 50px;
`;

const ModalClose = styled.button`
  cursor: pointer;
  position: absolute;
  top: 0px;
  right: 0px;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: #e74c3c;
  color: white;
  font-size: 24px;
  transition: 0.3s ease-in-out;

  &:hover,
  &:focus {
    opacity: 0.7;
  }
`;

const Stat = styled.p`
  font-size: 20px;
  margin: 10px 0px 0px 0px;
`;
