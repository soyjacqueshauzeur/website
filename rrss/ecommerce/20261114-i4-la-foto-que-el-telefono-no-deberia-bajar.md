Dos formas de mostrar la misma foto en el móvil, con resultados opuestos. ✅

La primera: subes la imagen de 3000 píxeles que salió de la cámara y el CSS la encoge al ancho de la pantalla. Se ve perfecta. El teléfono igual descarga los 3 MB completos.

La segunda: usas srcset y sizes para que el navegador elija el archivo según el ancho real, y sirves WebP o AVIF en lugar de JPEG. La misma foto se ve igual y pesa una décima parte.

La diferencia se nota en el LCP, porque la imagen grande de la portada suele ser justo el bloque más grande de la página. También en el CLS: sin width y height declarados, el navegador no reserva el espacio y el diseño salta cuando la foto llega.

Y si la imagen está debajo del pliegue, loading="lazy" evita que se descargue antes de tiempo.

En la portada, en cambio, lazy es un error: retrasa justo lo que la persona vino a ver. Es el detalle que más se copia mal cuando alguien lee "pon lazy en todas las imágenes".

Todo esto se prueba con el throttling de red en móvil, no con la conexión de la oficina.
