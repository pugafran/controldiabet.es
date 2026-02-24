/* ═══════════════════════════════════════════
   CONTROLDIABETES — scripts.js
   ═══════════════════════════════════════════ */

var dialog     = document.getElementById("aboutDialog");
var aboutIcon  = document.getElementById("aboutIcon");
var closeButton = document.getElementById("closeButton");
var codes = [];
var themeToggle = document.getElementById("themeToggle");

let customFoods = JSON.parse(localStorage.getItem("customFoods")) || {};
let historial   = JSON.parse(localStorage.getItem("historial"))   || [];

/* ── ABOUT DIALOG ── */
aboutIcon.onclick = function () {
  dialog.showModal();
};

closeButton.onclick = function () {
  dialog.close();
};

/* ── THEME ── */
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  const icon   = document.getElementById("themeIcon");
  if (icon) {
    icon.classList.toggle("fa-moon", !isDark);
    icon.classList.toggle("fa-sun",   isDark);
  }
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

themeToggle.onclick = toggleTheme;

// Restaurar tema guardado
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  const icon = document.getElementById("themeIcon");
  if (icon) {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }
}

/* ── CARGA DE ALIMENTOS ── */
let alimentos = {};
let carbohidratosAlimentos = {};

fetch("data/alimentos.json")
  .then((response) => response.json())
  .then((data) => {
    carbohidratosAlimentos = { ...data, ...customFoods };
    alimentos = Object.keys(carbohidratosAlimentos);

    // Badge con número de alimentos
    document.getElementById("numero-alimentos").innerHTML =
      '<i class="fa-solid fa-database"></i> Datos sobre ' +
      alimentos.length +
      " alimentos de fundaciondiabetes.org";

    // jQuery autocomplete
    $(function () {
      $("#miInput").autocomplete({
        source: alimentos,
      });
    });

    renderHistorial();
  })
  .catch((error) => console.error("Error:", error));

/* ── TOTALES GLOBALES ── */
let totalCarbohidratos = 0;
let totalIndiceGlucemicoPonderado = 0;
let totalCarbohidratosPonderados  = 0;
let indiceGlucemicoMedio = 0;

/* ── CALCULAR RACIONES (manual) ── */
function calcularRaciones() {
  let alimento = document.getElementById("miInput").value;
  let gramos   = document.getElementById("gramos").value;

  if (!carbohidratosAlimentos.hasOwnProperty(alimento)) {
    alert("El alimento ingresado no se encuentra en la lista.");
    return;
  }

  if (!gramos || isNaN(gramos) || Number(gramos) < 0) {
    alert("Por favor, introduce un número válido y no negativo en los gramos.");
    return;
  }

  let carbohidratos  = (carbohidratosAlimentos[alimento].carbohidratos * gramos) / 1000;
  let indiceGlucemico = carbohidratosAlimentos[alimento].indiceGlucemico;

  agregarLineaResultado(alimento, gramos, carbohidratos, indiceGlucemico);
  actualizarResumen(carbohidratos, indiceGlucemico);
  addHistorial(alimento, gramos, carbohidratos);
}

/* ── CALCULAR RACIONES (código de barras) ── */
function calcularRacionesBarras(alimento, carbohidratos, indiceGlucemico) {
  let gramos = prompt("Ingrese la cantidad de gramos para " + alimento + ":");

  if (!gramos || isNaN(gramos) || Number(gramos) < 0) {
    alert("Por favor, introduce un número válido y no negativo en los gramos.");
    return;
  }

  let raciones = (carbohidratos * gramos) / 1000;

  agregarLineaResultado(alimento, gramos, raciones, indiceGlucemico);
  actualizarResumen(raciones, indiceGlucemico);
  addHistorial(alimento, gramos, raciones);
}

/* ── HELPER: añadir línea de resultado ── */
function agregarLineaResultado(alimento, gramos, carbohidratos, indiceGlucemico) {
  let cuadradoIndividual = document.createElement("div");
  cuadradoIndividual.style.backgroundColor = getColor(indiceGlucemico);
  cuadradoIndividual.innerText = "IG";
  cuadradoIndividual.className = "indice-glucemico-individual";

  let resultadoIndividual = document.createElement("div");
  resultadoIndividual.innerText =
    "Raciones para " + gramos + "g de " + alimento + ": " + carbohidratos.toFixed(1);
  resultadoIndividual.className = "resultado-individual";

  let resultadoLinea = document.createElement("div");
  resultadoLinea.appendChild(cuadradoIndividual);
  resultadoLinea.appendChild(resultadoIndividual);
  resultadoLinea.className = "resultado-linea";

  document.getElementById("resultado").appendChild(resultadoLinea);
}

/* ── HELPER: actualizar resumen total ── */
function actualizarResumen(carbohidratos, indiceGlucemico) {
  totalCarbohidratos            += carbohidratos;
  totalIndiceGlucemicoPonderado += indiceGlucemico * carbohidratos;
  totalCarbohidratosPonderados  += carbohidratos;

  indiceGlucemicoMedio = totalCarbohidratos === 0
    ? 0
    : totalIndiceGlucemicoPonderado / totalCarbohidratosPonderados;

  document.getElementById("cuadrado").style.backgroundColor = getColor(indiceGlucemicoMedio);
  document.getElementById("cuadrado").innerText = "IG Medio";
  document.getElementById("suma-resultado").innerText =
    "Total: " + totalCarbohidratos.toFixed(1) +
    "\nÍndice glucémico medio: " + indiceGlucemicoMedio.toFixed(1);
}

/* ── LIMPIAR ── */
function limpiar() {
  document.getElementById("miInput").value   = "";
  document.getElementById("gramos").value    = "";
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("suma-resultado").innerText = "";
  document.getElementById("cuadrado").style.backgroundColor = "";
  document.getElementById("cuadrado").innerText = "";
  totalCarbohidratos           = 0;
  totalIndiceGlucemicoPonderado = 0;
  totalCarbohidratosPonderados  = 0;
  indiceGlucemicoMedio          = 0;
}

/* ── COLOR ÍNDICE GLUCÉMICO ── */
function getColor(indiceGlucemico) {
  if (indiceGlucemico < 55)  return "#2d6a4f"; // verde
  if (indiceGlucemico < 70)  return "#e07b2a"; // naranja
  return "#c94040";                              // rojo
}

/* ── ENTER en gramos ── */
document.getElementById("gramos").addEventListener("keypress", function (e) {
  if (e.key === "Enter") calcularRaciones();
});

/* ── CÁMARA / QUAGGA ── */
var cameraDialog      = document.getElementById("cameraDialog");
var closeCameraButton = document.getElementById("closeCameraButton");

closeCameraButton.onclick = function () {
  cameraDialog.close();
  Quagga.stop();
};

function codigoBarras() {
  Quagga.init(
    {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector("#camara"),
      },
      decoder: {
        readers: ["ean_reader"],
      },
    },
    function (err) {
      if (err) { console.log(err); return; }
      Quagga.start();
    }
  );

  Quagga.onDetected(function (data) {
    var code = data.codeResult.code;
    var cameraElement = document.getElementById("camara");
    cameraElement.classList.add("detected");

    setTimeout(function () {
      cameraElement.classList.remove("detected");
    }, 1000);

    if (codes.length < 30) {
      codes.push(code);
    } else {
      Quagga.stop();

      var counts = {};
      for (var i = 0; i < codes.length; i++) {
        var num = codes[i];
        counts[num] = counts[num] ? counts[num] + 1 : 1;
      }

      var mostCommonCode = Object.keys(counts).reduce(function (a, b) {
        return counts[a] > counts[b] ? a : b;
      });

      obtenerDatosCarbohidratos(mostCommonCode);
      cameraDialog.close();
      Quagga.offDetected();
    }
  });
}

function openCameraDialog() {
  cameraDialog.showModal();
  codes = [];
  codigoBarras();
}

async function obtenerDatosCarbohidratos(codigoBarras) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${codigoBarras}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al leer el código de barras, inténtelo de nuevo");
    const data = await response.json();
    const nombre           = data.product.product_name;
    const carbohydrates_100g = data.product.nutriments.carbohydrates_100g;
    calcularRacionesBarras(nombre, carbohydrates_100g, 0);
  } catch (error) {
    alert(error.message);
  }
}

/* ── AÑADIR ALIMENTO PERSONALIZADO ── */
function agregarAlimento() {
  let nombre = prompt("Nombre del alimento:");
  if (!nombre) return;

  let carb = parseFloat(prompt("Carbohidratos por 100g:"));
  if (isNaN(carb)) { alert("Valor de carbohidratos no válido"); return; }

  let ig = parseFloat(prompt("Índice glucémico:"));
  if (isNaN(ig)) ig = 0;

  customFoods[nombre] = { carbohidratos: carb, indiceGlucemico: ig };
  localStorage.setItem("customFoods", JSON.stringify(customFoods));
  carbohidratosAlimentos[nombre] = { carbohidratos: carb, indiceGlucemico: ig };
  alimentos.push(nombre);
  $("#miInput").autocomplete("option", "source", alimentos);
  alert("Alimento añadido");
}

/* ── HISTORIAL ── */
function addHistorial(alimento, gramos, raciones) {
  historial.push({ alimento, gramos, raciones });
  localStorage.setItem("historial", JSON.stringify(historial));
  renderHistorial();
}

function renderHistorial() {
  const lista = document.getElementById("historial");
  const empty = document.getElementById("historial-empty");
  if (!lista) return;

  lista.innerHTML = "";

  if (historial.length === 0) {
    if (empty) empty.style.display = "flex";
    return;
  }

  if (empty) empty.style.display = "none";

  historial.forEach(function (item) {
    const li = document.createElement("li");
    li.className = "historial-item";
    li.innerHTML =
      '<div>' +
        '<div class="h-name">' + item.alimento + '</div>' +
        '<div class="h-gramos">' + item.gramos + ' g</div>' +
      '</div>' +
      '<div class="h-raciones">' + parseFloat(item.raciones).toFixed(1) + ' rac.</div>';
    lista.appendChild(li);
  });
}

/* ── EXPORT PDF ── */
function exportarPDF() {
  if (historial.length === 0) {
    alert("No hay historial para exportar");
    return;
  }
  const doc = new jsPDF();
  doc.text("Historial de comidas", 10, 10);
  historial.forEach(function (item, index) {
    doc.text(
      item.gramos + "g de " + item.alimento + ": " + parseFloat(item.raciones).toFixed(1) + " raciones",
      10,
      20 + index * 10
    );
  });
  doc.save("historial.pdf");
}

/* ── FAVICON DINÁMICO ── */
var titulo  = document.title;
var favicon = document.getElementById("favicon");

window.addEventListener("blur", function () {
  favicon.href  = "data/warning.gif";
  document.title = "¡Vuelve! 🚨";
});

window.addEventListener("focus", function () {
  favicon.href  = "data/icono.ico";
  document.title = titulo;
});