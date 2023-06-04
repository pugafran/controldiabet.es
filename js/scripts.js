
var dialog = document.getElementById('aboutDialog');
var aboutIcon = document.getElementById('aboutIcon');
var closeButton = document.getElementById('closeButton');

aboutIcon.onclick = function() {
    dialog.showModal();
}

closeButton.onclick = function() {
    dialog.close();
}




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

  function calcularRacionesBarras(alimento, carbohidratos, indiceGlucemico) {
    
    let gramos = prompt('Ingrese la cantidad de gramos para ' + alimento + ':');
  
      if (!gramos || isNaN(gramos) || Number(gramos) < 0) {
        alert('Por favor, introduce un número válido y no negativo en los gramos.');
        return;
      }

    
  
    let raciones = carbohidratos * gramos / 1000;
  
    let cuadradoIndividual = document.createElement("div");
    cuadradoIndividual.style.backgroundColor = getColor(indiceGlucemico);
    cuadradoIndividual.innerText = "IG";
    cuadradoIndividual.className = "indice-glucemico-individual";
  
    let resultadoIndividual = document.createElement("div");
    resultadoIndividual.innerText = 'Raciones para ' + gramos + 'g de ' + alimento + ': ' + raciones.toFixed(1);
    resultadoIndividual.style.display = 'inline-block';
    resultadoIndividual.style.marginLeft = '5px';
  
    let resultadoLinea = document.createElement("div");
    resultadoLinea.appendChild(cuadradoIndividual);
    resultadoLinea.appendChild(resultadoIndividual);
    resultadoLinea.className = "resultado-linea";
  
    document.getElementById("resultado").appendChild(resultadoLinea);
  
    totalCarbohidratos += raciones;
    totalIndiceGlucemicoPonderado += indiceGlucemico * raciones;
    totalCarbohidratosPonderados += raciones;
    if (totalCarbohidratos == 0)
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


  var cameraDialog = document.getElementById('cameraDialog');
  var closeCameraButton = document.getElementById('closeCameraButton');

  closeCameraButton.onclick = function() {
    cameraDialog.close();
    Quagga.stop(); // Detén Quagga cuando se cierre el diálogo
}



function codigoBarras(){

  var codes = [];

  Quagga.init({
    inputStream : {
      name : "Live",
      type : "LiveStream",
      target: document.querySelector("#camara") // Selecciona el elemento por su ID
    },
    decoder : {
      readers : ["ean_reader"] // Asegúrate de que estás utilizando el lector correcto
    }
  }, function(err) {
      if (err) {
          console.log(err);
          return
      }
      console.log("Initialization finished. Ready to start");
      Quagga.start();
  });

  Quagga.onDetected(function(data) {
    var code = data.codeResult.code;
    console.log("Code: " + code);
    var cameraElement = document.getElementById('camara');
    cameraElement.classList.add('detected');

    // Cambia el color del borde a verde durante 1 segundo
    setTimeout(function() {
        cameraElement.classList.remove('detected');
    }, 1000);

    // Guardar sólo 10 códigos
    if(codes.length < 30) {
        codes.push(code);
    } else {
        Quagga.stop();
        // Una vez que tenemos 10 códigos, encontramos el más común
        var counts = {};
        for(var i = 0; i < codes.length; i++) {
            var num = codes[i];
            counts[num] = counts[num] ? counts[num] + 1 : 1;
        }
        
        // Encontrar el código que más se repite
        var mostCommonCode = Object.keys(counts).reduce(function(a, b){ return counts[a] > counts[b] ? a : b });
        obtenerDatosCarbohidratos(mostCommonCode);
        console.log("Código más común: " + mostCommonCode);
        document.getElementById("camara").style.visibility = 'hidden';
        cameraDialog.close(); // Cierra el diálogo cuando Quagga se detiene
    }
  });
  
}

function openCameraDialog(){
  cameraDialog.showModal(); // Muestra el diálogo antes de iniciar Quagga
  codigoBarras(); // Luego inicia Quagga
}



async function obtenerDatosCarbohidratos(codigoBarras) {

  const url = `https://world.openfoodfacts.org/api/v2/product/${codigoBarras}`;
  fetch(url)
  .then(response => response.json())
  .then(data => {
    const nombre = data.product.product_name;
    const carbohydrates_100g = data.product.nutriments.carbohydrates_100g;
    
    calcularRacionesBarras(nombre,carbohydrates_100g,0);

  })
  .catch(error => console.error('Error:', error));






}

  