# Diseño del control

## Alcance de esta versión

`cortina/controller.py` es un modelo de referencia en Python para computadora. No es firmware ESP32 ni incorpora GPIO. Permite acordar el comportamiento antes de elegir el hardware. `cortina/simulate.py` utiliza reloj, motor y sensores simulados; `tests/` verifica las decisiones del controlador.

## Comportamiento implementado en el modelo

- Hora configurada: 08:00 local, todos los días, sin filtro de fines de semana.
- Sólo dispara dentro de ese minuto; no recupera aperturas atrasadas al mediodía.
- No inicia sin reloj válido, con fallo enclavado o si el sensor ya indica abierta.
- Guarda la fecha del intento antes de ordenar movimiento. Si no se puede guardar, no arranca.
- Nunca repite una fecha ya registrada, incluso si el reloj retrocede.
- El sensor de apertura detiene el motor; el tiempo máximo es una segunda condición de corte.
- Una orden de parada tiene prioridad sobre el horario y el sensor.
- Después de fallo o parada requiere reinicialización explícita; tampoco reintenta automáticamente ese día.
- El tiempo máximo usa reloj monotónico, independiente de cambios de hora civil.

La persistencia se representa mediante una función inyectada; el demo la mantiene en memoria. En un equipo real tendrá que ser durable y atómica. Las pruebas de reinicio suministran la última fecha guardada a una nueva instancia.

## Pendiente para firmware

1. Elegir modelo de ESP32 y entorno (MicroPython es una opción; este modelo usa módulos de CPython y no se copia sin adaptar).
2. Guardar configuración y fecha de intento en almacenamiento durable; detectar corrupción y bloquear apertura automática si la hay.
3. Obtener UTC por NTP y convertir a hora local. Confirmar Argentina UTC−03:00; agregar reloj RTC con batería si se necesita recuperar la hora tras cortes sin Internet. Una pérdida breve de Wi-Fi no debería invalidar un reloj ya sincronizado; definir antigüedad máxima aceptable.
4. Adaptador de motor no bloqueante, apagado por defecto, apagado ante excepciones y watchdog. El modelo presupone que el adaptador puede ejecutar `stop()`; eso no protege frente a fallos eléctricos.
5. Final de carrera, botón de parada y diagnóstico de cables/sensores. Definir cableado y antirrebote según los componentes.
6. Calibrar dirección, recorrido y tiempo máximo. Detectar atascos por corriente o movimiento según motor; un temporizador por sí solo no los detecta inmediatamente.
7. Diseñar corte físico de potencia y liberación manual. Verificar que el mecanismo sostiene la cortina con el motor desenergizado.

## Verificación del montaje antes de automatizar

Con supervisión: dirección correcta; sensor detiene antes del tope; parada accesible; liberación manual; atasco; desconexión de sensor; reinicio a mitad de recorrido; ausencia de Wi-Fi; hora inválida; corte y retorno de alimentación; varios ciclos completos sin saltos de cadena ni calentamiento excesivo. Medir comportamiento real y ajustar. No dejarlo funcionando solo hasta resolver esas pruebas.

El cierre automático y una interfaz web quedan fuera de esta primera etapa. Abrir cada mañana no implica cerrar automáticamente por la noche.
