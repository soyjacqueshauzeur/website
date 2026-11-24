Una web puede pasar la prueba de "se ve bien" y seguir siendo inusable en el móvil. La diferencia está en cosas que no aparecen en una captura de pantalla.

Viewport. Si falta la etiqueta meta viewport, el navegador asume 980 píxeles de ancho y encoge todo. La página "entra completa" porque está alejada: el texto queda en 8 puntos y obliga a hacer zoom.

Áreas táctiles. Apple recomienda 44x44 puntos y Google 48x48 píxeles. Un enlace de 18 píxeles de alto se puede tocar, pero no con el pulgar y no en movimiento.

Formularios. Cada campo necesita su type correcto (tel, email) para que el teclado del teléfono cambie solo, y autocomplete para no escribir todo a mano de nuevo.

Contraste y tamaño. 16 píxeles es el mínimo legible sin zoom. Por debajo, iOS agranda la página al enfocar un campo y descoloca el diseño justo cuando la persona iba a escribirte.

Menú. Si el botón de abrir el menú mide 20 píxeles o está pegado al borde, la persona lo toca tres veces antes de acertar. Y a la tercera se va.

La emulación de móvil en DevTools sirve para empezar, pero miente en dos cosas: la velocidad real de la red y el tamaño del dedo. La última prueba siempre es un teléfono de verdad.
