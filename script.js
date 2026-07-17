const TOTAL_POKEMON = 1025;
const PAGE_SIZE = 24;

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
  fairy: "Hada",
};

let currentOffset = 1;
let isLoading = false;

const pokemonGrid = document.getElementById("pokemon-grid");
const detailsView = document.getElementById("pokemon-detail-view");
const listView = document.getElementById("pokemon-list-view");

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function safeFetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed ${url}`);
  }

  return response.json();
}

async function fetchPokemonCard(id) {
  const pokemon = await safeFetchJson(
    `https://pokeapi.co/api/v2/pokemon/${id}`,
  );

  return {
    id: pokemon.id,
    name: pokemon.name,
    sprite:
      pokemon.sprites.other["official-artwork"].front_default ||
      pokemon.sprites.front_default,
    types: pokemon.types.map((type) => type.type.name),
  };
}

async function fetchPokemonDetails(id) {
  const pokemon = await safeFetchJson(
    `https://pokeapi.co/api/v2/pokemon/${id}`,
  );

  const species = await safeFetchJson(
    `https://pokeapi.co/api/v2/pokemon-species/${id}`,
  );

  const description = species.flavor_text_entries.find(
    (entry) => entry.language.name === "es",
  );

  return {
    id: pokemon.id,
    name: pokemon.name,
    sprite: pokemon.sprites.other["official-artwork"].front_default,
    types: pokemon.types.map((t) => t.type.name),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    abilities: pokemon.abilities,
    stats: pokemon.stats,
    description:
      description?.flavor_text.replace(/\n/g, " ").replace(/\f/g, " ") ||
      "No description",
  };
}

function renderPokemonCard(pokemon) {
  return `
        <article
            class="pokemon-card"
        >

            <span class="pokemon-id">
                #${pokemon.id}
            </span>

            <img
                src="${pokemon.sprite}"
                alt="${pokemon.name}"
                class="card-image"
            >

            <h3>
                ${capitalize(pokemon.name)}
            </h3>

            <div class="card-types">

                ${pokemon.types
                  .map(
                    (type) => `
                        <span
                            class="type-badge"
                        >
                            ${TYPES_DICTIONARY[type]}
                        </span>
                    `,
                  )
                  .join("")}

            </div>


        </article>
    `;
}

async function loadBatch() {
  if (isLoading) return;

  if (currentOffset > TOTAL_POKEMON) return;

  isLoading = true;

  const batch = [];

  const limit = Math.min(currentOffset + PAGE_SIZE, TOTAL_POKEMON + 1);

  for (let id = currentOffset; id < limit; id++) {
    batch.push(fetchPokemonCard(id));
  }

  const pokemon = await Promise.all(batch);

  pokemonGrid.insertAdjacentHTML(
    "beforeend",
    pokemon.map(renderPokemonCard).join(""),
  );

  currentOffset = limit;

  isLoading = false;
}

function createStatBar(stat) {
  const width = (Math.min(stat.base_stat, 255) / 255) * 100;

  return `
        <div class="stat">

            <span>
                ${stat.stat.name}
            </span>

            <div class="bar">
                <div
                    style="
                    width:${width}%;
                    "
                ></div>
            </div>

            <span>
                ${stat.base_stat}
            </span>

        </div>
    `;
}

async function showPokemonDetails(id) {
  listView.hidden = true;

  detailsView.hidden = false;

  detailsView.innerHTML = `
        <div class="loading">
            Loading...
        </div>
        `;

  const pokemon = await fetchPokemonDetails(id);

  detailsView.innerHTML = `
    <button
        id="back-button"
        class="back-button"
    >
        ← Volver
    </button>

    <div class="pokemon-detail">

        <section
            class="left-panel"
        >

            <div class="pokemon-number">
                #${pokemon.id}
            </div>

            <div
                class="pokemon-image"
            >
                <img
                    src="${pokemon.sprite}"
                >
            </div>

            <div
                class="pokemon-name"
            >
                ${capitalize(pokemon.name)}
            </div>

            <div
                class="pokemon-data"
            >
                <div
                    class="data-box"
                >
                    Altura:
                    ${pokemon.height}m
                </div>

                <div
                    class="data-box"
                >
                    Peso:
                    ${pokemon.weight}kg
                </div>

            </div>

        </section>

        <section
            class="right-panel"
        >

            <div
                class="type-box"
            >
                <h3>Tipos</h3>

                ${pokemon.types
                  .map(
                    (type) => `
                        <span
                            class="
                            type
                            ${type}
                            "
                        >
                        ${TYPES_DICTIONARY[type]}
                        </span>
                    `,
                  )
                  .join("")}
            </div>

            <div
                class="description-box"
            >
                <h3>
                    Descripción
                </h3>

                <p>
                    ${pokemon.description}
                </p>
            </div>

            <div
                class="stats-box"
            >
                <h3>
                    Estadísticas
                </h3>

                ${pokemon.stats.map(createStatBar).join("")}
            </div>

        </section>

    </div>
    `;

  document.getElementById("back-button").addEventListener("click", () => {
    detailsView.hidden = true;

    listView.hidden = false;
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".details-button");

  if (!button) return;

  showPokemonDetails(button.dataset.id);
});

loadBatch();
