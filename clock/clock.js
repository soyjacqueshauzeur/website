/* time — hora y fecha.
 *
 * Usa la hora local del dispositivo. Un navegador no puede hablar NTP por UDP;
 * si el equipo sincroniza su reloj (lo normal), esta hora también es exacta.
 *
 * Para otro idioma, cambia WEEKDAYS y MONTHS.
 */
(function () {
  "use strict";

  var clockEl = document.getElementById("clock");
  var dateEl = document.getElementById("date");
  if (!clockEl || !dateEl) return;

  var WEEKDAYS = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
  ];
  var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  /* Semana ISO 8601 (la misma que usa time.is). */
  function isoWeek(date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function render(now) {
    var hh = pad2(now.getHours());
    var mm = pad2(now.getMinutes());
    var ss = pad2(now.getSeconds());

    clockEl.textContent = hh + ":" + mm + ":" + ss;
    clockEl.setAttribute(
      "datetime",
      now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate()) +
        "T" + hh + ":" + mm + ":" + ss
    );

    var weekday = WEEKDAYS[(now.getDay() + 6) % 7]; /* 0 = lunes */
    var week = isoWeek(now);
    dateEl.textContent =
      weekday + ", " + now.getDate() + " " + MONTHS[now.getMonth()] + ", " +
      now.getFullYear() + ", week " + week;
    dateEl.setAttribute(
      "datetime",
      now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate())
    );
    dateEl.setAttribute("data-week", String(week));
  }

  /* Se reprograma al inicio del siguiente segundo para no acumular deriva. */
  function tick() {
    var now = new Date();
    render(now);
    setTimeout(tick, 1000 - now.getMilliseconds());
  }

  /* Al volver a la pestaña, refresca sin esperar al temporizador. */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render(new Date());
  });

  tick();
})();
