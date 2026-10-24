# Safe triangle: el triángulo invisible de los menús

Ejemplo mínimo, sin dependencias, de cómo las librerías de UX/UI evitan que un submenú se cierre cuando el ratón va hacia él en diagonal. Un solo archivo HTML con el menú, el cursor y el triángulo pintado para que se vea.

**Demo:** https://marcaparisitfg.github.io/safe-triangle/

## El problema

Abres un submenú al pasar el ratón por una opción. Vas hacia el panel en diagonal y, por el camino, el ratón pisa la opción de al lado o cruza el hueco entre las dos cajas. El navegador solo sabe dónde está el ratón ahora, no adónde va, así que cierra lo que querías abrir o te cambia el menú.

## Las dos soluciones

1. **Esperar.** Un `setTimeout` de 200–300 ms antes de cerrar. Funciona, pero cuando recorres el menú a propósito todo va con retraso: una espera no distingue entre «voy al panel» y «voy a la siguiente opción».
2. **El triángulo seguro** (*safe triangle*, *safe polygon*, *menu aim*). Al salir de la opción, se dibuja un polígono entre la posición del ratón y las esquinas del panel. Mientras el ratón esté dentro de ese polígono, no se cierra nada ni se activa la opción vecina. En cuanto sale, se cierra. Es detectar la intención del usuario con geometría, sin esperas.

## Cómo está hecho aquí

Todo está en [`index.html`](index.html):

- Un menú (vertical con el panel a la derecha, u horizontal con el panel debajo) con un hueco de 40 px a propósito para que el triángulo se vea.
- Al salir de la opción abierta se guarda el polígono: el punto del ratón (con 5 px de margen hacia atrás) más las cuatro esquinas del panel, como hace Radix. Un test punto-en-polígono (*ray casting*) decide si el ratón sigue dentro.
- Solo cuenta como «ir hacia el panel» si el ratón no retrocede (el `isMovingTowards` de Radix).
- El hueco entre la opción y el panel es siempre zona segura, en los dos sentidos (el puente rectangular de Floating UI).
- Si el ratón se para dentro del polígono, se olvida la intención al cabo de 1 s y el siguiente movimiento decide. Radix usa 300 ms; aquí es más largo para que el triángulo se vea en pantalla.
- Tres modos para comparar: sin truco, con espera de 300 ms y con triángulo. Y «Mostrar el triángulo» lo pinta (azul mientras vas hacia el panel, rojo medio segundo al salirte).

```js
// Al salir de la opción abierta: el puntero más las esquinas del panel.
const r = panel.getBoundingClientRect();
zona = [[x - 5, y], [r.left, r.top], [r.right, r.top], [r.right, r.bottom], [r.left, r.bottom]];

// En cada movimiento: si sigue dentro y no retrocede, no se toca nada.
if (zona && haciaElPanel && dentro(x, y, zona)) return;
```

## Cómo lo hacen las librerías

- **Floating UI** lo expone como `safePolygon()`, el manejador de cierre de `useHover`: «un polígono dinámico (rectángulo o triángulo) que nace del cursor al salir del elemento de referencia». Opciones `buffer`, `requireIntent` y `blockPointerEvents`. https://floating-ui.com/docs/useHover
- **Radix UI** lo lleva de serie en los submenús de sus menús: en `MenuSubTrigger.onPointerLeave` construye el polígono con el puntero y las esquinas del submenú, lo guarda 300 ms como «pointer grace intent» y comprueba la dirección del ratón. https://github.com/radix-ui/primitives/blob/main/packages/react/menu/src/menu.tsx
- **Amazon** lo hizo famoso en su menú de departamentos. Ben Kamens lo describió en 2013 («Breaking down Amazon's mega dropdown») y publicó el plugin jQuery-menu-aim. https://github.com/kamens/jQuery-menu-aim
- Más contexto: «Better Context Menus With Safe Triangles», Smashing Magazine (2023). https://www.smashingmagazine.com/2023/08/better-context-menus-safe-triangles/

## Cuándo no hace falta

Si el menú se abre con clic o con el dedo (móvil), no hay trayectoria de ratón que proteger. Abrir con clic es, además, la opción accesible.

## Probarlo en local

Abre `index.html` con doble clic o sírvelo con cualquier servidor estático:

```bash
python3 -m http.server 9300
```

## Licencia

MIT. Hecho para un vídeo de [@maparisi_dev](https://www.tiktok.com/@maparisi_dev).
