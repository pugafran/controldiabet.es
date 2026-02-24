// Función para imprimir una lista
function imprimirLista(lista) {
    console.log("Lista:", lista);
  }
  
  // Función para encontrar el valor máximo en una lista
  function encontrarMaximo(lista) {
    let maximo = lista[0];
    for (let i = 1; i < lista.length; i++) {
      if (lista[i] > maximo) {
        maximo = lista[i];
      }
    }
    return maximo;
  }
  
  // Función para calcular la suma de los elementos en una lista
  function calcularSuma(lista) {
    let suma = 0;
    for (let i = 0; i < lista.length; i++) {
      suma += lista[i];
    }
    return suma;
  }
  
  // Crear una lista de números
  const lista = [1, 2, 3, 4, 5];
  
  // Imprimir la lista
  imprimirLista(lista);
  
  // Calcular la suma de los elementos
  const suma = calcularSuma(lista);
  console.log("La suma de los elementos es:", suma);
  
  // Encontrar el valor máximo en la lista
  const maximo = encontrarMaximo(lista);
  console.log("El valor máximo es:", maximo);

  // ----------------------------------------------------------
  
  const readline = require('readline');

// Crear una interfaz para leer datos de la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Solicitar al usuario una lista de números
rl.question("Ingrese una lista de números separados por comas: ", (input) => {
  // Convertir el input en una lista de números
  const lista = input.split(",").map(Number);

  // Imprimir la lista
  imprimirLista(lista);

  // Calcular la suma de los elementos
  const suma = calcularSuma(lista);
  console.log("La suma de los elementos es:", suma);

  // Encontrar el valor máximo en la lista
  const maximo = encontrarMaximo(lista);
  console.log("El valor máximo es:", maximo);

  // Cerrar la interfaz de lectura
  rl.close();
});
