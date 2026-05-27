import pandas as pd

# ==========================================
# RUTA DEL EXCEL
# ==========================================

archivo_excel = r"C:\Users\darie\Downloads\cotizador_arquitectura\excel\presupuesto.xlsx"

# ==========================================
# LEER EXCEL
# ==========================================

excel_file = pd.ExcelFile(archivo_excel)

print("\nHojas encontradas:\n")

for hoja in excel_file.sheet_names:
    print("-", hoja)

# ==========================================
# LEER HOJA PRINCIPAL
# ==========================================

df = pd.read_excel(
    archivo_excel,
    sheet_name="Construccion_Obra_Civil"
)

# ==========================================
# LIMPIAR COLUMNAS
# ==========================================

df.columns = df.columns.str.strip()

# ==========================================
# ELIMINAR TOTAL FINAL DUPLICADO
# ==========================================

df_limpio = df[
    df["Fase"] != "GRAN TOTAL DE LA OBRA"
]

# ==========================================
# CALCULOS GENERALES
# ==========================================

total_materiales = df_limpio["Total Materiales (RD$)"].sum()

total_mano_obra = df_limpio["Total Mano Obra (RD$)"].sum()

subtotal_obra = df_limpio["Total (RD$)"].sum()

imprevistos = subtotal_obra * 0.10

honorarios = total_materiales * 0.10

gran_total = (
    subtotal_obra +
    imprevistos +
    honorarios
)

# ==========================================
# RESULTADOS GENERALES
# ==========================================

print("\n============================")
print("RESULTADOS GENERALES")
print("============================\n")

print(f"Total Materiales: RD$ {total_materiales:,.2f}")

print(f"Total Mano Obra: RD$ {total_mano_obra:,.2f}")

print(f"Subtotal Obra: RD$ {subtotal_obra:,.2f}")

print(f"Imprevistos (10%): RD$ {imprevistos:,.2f}")

print(f"Honorarios Arquitecto (10%): RD$ {honorarios:,.2f}")

print("\n============================")

print(f"\nGRAN TOTAL: RD$ {gran_total:,.2f}")

# ==========================================
# TIEMPO ESTIMADO
# ==========================================

dias_base = 90

holgura = 15

dias_totales = dias_base + holgura

print("\n============================")
print("TIEMPO ESTIMADO")
print("============================\n")

print(f"{dias_base} días base")

print(f"+ {holgura} días de holgura")

print(f"\nTOTAL: {dias_totales} días")

# ==========================================
# RIESGO
# ==========================================

riesgo = "Bajo"

if gran_total >= 2000000:
    riesgo = "Medio"

if gran_total >= 4000000:
    riesgo = "Alto"

print("\n============================")
print("RIESGO")
print("============================\n")

print(riesgo)

# ==========================================
# RESUMEN POR FASES
# ==========================================

print("\n============================")
print("RESUMEN POR FASES")
print("============================\n")

# CREAR COLUMNA AUXILIAR

fase_actual = None

lista_fases = []

for index, row in df_limpio.iterrows():

    valor_fase = str(row["Fase"])

    # DETECTAR TITULO FASE

    if "Fase" in valor_fase:

        fase_actual = valor_fase

    lista_fases.append(fase_actual)

# AGREGAR NUEVA COLUMNA

df_limpio["Grupo_Fase"] = lista_fases

# AGRUPAR

resumen_fases = df_limpio.groupby("Grupo_Fase")["Total (RD$)"].sum()

# MOSTRAR

for fase, total in resumen_fases.items():

    print(f"{fase}: RD$ {total:,.2f}")

# ==========================================
# DETALLE POR CATEGORIAS
# ==========================================

print("\n============================")
print("CATEGORIAS")
print("============================\n")

categorias = df_limpio.groupby("Categoría")["Total (RD$)"].sum()

for categoria, total in categorias.items():

    print(f"{categoria}: RD$ {total:,.2f}")

# ==========================================
# FASE MAS COSTOSA
# ==========================================

fase_mas_costosa = resumen_fases.idxmax()

valor_fase_costosa = resumen_fases.max()

print("\n============================")
print("FASE MAS COSTOSA")
print("============================\n")

print(f"{fase_mas_costosa}")

print(f"RD$ {valor_fase_costosa:,.2f}")

# ==========================================
# TOP 5 PARTIDAS MAS CARAS
# ==========================================

print("\n============================")
print("TOP 5 PARTIDAS MAS COSTOSAS")
print("============================\n")

top5 = df_limpio.nlargest(5, "Total (RD$)")

for index, row in top5.iterrows():

    descripcion = row["Descripción"]

    total = row["Total (RD$)"]

    print(f"{descripcion}")

    print(f"RD$ {total:,.2f}\n")

# ==========================================
# MENSAJE FINAL
# ==========================================

print("\n============================")
print("ANALISIS COMPLETADO")
print("============================\n")

print("""
El sistema analizó correctamente:

✓ Costos materiales
✓ Mano de obra
✓ Honorarios
✓ Imprevistos
✓ Fases
✓ Categorías
✓ Partidas más costosas
✓ Riesgo estimado
✓ Tiempo estimado

ConstructIQ listo para siguiente nivel.
""")

# ==========================================
# EXPORTAR JSON
# ==========================================

import json

resultado = {

    "total_materiales": round(total_materiales, 2),

    "total_mano_obra": round(total_mano_obra, 2),

    "subtotal_obra": round(subtotal_obra, 2),

    "imprevistos": round(imprevistos, 2),

    "honorarios": round(honorarios, 2),

    "gran_total": round(gran_total, 2),

    "riesgo": riesgo,

    "dias_totales": dias_totales
}

with open(r"C:\Users\darie\Downloads\cotizador_arquitectura\data\resultado.json", "w") as archivo_json:

    json.dump(
        resultado,
        archivo_json,
        indent=4
    )

print("\nJSON generado correctamente.")