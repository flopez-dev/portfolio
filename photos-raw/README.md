# Fotos pendientes — The Chantal Verdugo House

Deja aquí las fotos de la casa. **Con los nombres que ya tengan**: yo las renombro,
las recorto a la proporción de cada hueco y las coloco en
`projects/chantal_verdugo_house/assets/img/`.

No hace falta que las recortes ni las ajustes. Cuanto más grande el original, mejor
sale el recorte.

## Dos cosas que sí importan

- **JPEG o PNG.** Nada de HEIC: este entorno no puede decodificarlo. Si salen del
  iPhone, expórtalas como "Más compatible" antes de subirlas.
- **Sin capturas de la ficha de Airbnb** si tienes el original. Una captura llega
  justa de resolución para el hero, que necesita 1920px de ancho.

## Qué falta (24 huecos)

`index.html` ya apunta a estos nombres. Hasta que existan los ficheros, la galería
sale rota — es lo esperado en esta rama, y por eso no se fusiona todavía.

### Fuera de la galería

| Fichero destino | Qué foto | Proporción |
| --- | --- | --- |
| `hero-house.jpg` | La de presentación: fachada de frente con las mecedoras rojas | 3:2 |
| `about-house.jpg` | **Vertical.** El banco de forja en la terraza, con el árbol y el césped al fondo | 4:5 |
| `og.jpg` | Se genera recortando la del hero | 1200×630 |

### Galería — 4:3 todas

| Fichero destino | Qué foto |
| --- | --- |
| `gallery-exterior-front.jpg` | Fachada en diagonal, a pleno día con cielo azul |
| `gallery-porch-front.jpg` | Porche cubierto con las dos mecedoras rojas |
| `gallery-livingroom.jpg` | Salón: chaise gris, tres ventanas, televisión |
| `gallery-sitting-area.jpg` | Segunda zona de estar: sofá gris, estantería negra, puerta lateral |
| `gallery-open-plan.jpg` | Vista desde el comedor: isla delante, salón al fondo |
| `gallery-kitchen.jpg` | Cocina: muebles blancos, fregadero bajo la ventana |
| `gallery-island.jpg` | Isla de canto natural con los taburetes |
| `gallery-diningroom.jpg` | Mesa de comedor con el póster de Virginia |
| `gallery-bedroom-main.jpg` | Principal: cómoda de madera clara, láminas azules |
| `gallery-bedroom-2.jpg` | La del póster de Picasso |
| `gallery-bedroom-3.jpg` | La de la colcha de animales y el escritorio |
| `gallery-bedroom-4.jpg` | La de la cama nido y las láminas de deporte |
| `gallery-bathroom-shower.jpg` | Baño oscuro: ducha de obra, grifería dorada |
| `gallery-bathroom-tub.jpg` | Baño claro: bañera y azulejo metro blanco |
| `gallery-laundry.jpg` | Lavadero: torre lavadora-secadora |
| `gallery-garage-pingpong.jpg` | Garaje con la mesa de ping pong |
| `gallery-exterior-back.jpg` | Trasera de la casa desde el jardín, con la tarima |
| `gallery-porch-back.jpg` | Porche trasero cubierto, sofá de ratán |
| `gallery-deck.jpg` | Terraza con la mesa redonda y la sombrilla roja |

### Fuera de la galería: seguridad

Estas dos van dentro de la tarjeta "Safety & Privacy" de la sección *Good to Know*, no
en la galería. Ahí respaldan una afirmación concreta de la página; entre las fotos de
las habitaciones desentonarían.

| Fichero destino | Qué foto | Proporción |
| --- | --- | --- |
| `safety-extinguisher.jpg` | El extintor en la balda del armario auxiliar | 4:3 |
| `safety-first-aid.jpg` | El mueble bajo el fregadero, con botiquín y extintor | 4:3 |

### El plano

`gallery-floorplan.jpg` va en la galería, pero **no lo recorto**: lo centro sobre fondo
blanco hasta 1200×900. La parrilla usa `object-fit: cover`, y recortar un plano apaisado
se comería las etiquetas de las habitaciones. Mándame el original tal cual.

### Las que aún no me has pasado

| Fichero destino | Qué foto |
| --- | --- |
| `gallery-fireplace.jpg` | La chimenea de leña |
| `gallery-firepit.jpg` | La hoguera |
| `floyd-country-store.jpg` | El Floyd Country Store |
| `floyd-blue-ridge-parkway.jpg` | Un mirador del Blue Ridge Parkway |

Las dos de Floyd son de sitios públicos, no de la casa. Si acabas usando fotos que no
son tuyas, hay que comprobar la licencia antes de publicarlas.

## Qué pasa después

Cuando estén aquí: las coloco, escribo los textos alternativos definitivos, quito la
nota de "placeholder", **quito el `noindex`**, regenero la vista previa de la galería
del portfolio y abro el PR. Esta carpeta se borra en ese mismo commit.
