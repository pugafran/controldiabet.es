import requests
from bs4 import BeautifulSoup

def obtener_datos_carbohidratos(codigo_barras):
    url = f"https://es.openfoodfacts.org/producto/{codigo_barras}"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Obtén el div de nutrición.
    div_nutricion = soup.find('div', {'id': 'panel_nutrition_facts_table_content'})

    if div_nutricion:
        filas = div_nutricion.find_all('tr')
        # Verifica si hay al menos cinco filas
        if len(filas) >= 5:
            # Obtenemos el quinto tr (indice 4 porque la indexación empieza en 0)
            fila_objetivo = filas[4]
            datos = fila_objetivo.find_all('td')
            # Verificamos si hay al menos dos celdas en la fila
            if len(datos) >= 2:
                # Obtenemos el segundo td (indice 1 porque la indexación empieza en 0)
                carbohidratos_100g = datos[1].text
                # Usamos split() para dividir la cadena en subcadenas usando el espacio como delimitador
                carbohidratos_100g = carbohidratos_100g.split()[0]  # Seleccionamos el primer elemento, que es el número
                return carbohidratos_100g

    return None


print(obtener_datos_carbohidratos('8000500310427'))