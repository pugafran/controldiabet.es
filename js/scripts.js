



  let alimentos = {};
  let carbohidratosAlimentos = {};

  fetch('data/alimentos.json')
      .then(response => response.json())
      .then(data => {
          carbohidratosAlimentos = data;
          alimentos = Object.keys(data);
          document.getElementById("numero-alimentos").innerHTML = 'Datos sobre ' + alimentos.length + ' alimentos extraidos de fundaciondiabetes.org';

          $(function() {
              $("#miInput").autocomplete({
                  source: alimentos
              });
          });
      })
      .catch(error => console.error('Error:', error));



    
    

  let totalCarbohidratos = 0;  // Variable global para mantener el total
  let totalComidas = 0;
  let totalIndiceGlucemicoPonderado = 0;
  let totalCarbohidratosPonderados = 0;
  let indiceGlucemicoMedio = 0;

  function calcularRaciones() {
    let alimento = document.getElementById("miInput").value;
    let gramos = document.getElementById("gramos").value;

    if(!carbohidratosAlimentos.hasOwnProperty(alimento)){
        alert('El alimento ingresado no se encuentra en la lista.');
        return;
    }

    if (!gramos || isNaN(gramos) || Number(gramos) < 0) {
        alert('Por favor, introduce un número válido y no negativo en los gramos.');
        return;
    }

    let carbohidratos = carbohidratosAlimentos[alimento].carbohidratos * gramos / 1000;
    let indiceGlucemico = carbohidratosAlimentos[alimento].indiceGlucemico;

    let cuadradoIndividual = document.createElement("div");
    cuadradoIndividual.style.backgroundColor = getColor(indiceGlucemico);
    cuadradoIndividual.innerText = "IG";
    cuadradoIndividual.className = "indice-glucemico-individual";
    
    let resultadoIndividual = document.createElement("div");
    
    resultadoIndividual.innerText = 'Raciones para ' + gramos + 'g de ' + alimento + ': ' + carbohidratos.toFixed(1);
    resultadoIndividual.style.display = 'inline-block'; 
    resultadoIndividual.style.marginLeft = '5px';       

    // Crear un nuevo div para contener el cuadrado y el texto, y añadirlos a él
    let resultadoLinea = document.createElement("div");
    resultadoLinea.appendChild(cuadradoIndividual);
    resultadoLinea.appendChild(resultadoIndividual);
    resultadoLinea.className = "resultado-linea";

    // Añadir el nuevo div a "#resultado"
    document.getElementById("resultado").appendChild(resultadoLinea);

    totalCarbohidratos += carbohidratos;
    totalIndiceGlucemicoPonderado += indiceGlucemico * carbohidratos;
    totalCarbohidratosPonderados += carbohidratos;
    if(totalCarbohidratos == 0)
      indiceGlucemicoMedio = 0;
    else
      indiceGlucemicoMedio = totalIndiceGlucemicoPonderado / totalCarbohidratosPonderados;

    document.getElementById("cuadrado").style.backgroundColor = getColor(indiceGlucemicoMedio);
    document.getElementById("cuadrado").innerText = "IG Medio";
    document.getElementById("suma-resultado").innerText = 'Total: ' + totalCarbohidratos.toFixed(1) + "\nÍndice glucémico medio: " + indiceGlucemicoMedio.toFixed(1);
  }

  function limpiar(){
      document.getElementById("miInput").value = '';
      document.getElementById("gramos").value = '';
      document.getElementById("resultado").innerText = '';
      document.getElementById("suma-resultado").innerText = '';
      document.getElementById("cuadrado").style.backgroundColor = "#f8f9fa";
      document.getElementById("cuadrado").innerText = '';
      totalCarbohidratos = 0;  // Restablecer la variable global
      totalIndiceGlucemico = 0;
      totalComidas = 0;
  }

  function getColor(indiceGlucemico) {
    if(indiceGlucemico < 55) {
    return "green";
    } else if(indiceGlucemico < 70) {
    return "orange";
    } else {
    return "red";
    }
    }

  document.getElementById('gramos').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        calcularRaciones();
    }
  });




