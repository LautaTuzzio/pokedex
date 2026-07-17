        const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1025';
        const searchInput = document.getElementById('pokemonSearch');
        const pokemonList = document.getElementById('pokemonList');
        const pokemonModal = document.getElementById('pokemonModal');
        const modalContent = document.getElementById('modalContent');
        const themeToggle = document.getElementById('themeToggle');

        let allPokemons = [];
        let filteredPokemons = [];
        let selectedPokemon = null;

        const typeLabels = {
            bug: 'Bicho',
            dark: 'Siniestro',
            dragon: 'Dragón',
            electric: 'Eléctrico',
            fairy: 'Hada',
            fighting: 'Lucha',
            fire: 'Fuego',
            flying: 'Volador',
            ghost: 'Fantasma',
            grass: 'Planta',
            ground: 'Tierra',
            ice: 'Hielo',
            normal: 'Normal',
            poison: 'Veneno',
            psychic: 'Psíquico',
            rock: 'Roca',
            steel: 'Acero',
            water: 'Agua'
        };

        const statLabels = {
            hp: 'PS',
            attack: 'Ataque',
            defense: 'Defensa',
            'special-attack': 'Ataque especial',
            'special-defense': 'Defensa especial',
            speed: 'Velocidad'
        };

        function formatId(id) {
            return `#${String(id).padStart(3, '0')}`;
        }

        function capitalize(value) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        }

        function translateType(type) {
            return typeLabels[type] || capitalize(type);
        }

        function translateStatName(name) {
            return statLabels[name] || capitalize(name);
        }

        function formatHeight(height) {
            return `${(height / 10).toFixed(1)} m`;
        }

        function formatWeight(weight) {
            return `${(weight / 10).toFixed(1)} kg`;
        }

        async function loadPokemons() {
            pokemonList.innerHTML = '<p class="empty-state">Cargando Pokémon...</p>';

            try {
                const response = await fetch(POKEAPI_URL);
                const data = await response.json();

                const pokemonDetails = await Promise.all(
                    data.results.map((pokemon) => fetch(pokemon.url).then((res) => res.json()))
                );

                allPokemons = pokemonDetails.map((pokemon) => ({
                    id: formatId(pokemon.id),
                    name: capitalize(pokemon.name),
                    types: pokemon.types.map((typeInfo) => translateType(typeInfo.type.name)).join(' / '),
                    image: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
                    height: formatHeight(pokemon.height),
                    weight: formatWeight(pokemon.weight),
                    stats: pokemon.stats.map((stat) => ({
                        name: stat.stat.name,
                        value: stat.base_stat
                    })),
                    speciesUrl: pokemon.species.url
                }));

                renderPokemons();
            } catch (error) {
                pokemonList.innerHTML = '<p class="empty-state">No se pudieron cargar los Pokémon.</p>';
            }
        }

        function renderPokemons(filter = '') {
            const normalizedFilter = filter.trim().toLowerCase();
            filteredPokemons = allPokemons.filter((pokemon) => {
                const searchableText = `${pokemon.id} ${pokemon.name} ${pokemon.types}`.toLowerCase();
                return searchableText.includes(normalizedFilter);
            });

            pokemonList.innerHTML = '';

            if (filteredPokemons.length === 0) {
                pokemonList.innerHTML = '<p class="empty-state">No se encontraron resultados.</p>';
                return;
            } 

            const fragment = document.createDocumentFragment();

            filteredPokemons.forEach((pokemon) => {
                const card = document.createElement('button');
                card.className = 'pokemon-card';
                card.type = 'button';
                card.innerHTML = `
                    <span class="pokemon-id">${pokemon.id}</span>
                    <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy" />
                    <h2>${pokemon.name}</h2>
                    <div class="types">${pokemon.types}</div>
                    <p>${pokemon.height} · ${pokemon.weight}</p>
                `;
                card.addEventListener('click', () => openPokemonModal(pokemon));
                fragment.appendChild(card);
            });

            pokemonList.appendChild(fragment);
        }

        async function openPokemonModal(pokemon) {
            selectedPokemon = pokemon;
            pokemonModal.classList.remove('hidden');
            pokemonModal.setAttribute('aria-hidden', 'false');
            modalContent.innerHTML = '<p class="empty-state">Cargando detalles...</p>';

            try {
                const response = await fetch(pokemon.speciesUrl);
                const species = await response.json();
                const flavorTextEntry = species.flavor_text_entries.find((entry) => entry.language.name === 'es');
                const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : 'No hay descripción disponible.';
                const genusEntry = species.genera.find((entry) => entry.language.name === 'es')
                const genus = genusEntry ? genusEntry.genus : '';

                modalContent.innerHTML = `
                    <div class="modal-visual">
                        <img src="${pokemon.image}" alt="${pokemon.name}" />
                    </div>
                    <div class="modal-info">
                        <p class="modal-id">${pokemon.id}</p>
                        <h2 id="modalTitle">${pokemon.name}</h2>
                        <p class="modal-genus">${genus}</p>
                        <div class="types">${pokemon.types}</div>
                        <p class="modal-description">${description}</p>
                        <div class="stat-list">
                            ${pokemon.stats.map((stat) => `
                                <div class="stat-row">
                                    <span>${translateStatName(stat.name)}</span>
                                    <div class="stat-bar">
                                        <div class="stat-fill" style="width: ${Math.min(stat.value, 100)}%"></div>
                                    </div>
                                    <strong>${stat.value}</strong>
                                </div>
                            `).join('')}
                        </div>
                        <div class="modal-nav">
                            <button class="modal-nav-button" type="button" data-nav="prev">← Anterior</button>
                            <button class="modal-nav-button" type="button" data-nav="next">Siguiente →</button>
                        </div>
                    </div>
                `;
            } catch (error) {
                modalContent.innerHTML = '<p class="empty-state">No se pudieron cargar los detalles.</p>';
            }
        }

        function closeModal() {
            pokemonModal.classList.add('hidden');
            pokemonModal.setAttribute('aria-hidden', 'true');
        }

        function navigateModal(direction) {
            if (!selectedPokemon || filteredPokemons.length === 0) {
                return;
            }

            const currentIndex = filteredPokemons.findIndex((pokemon) => pokemon.id === selectedPokemon.id);
            if (currentIndex === -1) {
                return;
            }

            const nextIndex = direction === 'next'
                ? (currentIndex + 1) % filteredPokemons.length
                : (currentIndex - 1 + filteredPokemons.length) % filteredPokemons.length;

            openPokemonModal(filteredPokemons[nextIndex]);
        }

        searchInput.addEventListener('input', (event) => {
            renderPokemons(event.target.value);
        });

        pokemonModal.addEventListener('click', (event) => {
            if (event.target.matches('[data-close="true"]')) {
                closeModal();
            }

            if (event.target.matches('[data-nav]')) {
                navigateModal(event.target.dataset.nav);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        });

        loadPokemons();