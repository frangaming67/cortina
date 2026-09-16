# Hardware y mediciones

## Lo observado y lo pendiente

| Elemento | Evidencia | Decisión |
|---|---|---|
| Roller con cadena de bolitas en bucle | Fotos del mecanismo | Accionar la cadena con rueda exterior |
| Freenove FNK0025 | Etiqueta de la caja | Identificar el contenido real antes de conectar |
| Placa de control | El usuario no tiene ninguna | Propuesta: placa de desarrollo ESP32 con Wi-Fi |
| Motor y driver | No se ven fuera de la caja | Modelo, tensión y torque pendientes |
| Enchufe cercano | Sin confirmar | Resolver ubicación y alimentación |
| Hora de apertura | Confirmada por el usuario | 08:00 todos los días |

El tutorial oficial del kit contiene proyectos con motor DC, servo y paso a paso. El servo del tutorial tiene recorrido angular limitado: no es adecuado para hacer girar directamente una cadena durante varias vueltas. Un motor DC pequeño sin reducción también requiere estudiar la transmisión. Si el paso a paso dice 28BYJ-48, registrar su tensión y el driver que lo acompaña; no asumir que alcanza para esta cortina.

Reutilizables potenciales: protoboard, cables, pulsadores, resistencias y, si sus especificaciones alcanzan, motor y driver. La placa de extensión de GPIO para Raspberry Pi no sustituye a una placa programable ni se conecta directamente a un ESP32 por su conector de cinta.

## Datos a recoger antes de comprar el motor

- Fotos de motores y drivers fuera de la caja, con inscripciones, conectores y número de cables visibles.
- Ancho y alto aproximados de la cortina.
- Diámetro de una bolita y distancia **entre centros** de bolitas. Medir entre la primera y la undécima y dividir por diez mejora la estimación.
- Distancia de cadena que se debe tirar para pasar de cerrada a abierta y sentido de subida.
- Espacio para la rueda y el soporte, sin bloquear la ventana.
- Si hay enchufe cerca, distancia hasta él y etiquetas de las fuentes disponibles.
- Herramientas disponibles: regla/calibre, multímetro, soldador, acceso a impresión 3D.

## Medir fuerza

Con una balanza de equipaje o dinamómetro, medir suavemente la fuerza de tracción en el ramal que sube la cortina, siguiendo su dirección normal. Registrar el máximo al arrancar y durante el recorrido, sin tirar contra el tope. No colgar pesos ni dar tirones. Si el soporte se mueve o el mecanismo se traba, corregirlo primero.

Para la rueda que accionará la cadena:

`torque en la rueda [N·m] = fuerza de tracción [N] × radio de paso [m]`

Si la balanza indica kg de carga equivalente: `F ≈ lectura × 9,81`.

Ejemplo **hipotético**: 1 kg de lectura y 1 cm de radio requieren aproximadamente 0,098 N·m en la rueda. Para una primera selección considerar al menos el doble y revisar fricción, arranque, velocidad y régimen de trabajo. El torque de bloqueo/retención no equivale al torque disponible en movimiento. Este ejemplo no es una medición de la cortina.

Con `n` alojamientos y paso entre bolitas `p`, un punto de partida geométrico es `radio = p / (2 × sin(pi/n))`; después hay que ajustar alojamiento, holguras, contacto y retención con la cadena real. No fabricar la rueda sólo a partir de la foto.

## Arquitectura eléctrica propuesta

ESP32 → driver compatible con lógica de 3,3 V → motor con reducción. Alimentar el motor desde una fuente dimensionada para su tensión y corriente de arranque, nunca desde un GPIO. Compartir tierra cuando el driver lo requiera y verificar sus especificaciones. Seleccionar protección y cableado después de medir consumos.

Usar una fuente externa cerrada de baja tensión; el proyecto no requiere intervenir la instalación de 220 V. No asumir que la fuente de protoboard o una pila de 9 V del kit sirven para el motor final.

Un sensor debe detectar la posición **real** de apertura (por ejemplo, barra inferior y sensor fijo). Una marca que gira en el bucle de cadena puede pasar varias veces y no identifica por sí sola una posición única. El soporte y el recorrido del sensor se diseñan después de medir.

El bucle necesita fijación y resguardo; evitar que quede accesible a niños o mascotas. La rueda y su unión al motor deben tener protección contra atrapamiento y liberación manual accesible.

## Fuentes

- [Motor y driver: Freenove](https://docs.freenove.com/projects/fnk0025/en/latest/fnk0025/codes/python-lang/Motor%20%26%20Driver.html).
- [Servo del kit: Freenove](https://docs.freenove.com/projects/fnk0025/en/latest/fnk0025/codes/python-lang/Servo.html).

El circuito definitivo, la lista de compra y los pines quedan pendientes de identificar componentes y medir carga.
