# Simulador web

La vista 3D está en `web/` y se publica como una página estática. Abre una escena conceptual del roller, la cadena de bolitas, una rueda de arrastre, un motor y su driver. Arrastrar la escena gira la cámara; la rueda del mouse acerca o aleja.

## Qué podés probar

- `Abrir cortina`, `Cerrar` y `Parar` mueven el modelo con una aceleración visual configurable.
- `Probar las 08:00` parte de la cortina cerrada a las 07:59:50 y espera al minuto de las 08:00 en el reloj simulado.
- El selector de motor compara el 28BYJ-48 del kit, el Pololu 37D propuesto, un sinfín y un motor a medida.
- Los controles de fuerza, diámetro de rueda y recorrido actualizan torque requerido, margen y tiempo estimado.
- `Simular un atasco` corta el movimiento y deja el estado bloqueado hasta reiniciar.
- `Separar motor` desplaza el conjunto para inspeccionar el montaje conceptual.

## Cómo leer los resultados

La fuerza se expresa en kgf y el torque en kgf·cm. El cálculo base es `torque = fuerza × diámetro / 2`. El margen es torque de trabajo del motor dividido por torque requerido. Los tiempos de motor DC son una aproximación lineal entre velocidad sin carga y carga; los demás valores son ilustrativos.

Los números no sustituyen una medición de tu cadena ni certifican un motor. La escena no tiene las dimensiones de tu cortina, no modela temperatura, corriente, batería, flexión ni atascos reales y no envía órdenes a hardware. El archivo `web/src/model.js` contiene los valores y las ecuaciones para revisarlos.

## Desarrollo

```console
npm install
npm run dev
npm run build
npm test
```

El simulador no requiere fotos personales. La URL del proyecto enlazada en la página es el repositorio de GitHub de Cortina Lab.
