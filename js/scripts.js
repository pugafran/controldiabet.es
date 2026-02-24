const elements = {
  aboutDialog: document.getElementById("aboutDialog"),
  aboutIcon: document.getElementById("aboutIcon"),
  closeButton: document.getElementById("closeButton"),
  themeToggle: document.getElementById("themeToggle"),
  inputFood: document.getElementById("miInput"),
  inputGrams: document.getElementById("gramos"),
  resultList: document.getElementById("resultado"),
  summaryBox: document.getElementById("cuadrado"),
  summaryText: document.getElementById("suma-resultado"),
  foodsCount: document.getElementById("numero-alimentos"),
  history: document.getElementById("historial"),
  cameraDialog: document.getElementById("cameraDialog"),
  cameraBox: document.getElementById("camara"),
  closeCameraButton: document.getElementById("closeCameraButton"),
  favicon: document.getElementById("favicon"),
};

const storage = {
  customFoods: "customFoods",
  history: "historial",
  theme: "theme",
};

const state = {
  codes: [],
  foods: {},
  foodNames: [],
  customFoods: JSON.parse(localStorage.getItem(storage.customFoods)) || {},
  history: JSON.parse(localStorage.getItem(storage.history)) || [],
  totalRaciones: 0,
  totalIgPonderado: 0,
};

init();

function init() {
  bindUI();
  applySavedTheme();
  loadFoods();
  renderHistory();
}

function bindUI() {
  elements.aboutIcon.onclick = () => elements.aboutDialog.showModal();
  elements.closeButton.onclick = () => elements.aboutDialog.close();
  elements.themeToggle.onclick = () => toggleTheme();
  elements.closeCameraButton.onclick = closeCameraDialog;

  elements.inputGrams.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      calcularRaciones();
    }
  });

  const originalTitle = document.title;
  window.addEventListener("blur", () => {
    elements.favicon.href = "data/warning.gif";
    document.title = "¡Vuelve! 🚨";
  });

  window.addEventListener("focus", () => {
    elements.favicon.href = "data/icono.ico";
    document.title = originalTitle;
  });
}

function loadFoods() {
  fetch("data/alimentos.json")
    .then((response) => response.json())
    .then((data) => {
      state.foods = { ...data, ...state.customFoods };
      state.foodNames = Object.keys(state.foods).sort((a, b) => a.localeCompare(b));
      elements.foodsCount.innerText = `Datos sobre ${state.foodNames.length} alimentos extraídos de fundaciondiabetes.org`;
      $(function () {
        $("#miInput").autocomplete({
          source: state.foodNames,
        });
      });
    })
    .catch((error) => console.error("Error cargando alimentos:", error));
}

function calcularRaciones() {
  const alimento = elements.inputFood.value.trim();
  const gramos = Number(elements.inputGrams.value);

  if (!Object.prototype.hasOwnProperty.call(state.foods, alimento)) {
    alert("El alimento ingresado no se encuentra en la lista.");
    return;
  }

  if (!Number.isFinite(gramos) || gramos <= 0) {
    alert("Introduce un número de gramos válido y mayor que 0.");
    return;
  }

  const { carbohidratos, indiceGlucemico } = state.foods[alimento];
  const raciones = (carbohidratos * gramos) / 1000;

  addCalculationResult(alimento, gramos, raciones, indiceGlucemico);
  addHistory(alimento, gramos, raciones);
}

function addCalculationResult(alimento, gramos, raciones, indiceGlucemico) {
  const igTag = document.createElement("div");
  igTag.className = "indice-glucemico-individual";
  igTag.style.backgroundColor = getColor(indiceGlucemico);
  igTag.innerText = "IG";

  const text = document.createElement("div");
  text.className = "resultado-individual";
  text.innerText = `Raciones para ${gramos}g de ${alimento}: ${raciones.toFixed(1)}`;

  const line = document.createElement("div");
  line.className = "resultado-linea";
  line.appendChild(igTag);
  line.appendChild(text);

  elements.resultList.appendChild(line);

  state.totalRaciones += raciones;
  state.totalIgPonderado += indiceGlucemico * raciones;
  const igMedio = state.totalRaciones === 0 ? 0 : state.totalIgPonderado / state.totalRaciones;

  elements.summaryBox.style.backgroundColor = getColor(igMedio);
  elements.summaryBox.innerText = "IG medio";
  elements.summaryText.innerText = `Total: ${state.totalRaciones.toFixed(1)}\nÍndice glucémico medio: ${igMedio.toFixed(1)}`;
}

function limpiar() {
  elements.inputFood.value = "";
  elements.inputGrams.value = "";
  elements.resultList.innerHTML = "";
  elements.summaryText.innerText = "";
  elements.summaryBox.style.backgroundColor = "#c9d2e4";
  elements.summaryBox.innerText = "";
  state.totalRaciones = 0;
  state.totalIgPonderado = 0;
}

function getColor(indiceGlucemico) {
  if (indiceGlucemico < 55) return "#16a34a";
  if (indiceGlucemico < 70) return "#f59e0b";
  return "#dc2626";
}

function closeCameraDialog() {
  elements.cameraDialog.close();
  Quagga.stop();
}

function openCameraDialog() {
  elements.cameraDialog.showModal();
  state.codes = [];
  codigoBarras();
}

function codigoBarras() {
  Quagga.init(
    {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: elements.cameraBox,
      },
      decoder: {
        readers: ["ean_reader"],
      },
    },
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      Quagga.start();
    }
  );

  Quagga.onDetected((data) => {
    const code = data.codeResult.code;
    elements.cameraBox.classList.add("detected");
    setTimeout(() => elements.cameraBox.classList.remove("detected"), 1000);

    if (state.codes.length < 30) {
      state.codes.push(code);
      return;
    }

    Quagga.stop();
    const counts = state.codes.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
    const mostCommonCode = Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );

    obtenerDatosCarbohidratos(mostCommonCode);
    elements.cameraDialog.close();
    Quagga.offDetected();
  });
}

async function obtenerDatosCarbohidratos(codigoBarras) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${codigoBarras}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error al leer el código de barras, inténtalo de nuevo.");
    }

    const data = await response.json();
    const nombre = data.product?.product_name;
    const carbohydrates = data.product?.nutriments?.carbohydrates_100g;

    if (!nombre || !Number.isFinite(carbohydrates)) {
      throw new Error("No se pudieron obtener datos válidos del producto.");
    }

    const gramosTexto = prompt(`Introduce la cantidad de gramos para ${nombre}:`);
    const gramos = Number(gramosTexto);
    if (!Number.isFinite(gramos) || gramos <= 0) {
      alert("Introduce un número de gramos válido y mayor que 0.");
      return;
    }

    const raciones = (carbohydrates * gramos) / 1000;
    addCalculationResult(nombre, gramos, raciones, 0);
    addHistory(nombre, gramos, raciones);
  } catch (error) {
    alert(error.message);
  }
}

function agregarAlimento() {
  const nombre = prompt("Nombre del alimento:");
  if (!nombre) return;

  const carb = Number(prompt("Carbohidratos por 100g:"));
  if (!Number.isFinite(carb) || carb < 0) {
    alert("Valor de carbohidratos no válido.");
    return;
  }

  let ig = Number(prompt("Índice glucémico:"));
  if (!Number.isFinite(ig) || ig < 0) ig = 0;

  const normalizedName = nombre.trim();
  state.customFoods[normalizedName] = { carbohidratos: carb, indiceGlucemico: ig };
  localStorage.setItem(storage.customFoods, JSON.stringify(state.customFoods));

  state.foods[normalizedName] = { carbohidratos: carb, indiceGlucemico: ig };
  state.foodNames = Object.keys(state.foods).sort((a, b) => a.localeCompare(b));
  $("#miInput").autocomplete("option", "source", state.foodNames);
  elements.foodsCount.innerText = `Datos sobre ${state.foodNames.length} alimentos extraídos de fundaciondiabetes.org`;

  alert("Alimento añadido correctamente.");
}

function addHistory(alimento, gramos, raciones) {
  state.history.push({ alimento, gramos, raciones, fecha: new Date().toISOString() });
  localStorage.setItem(storage.history, JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  if (!elements.history) return;

  elements.history.innerHTML = "";
  state.history
    .slice()
    .reverse()
    .forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.gramos}g de ${item.alimento}: ${item.raciones.toFixed(1)} raciones`;
      elements.history.appendChild(li);
    });
}

function vaciarHistorial() {
  if (!confirm("¿Seguro que quieres vaciar el historial?")) return;
  state.history = [];
  localStorage.setItem(storage.history, JSON.stringify(state.history));
  renderHistory();
}

function exportarPDF() {
  if (state.history.length === 0) {
    alert("No hay historial para exportar.");
    return;
  }

  const doc = new jsPDF();
  doc.text("Historial de comidas", 10, 10);
  state.history.forEach((item, index) => {
    doc.text(`${item.gramos}g de ${item.alimento}: ${item.raciones.toFixed(1)} raciones`, 10, 20 + index * 10);
  });
  doc.save("historial.pdf");
}

function applySavedTheme() {
  if (localStorage.getItem(storage.theme) === "dark") {
    document.body.classList.add("dark-mode");
    elements.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  elements.themeToggle.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem(storage.theme, isDark ? "dark" : "light");
}
