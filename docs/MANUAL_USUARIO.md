# Manual de usuario — Pokédex

## 1. Propósito

Pokédex es una aplicación web para consultar el catálogo de Pokémon. Permite localizar Pokémon, revisar sus datos principales y consultar sus estadísticas desde una interfaz visual en español.

## 2. Requisitos

Para utilizar la aplicación necesitas:

- Un navegador moderno (Chrome, Edge, Firefox, Safari u otro equivalente).
- Conexión a Internet: la información, descripciones e imágenes se obtienen desde PokéAPI.

No es necesario instalar programas ni crear una cuenta.

## 3. Cómo iniciar la aplicación

1. Abre el archivo `index.html` en el navegador.
2. Espera mientras aparece el mensaje **“Cargando Pokémon...”**.
3. Cuando finalice la carga, se mostrará el catálogo de tarjetas.

> La primera carga puede tardar unos instantes porque se consulta el catálogo completo.

## 4. Pantalla principal

La pantalla principal contiene los siguientes elementos:

| Elemento | Uso |
| --- | --- |
| **Campo de búsqueda** | Filtra el catálogo mientras escribes. |
| **Tarjetas de Pokémon** | Muestran el número, imagen, nombre, tipos, altura y peso. Selecciona una para abrir su ficha. |

## 5. Buscar un Pokémon

1. Haz clic en el campo **“Busca un Pokémon...”**.
2. Escribe el nombre, número o tipo que deseas encontrar.
3. Revisa las tarjetas que aparecen filtradas automáticamente.

Ejemplos de búsqueda:

- `pikachu` para localizar a Pikachu.
- `025` o `#025` para buscar por número de Pokédex.
- `fuego` para mostrar los Pokémon de tipo Fuego.

La búsqueda no distingue entre mayúsculas y minúsculas. Para volver a ver el catálogo completo, borra el contenido del campo.

Si no hay coincidencias, se mostrará el mensaje **“No se encontraron resultados.”**

## 6. Consultar la ficha de un Pokémon

1. Selecciona cualquier tarjeta del catálogo.
2. Espera a que se carguen los detalles en la ventana emergente.
3. Consulta la información disponible:

   - Número y nombre del Pokémon.
   - Categoría o género.
   - Tipos.
   - Descripción en español, cuando esté disponible.
   - Estadísticas base: PS, Ataque, Defensa, Ataque especial, Defensa especial y Velocidad.

Las barras de estadísticas representan visualmente los valores mostrados a la derecha.

## 7. Recorrer resultados y cerrar la ficha

- Usa **← Anterior** y **Siguiente →** para avanzar entre los Pokémon que estén en el resultado de búsqueda actual. Al llegar al primero o último, la navegación continúa desde el extremo opuesto.
- Para cerrar la ficha, usa el botón **×**, haz clic fuera de la ventana o presiona la tecla `Esc`.

## 8. Modo oscuro y modo claro

Selecciona el botón de tema en la parte superior:

- **Modo oscuro** activa una interfaz oscura.
- **Modo claro** restablece la interfaz clara.

La preferencia queda guardada localmente en el navegador. Si borras los datos de navegación, es posible que debas elegirla de nuevo.

## 9. Solución de problemas

| Situación | Qué hacer |
| --- | --- |
| Aparece “No se pudieron cargar los Pokémon.” | Comprueba tu conexión a Internet y vuelve a cargar la página. También verifica que PokéAPI esté disponible. |
| No se muestran los detalles | Revisa la conexión y vuelve a seleccionar la tarjeta. |
| No aparecen resultados | Borra el texto de búsqueda o prueba con el nombre, número o tipo correcto. |
| La aplicación no abre correctamente | Ábrela con un navegador actualizado y confirma que los archivos `index.html` y `style.css` permanezcan en la misma carpeta. |

## 10. Fuente de datos

Los datos e imágenes se consultan en tiempo real desde [PokéAPI](https://pokeapi.co/). Por ese motivo, la disponibilidad y el contenido mostrado dependen de dicho servicio.
