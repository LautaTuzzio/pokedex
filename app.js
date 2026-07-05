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

const TYPES_DICTIONARY = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    electric: "Eléctrico",
    grass: "Planta",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada"
};

const STATS_DICTIONARY = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "Ataque Especial",
    "special-defense": "Defensa Especial",
    speed: "Velocidad"
};

const GENERATION_DICTIONARY = {
    "generation-i": "Generación 1",
    "generation-ii": "Generación 2",
    "generation-iii": "Generación 3",
    "generation-iv": "Generación 4",
    "generation-v": "Generación 5",
    "generation-vi": "Generación 6",
    "generation-vii": "Generación 7",
    "generation-viii": "Generación 8",
    "generation-ix": "Generación 9"
};

const myDiv = document.getElementById("card-container");

const GEN_1_START = 1;
const GEN_1_END = 151;
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 0;

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

async function fetchAbilityDescription(url) {
    const ability = await safeFetchJson(url);
    const entry = ability.flavor_text_entries.find(
        entry => entry.language.name === "es"
    );
    return entry ? entry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ") : "Descripción no disponible.";
}

async function fetchPokemonData(id) {
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${id}`;

    const [pokemon, species] = await Promise.all([
        safeFetchJson(pokemonUrl),
        safeFetchJson(speciesUrl)
    ]);

    const entry = species.flavor_text_entries.find(
        entry => entry.language.name === "es"
    );

    const description = entry
        ? entry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ").replace(/\u00ad/g, "")
        : "Description not found.";

    const abilities = await Promise.all(
        pokemon.abilities.map(async a => ({
            name: a.ability.name,
            description: await fetchAbilityDescription(a.ability.url)
        }))
    );

    return {
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprites.front_default,
        height: pokemon.height,
        weight: pokemon.weight,
        types: pokemon.types.map(t => t.type.name),
        abilities,
        stats: pokemon.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
        generation: species.generation.name,
        description
    };
}

function renderPokemon(p) {
    const abilitiesHtml = p.abilities
        .map(a => `<p>${a.name}: ${a.description}</p>`)
        .join("");
    const statsHtml = p.stats.map(s => `<p>${STATS_DICTIONARY[s.name]}: ${s.value}</p>`).join("");

    const typesHtml = p.types
        .map(t => `<span class="type-badge" style="background:${COLORS_DICTIONARY[t] || "#777"}">${TYPES_DICTIONARY[t]}</span>`)
        .join(" ");

    const borderStyle = p.types.length > 1
        ? `border-left: 6px solid ${COLORS_DICTIONARY[p.types[0]] || "#777"}`
        : `border-left: 6px solid ${COLORS_DICTIONARY[p.types[0]] || "#777"}`;

    return `
        <div class="pokemon" style="${borderStyle}">
            <h2>${p.name}</h2>
            <img src="${p.sprite}" alt="${p.name}">
            <p>Tipos: ${typesHtml}</p>
            <p>Altura: ${p.height}</p>
            <p>Peso: ${p.weight}</p>
            <p>Generación: ${GENERATION_DICTIONARY[p.generation]}</p>
            <p>Descripción: ${p.description}</p>
            <p>Habilidades:</p>
            ${abilitiesHtml}
            <p>Estadísticas:</p>
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