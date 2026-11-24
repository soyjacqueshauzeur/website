Antes de tocar una web, la mido con las tres métricas que Google usa para juzgarla: LCP, INP y CLS. ✅

LCP (Largest Contentful Paint) es cuánto tarda en pintarse el bloque más grande de la pantalla. El umbral es 2,5 segundos. Si tu home lo pasa, el resto de las optimizaciones rara vez compensan.

INP (Interaction to Next Paint) mide cuánto tarda la página en responder a un toque o a un clic. Bajo 200 milisegundos está bien; arriba de 500, la persona siente que la web está congelada.

CLS (Cumulative Layout Shift) mide cuánto salta el diseño mientras carga. El objetivo es cero: cada salto es un clic que cae en el lugar equivocado.

Los saco de PageSpeed Insights y de la pestaña de rendimiento de Chrome, en móvil y con red simulada. Los anoto con fecha en una hoja: sin línea base no hay forma de saber si un cambio sirvió.

Después busco las causas: imágenes sin servir en el formato correcto, fuentes que bloquean el render, JavaScript de terceros en el head, CSS crítico sin separar.

El orden de ataque siempre es el mismo: LCP primero, INP después, CLS al final. Se arregla uno, se vuelve a medir, se pasa al siguiente.
