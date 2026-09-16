# Motor propuesto para una tracción supuesta de 2 kgf

El usuario pidió elegir un motor con margen suponiendo que hacen falta «2 kg». Interpretamos **2 kgf de tracción en la cadena**, aproximadamente 19,6 N, no masa de la tela. No es un resultado medido.

## Selección preliminar

[Pololu #4755: motorreductor 37D, 12 V, 100:1, con encoder](https://www.pololu.com/product/4755).

Datos del fabricante: 100 rpm sin carga, eje D de 6 mm, límite recomendado para cargas continuas de 10 kgf·cm y corriente de bloqueo extrapolada de 5,5 A. Los 34 kgf·cm anunciados son de bloqueo extrapolado, no torque utilizable en funcionamiento normal. El fabricante también recomienda trabajar al 25 % o menos de la corriente de bloqueo; comprobar corriente y temperatura durante las pruebas. El límite mecánico de la reductora por sí solo no constituye una garantía térmica.

## Cálculo del montaje propuesto

Proponemos una rueda para cadena de bolitas de **3 cm de diámetro efectivo**, medidos en la trayectoria de los centros de las bolitas. Radio: 1,5 cm. El diámetro exterior de la pieza puede ser diferente. Falta medir el paso de la cadena para dibujar los alojamientos.

`torque requerido = 2 kgf × 1,5 cm = 3 kgf·cm ≈ 0,294 N·m`

La relación entre el límite recomendado de la reductora y la carga supuesta es `10 / 3 ≈ 3,3`. Es un margen mecánico preliminar; no incluye una medición de rozamientos adicionales, arranque o atascos ni sustituye verificar el consumo. Se buscará una transmisión sin sobrecargar lateralmente el eje y con liberación manual.

| Diámetro efectivo de rueda | Torque para 2 kgf |
|---|---|
| 3 cm, propuesta | 3 kgf·cm |
| 4 cm | 4 kgf·cm |
| 6 cm | 6 kgf·cm |

Con una rueda más grande aumenta el torque necesario. El tamaño del tubo superior de la cortina no se usa aquí: se está dimensionando la rueda exterior que tira de la cadena.

## Componentes y trabajo adicionales

- ESP32 y driver para motor DC. Como referencia, [Pololu VNH5019 #1451](https://www.pololu.com/product/1451): puente H, compatible con lógica de 3,3 V, alimentación 5,5–24 V y salida nominal de 12 A continuos bajo las condiciones del fabricante. El ULN2003 del kit no sustituye a este driver.
- Fuente o batería con salida apropiada de 12 V, dimensionada para los transitorios de arranque; referencia de bloqueo del motor: 5,5 A. Agregar regulación separada para la placa. No conectar 12 V al pin de 3,3 V del ESP32.
- Si usamos el encoder, adaptar sus señales a 3,3 V: se alimenta a partir de 3,5 V y sus salidas alcanzan su alimentación según la ficha. No conectarlas directamente al ESP32 sin adaptar.
- Rueda para las bolitas, acople, soporte firme y liberación manual. Regular velocidad por PWM y comprobar arranque bajo carga. No asumir que la reductora mantiene por sí sola la posición al apagarla.
- Final de carrera y parada por sobrecorriente/atasco calibrada. El margen de fuerza debe permitir mover la cortina, sin aplicar toda la fuerza disponible contra un tope. El encoder ayuda a detectar falta de movimiento, pero no reemplaza el sensor de apertura.

Se mantiene abierta la elección entre cable de unos 3 metros y batería. No hay autonomía estimada. Esta selección no implica compra realizada, disponibilidad local confirmada ni firmware listo.
