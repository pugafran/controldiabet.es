var dialog = document.getElementById("aboutDialog");
var aboutIcon = document.getElementById("aboutIcon");
var closeButton = document.getElementById("closeButton");
var codes = [];
var themeToggle = document.getElementById("themeToggle");
let customFoods = JSON.parse(localStorage.getItem("customFoods")) || {};
let historial = JSON.parse(localStorage.getItem("historial")) || [];
let cachedProducts = JSON.parse(localStorage.getItem("cachedProducts")) || {};

aboutIcon.onclick = function () {
  dialog.showModal();
};

closeButton.onclick = function () {
  dialog.close();
};

themeToggle.onclick = function () {
  toggleTheme();
};

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.classList.remove("fa-moon");
  themeToggle.classList.add("fa-sun");
}

let alimentos = {};
let carbohidratosAlimentos = {};

fetch("data/alimentos.json")
  .then((response) => response.json())
  .then((data) => {
    carbohidratosAlimentos = { ...data, ...customFoods };
    alimentos = Object.keys(carbohidratosAlimentos);
    document.getElementById("numero-alimentos").innerHTML =
      "Datos sobre " +
      alimentos.length +
      " alimentos extraidos de fundaciondiabetes.org";

    $(function () {
      $("#miInput").autocomplete({
        source: alimentos,
      });
    });
    renderHistorial();
  })
  .catch((error) => console.error("Error:", error));

let totalCarbohidratos = 0; // Variable global para mantener el total
let totalComidas = 0;
let totalIndiceGlucemicoPonderado = 0;
let totalCarbohidratosPonderados = 0;
let indiceGlucemicoMedio = 0;

function _normalizeFoodKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function calcularRaciones() {
  let alimentoRaw = document.getElementById("miInput").value;
  let gramos = document.getElementById("gramos").value;

  // Case/diacritics-insensitive matching.
  const foodKey = _normalizeFoodKey(alimentoRaw);
  let alimento = alimentoRaw;
  if (!carbohidratosAlimentos.hasOwnProperty(alimento)) {
    const map = {};
    for (const k of Object.keys(carbohidratosAlimentos)) map[_normalizeFoodKey(k)] = k;
    if (map[foodKey]) alimento = map[foodKey];
  }

  if (!carbohidratosAlimentos.hasOwnProperty(alimento)) {
    alert("El alimento ingresado no se encuentra en la lista.");
    return;
  }

  if (!gramos || isNaN(gramos) || Number(gramos) < 0) {
    alert("Por favor, introduce un número válido y no negativo en los gramos.");
    return;
  }

  let carbohidratos =
    (carbohidratosAlimentos[alimento].carbohidratos * gramos) / 1000;
  let indiceGlucemico = carbohidratosAlimentos[alimento].indiceGlucemico;

  let cuadradoIndividual = document.createElement("div");
  cuadradoIndividual.style.backgroundColor = getColor(indiceGlucemico);
  cuadradoIndividual.innerText = "IG";
  cuadradoIndividual.className = "indice-glucemico-individual";

  let resultadoIndividual = document.createElement("div");

  const hc = carbohidratos * 10;
  resultadoIndividual.innerText =
    "Raciones para " +
    gramos +
    "g de " +
    alimento +
    ": " +
    carbohidratos.toFixed(1) +
    " (" +
    hc.toFixed(1) +
    " HC)";
  resultadoIndividual.style.display = "inline-block";
  resultadoIndividual.style.marginLeft = "5px";

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
  if (totalCarbohidratos == 0) indiceGlucemicoMedio = 0;
  else
    indiceGlucemicoMedio =
      totalIndiceGlucemicoPonderado / totalCarbohidratosPonderados;

  document.getElementById("cuadrado").style.backgroundColor =
    getColor(indiceGlucemicoMedio);
  document.getElementById("cuadrado").innerText = "IG Medio";
  document.getElementById("suma-resultado").innerText =
    "Total: " +
    totalCarbohidratos.toFixed(1) +
    "\nÍndice glucémico medio: " +
    indiceGlucemicoMedio.toFixed(1);

  addHistorial(alimento, gramos, carbohidratos);
}

function calcularRacionesBarras(alimento, carbohidratos, indiceGlucemico) {
  let gramos = prompt("Ingrese la cantidad de gramos para " + alimento + ":");

  if (!gramos || isNaN(gramos) || Number(gramos) < 0) {
    alert("Por favor, introduce un número válido y no negativo en los gramos.");
    return;
  }

  let raciones = (carbohidratos * gramos) / 1000;

  let cuadradoIndividual = document.createElement("div");
  cuadradoIndividual.style.backgroundColor = getColor(indiceGlucemico);
  cuadradoIndividual.innerText = "IG";
  cuadradoIndividual.className = "indice-glucemico-individual";

  let resultadoIndividual = document.createElement("div");
  const hc = raciones * 10;
  resultadoIndividual.innerText =
    "Raciones para " +
    gramos +
    "g de " +
    alimento +
    ": " +
    raciones.toFixed(1) +
    " (" +
    hc.toFixed(1) +
    " HC)";
  resultadoIndividual.style.display = "inline-block";
  resultadoIndividual.style.marginLeft = "5px";

  let resultadoLinea = document.createElement("div");
  resultadoLinea.appendChild(cuadradoIndividual);
  resultadoLinea.appendChild(resultadoIndividual);
  resultadoLinea.className = "resultado-linea";

  document.getElementById("resultado").appendChild(resultadoLinea);

  totalCarbohidratos += raciones;
  totalIndiceGlucemicoPonderado += indiceGlucemico * raciones;
  totalCarbohidratosPonderados += raciones;
  if (totalCarbohidratos == 0) indiceGlucemicoMedio = 0;
  else
    indiceGlucemicoMedio =
      totalIndiceGlucemicoPonderado / totalCarbohidratosPonderados;

  document.getElementById("cuadrado").style.backgroundColor =
    getColor(indiceGlucemicoMedio);
  document.getElementById("cuadrado").innerText = "IG Medio";
  document.getElementById("suma-resultado").innerText =
    "Total: " +
    totalCarbohidratos.toFixed(1) +
    "\nÍndice glucémico medio: " +
    indiceGlucemicoMedio.toFixed(1);

  addHistorial(alimento, gramos, raciones);
}

function limpiar() {
  // Limpia inputs/resultados de la sesión actual (no borra el historial guardado).
  document.getElementById("miInput").value = "";
  document.getElementById("gramos").value = "";
  document.getElementById("resultado").innerText = "";
  document.getElementById("suma-resultado").innerText = "";
  document.getElementById("cuadrado").style.backgroundColor = "#f8f9fa";
  document.getElementById("cuadrado").innerText = "";
  totalCarbohidratos = 0; // Restablecer la variable global
  totalIndiceGlucemicoPonderado = 0;
  totalCarbohidratosPonderados = 0;
  indiceGlucemicoMedio = 0;
  totalComidas = 0;
}

function limpiarHistorial() {
  if (!confirm("¿Borrar historial guardado?")) return;
  historial = [];
  localStorage.removeItem("historial");
  renderHistorial();
}

function getColor(indiceGlucemico) {
  if (indiceGlucemico < 55) {
    return "green";
  } else if (indiceGlucemico < 70) {
    return "orange";
  } else {
    return "red";
  }
}

function ajustarGramos(delta) {
  const el = document.getElementById("gramos");
  const v = parseFloat(el.value || "0");
  const next = Math.max(0, Math.round((isNaN(v) ? 0 : v) + delta));
  el.value = String(next);
  el.focus();
}

document.getElementById("gramos").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    calcularRaciones();
  }
});

var cameraDialog = document.getElementById("cameraDialog");
var closeCameraButton = document.getElementById("closeCameraButton");

closeCameraButton.onclick = function () {
  cameraDialog.close();
  Quagga.stop(); // Detén Quagga cuando se cierre el diálogo
};

function codigoBarras() {
  Quagga.init(
    {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector("#camara"), // Selecciona el elemento por su ID
      },
      decoder: {
        readers: ["ean_reader"], // Asegúrate de que estás utilizando el lector correcto
      },
    },
    function (err) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Initialization finished. Ready to start");
      Quagga.start();
      document.getElementById("camara").style.visibility = "";
    }
  );

  Quagga.onDetected(function (data) {
    var code = data.codeResult.code;
    console.log("Code: " + code);
    var cameraElement = document.getElementById("camara");
    cameraElement.classList.add("detected");

    // Cambia el color del borde a verde durante 1 segundo
    setTimeout(function () {
      cameraElement.classList.remove("detected");
    }, 1000);

    // Guardar sólo 10 códigos
    if (codes.length < 30) {
      codes.push(code);
    } else {
      Quagga.stop();
      // Una vez que tenemos 10 códigos, encontramos el más común
      var counts = {};
      for (var i = 0; i < codes.length; i++) {
        var num = codes[i];
        counts[num] = counts[num] ? counts[num] + 1 : 1;
      }

      // Encontrar el código que más se repite
      var mostCommonCode = Object.keys(counts).reduce(function (a, b) {
        return counts[a] > counts[b] ? a : b;
      });
      obtenerDatosCarbohidratos(mostCommonCode);
      console.log("Código más común: " + mostCommonCode);

      //document.getElementById("camara").style.visibility = 'hidden';
      cameraDialog.close(); // Cierra el diálogo cuando Quagga se detiene
      Quagga.offDetected();
      return;
    }
  });
}

function openCameraDialog() {
  cameraDialog.showModal(); // Muestra el diálogo antes de iniciar Quagga
  codes = [];
  codigoBarras(); // Luego inicia Quagga
}

async function obtenerDatosCarbohidratos(codigoBarras) {
  // Cache scanned products locally.
  if (cachedProducts[codigoBarras]) {
    const p = cachedProducts[codigoBarras];
    calcularRacionesBarras(p.nombre, p.carbohydrates_100g, p.indiceGlucemico || 0);
    return;
  }

  const url = `https://world.openfoodfacts.org/api/v2/product/${codigoBarras}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al leer el código de barras, inténtelo de nuevo");
    }
    const data = await response.json();
    const nombre = (data.product && data.product.product_name) || "";
    const carbohydrates_100g = data.product && data.product.nutriments ? data.product.nutriments.carbohydrates_100g : null;

    if (!nombre || carbohydrates_100g == null) {
      // Allow the user to fill missing data and store it as custom food + cache.
      const n = prompt("No pude obtener datos. Nombre del alimento:");
      if (!n) return;
      const carb = parseFloat(prompt("Carbohidratos por 100g:") || "");
      if (isNaN(carb)) {
        alert("Valor de carbohidratos no válido");
        return;
      }
      const ig = parseFloat(prompt("Índice glucémico (opcional):") || "0");
      cachedProducts[codigoBarras] = { nombre: n, carbohydrates_100g: carb, indiceGlucemico: isNaN(ig) ? 0 : ig };
      localStorage.setItem("cachedProducts", JSON.stringify(cachedProducts));

      customFoods[n] = { carbohidratos: carb, indiceGlucemico: isNaN(ig) ? 0 : ig };
      localStorage.setItem("customFoods", JSON.stringify(customFoods));
      carbohidratosAlimentos[n] = { carbohidratos: carb, indiceGlucemico: isNaN(ig) ? 0 : ig };
      if (!alimentos.includes(n)) alimentos.push(n);
      $("#miInput").autocomplete("option", "source", alimentos);

      calcularRacionesBarras(n, carb, isNaN(ig) ? 0 : ig);
      return;
    }

    cachedProducts[codigoBarras] = { nombre, carbohydrates_100g, indiceGlucemico: 0 };
    localStorage.setItem("cachedProducts", JSON.stringify(cachedProducts));

    calcularRacionesBarras(nombre, carbohydrates_100g, 0);
  } catch (error) {
    alert(error.message);
    return;
  }
}

function agregarAlimento() {
  let nombre = prompt("Nombre del alimento:");
  if (!nombre) return;
  let carb = parseFloat(
    prompt("Carbohidratos por 100g:")
  );
  if (isNaN(carb)) {
    alert("Valor de carbohidratos no válido");
    return;
  }
  let ig = parseFloat(prompt("Índice glucémico:"));
  if (isNaN(ig)) ig = 0;
  customFoods[nombre] = { carbohidratos: carb, indiceGlucemico: ig };
  localStorage.setItem("customFoods", JSON.stringify(customFoods));
  carbohidratosAlimentos[nombre] = { carbohidratos: carb, indiceGlucemico: ig };
  alimentos.push(nombre);
  $("#miInput").autocomplete("option", "source", alimentos);
  alert("Alimento añadido");
}

function addHistorial(alimento, gramos, raciones) {
  // Store a timestamp so we can group by day.
  historial.push({ alimento, gramos, raciones, ts: Date.now() });
  localStorage.setItem("historial", JSON.stringify(historial));
  renderHistorial();
}

function renderHistorial() {
  const lista = document.getElementById("historial");
  if (!lista) return;
  lista.innerHTML = "";

  // Group by local day.
  const groups = {};
  for (const item of historial) {
    const ts = item.ts || Date.now();
    const d = new Date(ts);
    const key = d.toLocaleDateString("es-ES");
    groups[key] = groups[key] || [];
    groups[key].push({ ...item, ts });
  }

  const days = Object.keys(groups).sort((a, b) => {
    // Sort by date descending using a best-effort parse.
    const pa = Date.parse(a.split("/").reverse().join("-"));
    const pb = Date.parse(b.split("/").reverse().join("-"));
    return (isNaN(pb) ? 0 : pb) - (isNaN(pa) ? 0 : pa);
  });

  for (const day of days) {
    const header = document.createElement("li");
    header.textContent = `📅 ${day}`;
    header.style.fontWeight = "bold";
    lista.appendChild(header);

    let dayRaciones = 0;
    for (const item of groups[day]) {
      const li = document.createElement("li");
      const ts = new Date(item.ts);
      const hhmm = ts.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      const hc = item.raciones * 10;
      dayRaciones += item.raciones;
      li.textContent = `${hhmm} · ${item.gramos}g de ${item.alimento}: ${item.raciones.toFixed(
        1
      )} raciones (${hc.toFixed(0)} HC)`;
      lista.appendChild(li);
    }

    const totals = document.createElement("li");
    totals.style.opacity = "0.8";
    totals.style.marginBottom = "10px";
    totals.textContent = `Total día: ${dayRaciones.toFixed(1)} raciones (${(dayRaciones * 10).toFixed(0)} HC)`;
    lista.appendChild(totals);
  }
}

function exportarPDF() {
  if (historial.length === 0) {
    alert("No hay historial para exportar");
    return;
  }
  const doc = new jsPDF();
  doc.text("Historial de comidas", 10, 10);

  // Group by day like the UI.
  const groups = {};
  for (const item of historial) {
    const ts = item.ts || Date.now();
    const d = new Date(ts);
    const key = d.toLocaleDateString("es-ES");
    groups[key] = groups[key] || [];
    groups[key].push({ ...item, ts });
  }
  const days = Object.keys(groups);

  let y = 20;
  for (const day of days) {
    doc.text(`Día ${day}`, 10, y);
    y += 8;
    let dayRaciones = 0;
    for (const item of groups[day]) {
      const ts = new Date(item.ts);
      const hhmm = ts.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      const hc = item.raciones * 10;
      dayRaciones += item.raciones;
      doc.text(
        `${hhmm} - ${item.gramos}g de ${item.alimento}: ${item.raciones.toFixed(1)} raciones (${hc.toFixed(0)} HC)`,
        10,
        y
      );
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    }
    doc.text(`Total día: ${dayRaciones.toFixed(1)} raciones (${(dayRaciones * 10).toFixed(0)} HC)`, 10, y);
    y += 12;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  }

  doc.save("historial.pdf");
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  if (isDark) {
    themeToggle.classList.remove("fa-moon");
    themeToggle.classList.add("fa-sun");
  } else {
    themeToggle.classList.remove("fa-sun");
    themeToggle.classList.add("fa-moon");
  }
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

var titulo = document.title;
var favicon = document.getElementById("favicon");

window.addEventListener("blur", () => {

  favicon.href = "data/warning.gif";
  document.title = "¡Vuelve! 🚨";

})

window.addEventListener("focus", () => {
  
    favicon.href = "data/icono.ico";
    document.title = titulo;
  
  })