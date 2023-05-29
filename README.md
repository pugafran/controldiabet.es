# Controldiabet.es

Bienvenido al repositorio de ControlDiabet.es, una web dedicada a mejorar la vida de las personas que viven con diabetes.

El objetivo es proporcionar herramientas y recursos que ayuden a las personas con diabetes a manejar su condición de manera efectiva y vivir una vida saludable.

## Características

Actualmente, la web incluye:

- **Calculadora de raciones**: Esta herramienta permite a los usuarios calcular la cantidad de raciones de carbohidratos en sus comidas, esto puede ayudar a las personas con diabetes a planificar sus comidas y a mantener su nivel de glucosa en sangre bajo control.

![image](https://github.com/pugafran/controldiabet.es/assets/67395721/0d00f1b7-e216-47ab-a625-baa6e94420ba)

## Contribuciones
Los datos de los alimentos disponibles se hallan en `data/alimentos.json`, muchos se añadieron a mano pero otros muchos otros fueron indexados utilizando chatGPT, de vez en cuando hago revisiones para ver si el valor está bien pero es posible que haya algún valor incorrecto.

Si crees que hay un valor erróneo o quieres añadir algún alimento que se me ha escapado se agradece un pull request, si no tienes conocimientos para ello mándame un mensaje a `puga@puga.page`.

Los carbohidratos de `data/alimentos.json` se calcula como 1000/(La columna [1 ración de HC son (en gramos)] de fundaciondiabetes.org), si el valor obtenido no coincide con el del .json, el valor del json está mal.
