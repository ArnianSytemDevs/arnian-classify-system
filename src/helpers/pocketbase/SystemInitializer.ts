import { pb } from "./pocketbase";

/* ────────────────────────────────
   🧱 Datos base del sistema
──────────────────────────────── */

const baseStatus = [
  { name: "Active", code: "1", color: "18F55A", description: "Estado de activo" },
  { name: "Inactive", code: "2", color: "F51818", description: "Estado inactivo" },
  { name: "Edit", code: "3", color: "F5F518", description: "En estado de edición" },
  { name: "Deprected", code: "4", color: "B0BABF", description: "Estado inactivo y dejando de funcionar" },
  { name: "Finished", code: "5", color: "26F9FF", description: "Proceso finalizado" },
  { name: "In_review", code: "6", color: "F527C8", description: "En revisión" },
  { name: "In_classify", code: "7", color: "27F5CF", description: "En clasificación" },
];

const baseCategories = [
  { name: "Developer", level: 1 },
  { name: "Admin", level: 2 },
  { name: "Coordinator", level: 3 },
  { name: "Reviewer", level: 4 },
  { name: "Classifier", level: 5 },
  { name: "Accounting", level: 6 },
];

/* ────────────────────────────────
   📏 Anexo 22-07 - Unidades y Medidas
──────────────────────────────── */

const ANEXO_22_07: { code: number; name: string }[] = [
  { code: 1, name: "Kilo" },
  { code: 2, name: "Gramo" },
  { code: 3, name: "Metro lineal" },
  { code: 4, name: "Metro cuadrado" },
  { code: 5, name: "Metro cúbico" },
  { code: 6, name: "Pieza" },
  { code: 7, name: "Cabeza" },
  { code: 8, name: "Litro" },
  { code: 9, name: "Par" },
  { code: 10, name: "Kilowatt" },
  { code: 11, name: "Millar" },
  { code: 12, name: "Juego" },
  { code: 13, name: "Kilowatt/Hora" },
  { code: 14, name: "Tonelada" },
  { code: 15, name: "Barril" },
  { code: 16, name: "Gramo neto" },
  { code: 17, name: "Decenas" },
  { code: 18, name: "Cientos" },
  { code: 19, name: "Docenas" },
  { code: 20, name: "Caja" },
  { code: 21, name: "Botella" },
  { code: 22, name: "Carat" },
];

const pkUnit = (code: number) => `A22U-${String(code).padStart(2, "0")}`;
const pkMeas = (code: number) => `A22M-${String(code).padStart(2, "0")}`;

/* ────────────────────────────────
   🧩 Inicializador del sistema
──────────────────────────────── */

export class SystemInitializer {
  public static async initializeSystemData() {
    try {
      console.log("🚀 Verificando estado del sistema...");

      // 1️⃣ Si ya existen datos en Status o Units, asumimos que el sistema ya fue inicializado
      const [statusList, unitsList] = await Promise.all([
        pb.collection("Status").getFullList(),
        pb.collection("Units").getFullList(),
      ]);

      if (statusList.length > 0 && unitsList.length >= ANEXO_22_07.length) {
        console.log("✅ Sistema ya inicializado. No se requieren cambios.");
        return;
      }

      console.log("⚙️ Inicializando datos base del sistema por primera vez...");

      // 2️⃣ Reemplazar Units y Measurements con el Anexo 22-07
      await this.replaceAnexo2207UnitsAndMeasurements();

      // 3️⃣ Asegurar Status y Category_user
      await Promise.all([
        this.ensureCollectionData("Status", baseStatus, "name"),
        this.ensureCollectionData("Category_user", baseCategories, "name"),
      ]);

      console.log("✅ Inicialización completa y verificada.");
    } catch (err) {
      console.error("❌ Error al inicializar datos del sistema:", err);
    }
  }

  /* ────────────────────────────────
     🔄 Limpia e inserta Anexo 22-07
  ──────────────────────────────── */
  private static async replaceAnexo2207UnitsAndMeasurements() {
    console.log("⚙️ Configurando Units y Measurements según Anexo 22-07...");

    const [units, measurements] = await Promise.all([
      pb.collection("Units").getFullList(),
      pb.collection("Measurements").getFullList(),
    ]);

    // Si ya hay datos y parecen correctos, no los tocamos
    if (units.length >= ANEXO_22_07.length && measurements.length >= ANEXO_22_07.length) {
      console.log("✔️ Units y Measurements ya configuradas, sin cambios.");
      return;
    }

    // Limpiar tablas solo si están incompletas
    if (units.length > 0) {
      console.log(`🧹 Eliminando ${units.length} registros de Units...`);
      await Promise.all(units.map((u: any) => pb.collection("Units").delete(u.id)));
    }
    if (measurements.length > 0) {
      console.log(`🧹 Eliminando ${measurements.length} registros de Measurements...`);
      await Promise.all(measurements.map((m: any) => pb.collection("Measurements").delete(m.id)));
    }

    // Insertar nuevos datos
    console.log("📦 Insertando nuevas unidades...");
    await Promise.all(
      ANEXO_22_07.map((r) =>
        pb.collection("Units").create({
          public_key: pkUnit(r.code),
          name: r.name,
          alias: r.name,
        })
      )
    );

    console.log("⚖️ Insertando nuevas medidas...");
    await Promise.all(
      ANEXO_22_07.map((r) =>
        pb.collection("Measurements").create({
          public_key: pkMeas(r.code),
          name: r.name,
          alias: r.name,
        })
      )
    );

    console.log("✅ Units y Measurements actualizadas correctamente.");
  }

  /* ────────────────────────────────
     🧾 Verifica o inserta datos base
  ──────────────────────────────── */
  private static async ensureCollectionData(
    collection: string,
    baseData: any[],
    keyField: string
  ) {
    const existing = await pb.collection(collection).getFullList();
    const missing = baseData.filter(
      (d) => !existing.some((e: any) => e[keyField] === d[keyField])
    );

    if (missing.length > 0) {
      console.warn(`⚠️ Insertando ${missing.length} elementos en ${collection}`);
      await Promise.all(missing.map((item) => pb.collection(collection).create(item)));
    } else {
      console.log(`✔️ ${collection} ya contiene todos los registros base.`);
    }
  }
}
