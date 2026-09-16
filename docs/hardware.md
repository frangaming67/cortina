# Hardware y mediciones

## Lo observado y lo pendiente

| Elemento | Evidencia | Decisión |
|---|---|---|
| Roller con cadena de bolitas en bucle | Fotos del mecanismo | Accionar la cadena con rueda exterior |
| Freenove FNK0025 | Etiqueta de la caja y fotos de componentes | Inventario inicial registrado abajo |
| Placa de control | El usuario no tiene ninguna | Propuesta: placa de desarrollo ESP32 con Wi-Fi |
| Motor paso a paso | Etiqueta legible: 28BYJ-48, 5VDC; cinco cables | Candidato para pruebas; fuerza útil pendiente de medir |
| Driver del paso a paso | Placa con IN1–IN7, conector blanco y cuatro LED; chip bajo bolsa reflectante | Parece ULN2003; confirmar inscripción y conexiones |
| Enchufe | Aproximadamente 3 metros, según el usuario | Cable de baja tensión o batería; ambas alternativas abiertas |
| Esfuerzo de subida | El usuario describe la cadena como «medio dura» | Medir fuerza; aumenta la posibilidad de necesitar un motor más potente |
| Hora de apertura | Confirmada por el usuario | 08:00 todos los días |

## Inventario observado en las nuevas fotos

| Foto | Componente | Utilidad para el proyecto |
|---|---|---|
| 1: placa en bolsa | Driver aparentemente ULN2003 | Candidato para accionar el paso a paso; confirmar chip fuera de la bolsa |
| 2: palanquita negra | Joystick de dos ejes con pulsador | Opcional para mando manual; no es un motor |
| 3: motor redondo | 28BYJ-48, **5 V DC**, cinco cables | Primera prueba de movimiento; no garantiza poder subir la cortina |
| 4: pieza azul | Microservo, modelo no legible | No seleccionado para arrastre continuo; confirmar si es posicional |
| 4: placa verde | Módulo ADC ADS7830, según serigrafía | Lee señales analógicas; no controla la potencia del motor |
| 5: motor rectangular | Motor DC pequeño, sin reductora visible | Necesitaría transmisión y driver adecuados; tensión y modelo desconocidos |

El tutorial oficial del kit contiene proyectos con motor DC, servo y paso a paso. El servo del tutorial tiene recorrido angular limitado: no es adecuado para hacer girar directamente una cadena durante varias vueltas. La foto del servo no permite asegurar su modelo exacto. El motor DC pequeño requiere estudiar reducción y fuerza. El 28BYJ-48 de 5 V es el candidato para experimentar, no una selección definitiva para esta cortina.

La marca de alimentación de la placa del driver no cambia la tensión del motor: el ejemplar fotografiado dice **5VDC**, por lo que no debe alimentarse con 12 V. No conectar componentes mientras el driver siga dentro de la bolsa. Confirmar polaridad, tierra y orden de entradas antes del primer ensayo.

Reutilizables potenciales: protoboard, cables, pulsadores, resistencias y, si sus especificaciones alcanzan, motor y driver. La placa de extensión de GPIO para Raspberry Pi no sustituye a una placa programable ni se conecta directamente a un ESP32 por su conector de cinta.

## Datos a recoger antes de comprar el motor

- Inscripción del chip del driver fuera de la bolsa y foto clara de sus bornes de alimentación. El paso a paso ya está identificado.
- Ancho y alto aproximados de la cortina.
- Diámetro de una bolita y distancia **entre centros** de bolitas. Medir entre la primera y la undécima y dividir por diez mejora la estimación.
- Distancia de cadena que se debe tirar para pasar de cerrada a abierta y sentido de subida.
- Espacio para la rueda y el soporte, sin bloquear la ventana.
- Distancia al enchufe lejano, recorrido posible del cable y etiquetas de fuentes o baterías disponibles.
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

## Alimentación con el enchufe lejos

El usuario estima unos 3 metros hasta el enchufe y acepta la posibilidad de batería. La longitud del cable por pared/marco puede ser mayor. No se ha elegido batería ni fuente y no hay estimación de autonomía real.

**Opción inicial si se admite cable:** fuente cerrada en el enchufe y cable de baja tensión sujeto por pared/marco hasta el conjunto. Evita recargar baterías. Elegir sección y tensión de distribución según longitud y consumo; no asumir que cualquier cable USB largo mantiene 5 V al arrancar el motor. Medir la tensión en el driver bajo carga. Para recorridos largos se puede estudiar una tensión de distribución mayor y un convertidor regulado a 5 V junto al motor; nunca conectar esa tensión mayor directamente al 28BYJ-48 de 5 V.

**Opción si no se admite cable:** batería recargable con protección, cargador y regulación adecuados. Elegir placa de bajo consumo; apagar las bobinas al terminar y dormir el controlador entre aperturas. Esto sólo es válido si se comprueba que el mecanismo mantiene la cortina sin energía. Hay que resolver también el despertar del mando manual y el mantenimiento de la hora durante el reposo.

Una power bank común puede apagar su salida cuando el ESP32 duerme y consume muy poco; en ese caso el temporizador de la placa no puede despertarla porque perdió alimentación. Algunos modos de baja corriente también tienen límite de tiempo: Anker documenta un apagado a las dos horas para su modo descrito en la fuente de abajo. Elegir un modelo que sostenga la salida continuamente y verificarlo durante más de 24 horas con el consumo real. No se asume que cualquier power bank sirve.

Para dimensionar batería, medir corriente en reposo, consumo durante Wi-Fi y durante el movimiento. Calcular energía diaria de cada fase como `V × A × horas`, sumar y considerar pérdidas y capacidad útil en Wh. Los mAh anunciados para la celda interna no equivalen a los mAh disponibles a 5 V. No prometer semanas o meses de autonomía antes de esas mediciones.

El primer ensayo se hará sobre la mesa con 5 V regulados y sin la cadena; después se evaluará fuerza con un montaje supervisado. No hace falta comprar otro motor antes de medir, pero sí una placa programable para continuar con firmware.

## Decisión tras conocer la resistencia de la cadena

La descripción «medio dura» no permite calcular torque, pero hace menos favorable usar directamente el pequeño 28BYJ-48. Se conserva para ensayos de programación. Para el montaje final, evaluar un motorreductor con torque suficiente a la velocidad de trabajo, junto con su driver y alimentación, después de medir. Una reducción adicional puede aumentar fuerza a cambio de lentitud y pérdidas; no garantiza que este motor resulte práctico.

Comprobar primero que la cadena no roce o se trabe y que los soportes estén firmes. Si hay balanza de equipaje, seguir la medición de fuerza de este documento y registrar el máximo. Si no hay, dejar el torque como pendiente y conseguir una prestada antes de elegir el motor final. No deducir la fuerza sólo del tamaño de la cortina ni probar motores empujando contra el tope.

## Fuentes

- [Motor y driver: Freenove](https://docs.freenove.com/projects/fnk0025/en/latest/fnk0025/codes/python-lang/Motor%20%26%20Driver.html).
- [Servo del kit: Freenove](https://docs.freenove.com/projects/fnk0025/en/latest/fnk0025/codes/python-lang/Servo.html).
- [ULN2003A: especificaciones de Texas Instruments](https://www.ti.com/product/ULN2003A). Confirmar que el chip fotografiado corresponde a esa familia y verificar entrada a 3,3 V para la corriente prevista.
- [ADS7830: conversor analógico-digital, Texas Instruments](https://www.ti.com/product/ADS7830).
- [Modo de baja corriente y límite de tiempo: Anker](https://service.anker.com/fr/article-description/What-is-Trickle-Charging-Mode).

El circuito definitivo, la lista de compra y los pines quedan pendientes de identificar componentes y medir carga.
