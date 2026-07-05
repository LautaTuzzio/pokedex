const COLORS_DICTIONARY = {
    normal: "#c2c2abff",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC"
};

const myDiv = document.getElementById("card-container");

const GEN_1_START = 1;
const GEN_1_END = 151;
const BATCH_SIZE = 5;       
const BATCH_DELAY_MS = 400; 

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function safeFetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request to ${url} failed with status ${response.status}`);
    }
    return response.json();
}


async function fetchPokemonData(id) {
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${id}`;

    const [pokemon, species] = await Promise.all([
        safeFetchJson(pokemonUrl),
        safeFetchJson(speciesUrl)
    ]);

    const spanishEntry = species.flavor_text_entries.find(
        entry => entry.language.name === "es"
    );

    const description = spanishEntry
        ? spanishEntry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ").replace(/\u00ad/g, "")
        : "Description not found.";

    return {
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprites.front_default,
        height: pokemon.height,
        weight: pokemon.weight,
        types: pokemon.types.map(t => t.type.name),
        abilities: pokemon.abilities.map(a => a.ability.name),
        stats: pokemon.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
        generation: species.generation.name, 
        description
    };
}


function renderPokemon(p) {
    const abilitiesHtml = p.abilities.map(a => `<p>${a}</p>`).join("");
    const statsHtml = p.stats.map(s => `<p>${s.name}: ${s.value}</p>`).join("");

    return `
        <div class="pokemon" style="border-left: 6px solid ${COLORS_DICTIONARY[p.types[0]] || "#777"}">
            <h2>${p.name}</h2>
            <img src="${p.sprite}" alt="${p.name}">
            <p>Altura: ${p.height}</p>
            <p>Peso: ${p.weight}</p>
            <p>Generación: ${p.generation}</p>
            <p>Descripción: ${p.description}</p>
            <p>Habilidades:</p>
            ${abilitiesHtml}
            <p>Stats:</p>
            ${statsHtml}
        </div>
    `;
}

function renderError(id, error) {
    return `<div class="pokemon pokemon-error"><h2>#${id}</h2><p>Could not load: ${error.message}</p></div>`;
}


async function fetchAllGen1Pokemon() {
    let html = "";

    for (let start = GEN_1_START; start <= GEN_1_END; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, GEN_1_END);
        const batchIds = [];
        for (let id = start; id <= end; id++) batchIds.push(id);

        const batchResults = await Promise.all(
            batchIds.map(id =>
                fetchPokemonData(id)
                    .then(data => ({ ok: true, data }))
                    .catch(error => ({ ok: false, id, error }))
            )
        );

        for (const result of batchResults) {
            html += result.ok ? renderPokemon(result.data) : renderError(result.id, result.error);
        }

        myDiv.innerHTML = html; 

        if (end < GEN_1_END) {
            await delay(BATCH_DELAY_MS);
        }
    }
}

fetchAllGen1Pokemon();