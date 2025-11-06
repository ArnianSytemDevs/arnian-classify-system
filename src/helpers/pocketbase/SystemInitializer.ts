import { pb } from "./pocketbase";

/* ────────────────────────────────
   🧱 Datos base del sistema
──────────────────────────────── */

const baseStatus = [
  { name: "Active", code: "1", color: "18F55A", description: "Estado activo" },
  { name: "Inactive", code: "2", color: "F51818", description: "Estado inactivo" },
  { name: "Edit", code: "3", color: "F5F518", description: "En edición" },
  { name: "Deprected", code: "4", color: "B0BABF", description: "Obsoleto" },
  { name: "Finished", code: "5", color: "26F9FF", description: "Finalizado" },
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

const ANEXO_22_07 = [
  "Kilo","Gramo","Metro lineal","Metro cuadrado","Metro cúbico","Pieza","Cabeza","Litro",
  "Par","Kilowatt","Millar","Juego","Kilowatt/Hora","Tonelada","Barril","Gramo neto",
  "Decenas","Cientos","Docenas","Caja","Botella","Carat"
];

const pkUnit = (i: number) => `A22U-${String(i + 1).padStart(2, "0")}`;
const pkMeas = (i: number) => `A22M-${String(i + 1).padStart(2, "0")}`;

/* ────────────────────────────────
   🧩 Inicializador optimizado
──────────────────────────────── */

export class SystemInitializer {
  static async initializeSystemData() {
    try {
      console.log("🚀 Verificando datos base del sistema...");

      // ✅ Verificar si ya está inicializado (consultas mínimas)
      const [statusCount, unitCount] = await Promise.all([
        pb.collection("Status").getList(1, 1),
        pb.collection("Units").getList(1, 1),
      ]);

      if (statusCount.totalItems > 0 && unitCount.totalItems >= ANEXO_22_07.length) {
        console.log("✅ Sistema ya inicializado, no se requieren cambios.");
        return;
      }

      console.log("⚙️ Iniciando carga base del sistema...");
      await this.seedBaseData();

      console.log("✅ Inicialización completada sin sobrecargar el servidor.");
    } catch (err) {
      console.error("❌ Error al inicializar datos base:", err);
    }
  }

  /* ────────────────────────────────
     🌱 Inserción en bloques pequeños
  ──────────────────────────────── */
  private static async seedBaseData() {
    // 1️⃣ Status y Categorías (ligeros)
    await this.ensureCollection("Status", baseStatus, "name");
    await this.ensureCollection("Category_user", baseCategories, "name");

    // 2️⃣ Units y Measurements → se crean si faltan
    await this.ensureAnexo2207("Units", pkUnit);
    await this.ensureAnexo2207("Measurements", pkMeas);
  }

  /* ────────────────────────────────
     🔄 Inserción condicional de Anexo
  ──────────────────────────────── */
  private static async ensureAnexo2207(collection: string, keyFn: (i: number) => string) {
    const existing = await pb.collection(collection).getFullList({ requestKey: null });
    if (existing.length >= ANEXO_22_07.length) {
      console.log(`✔️ ${collection} ya contiene todas las entradas.`);
      return;
    }

    const missingItems = ANEXO_22_07.filter(
      (name) => !existing.some((e) => e.name === name)
    );

    console.log(`📦 Agregando ${missingItems.length} registros a ${collection}...`);

    // 🔸 Insertar en bloques pequeños (para evitar 429 Too Many Requests)
    const batchSize = 5;
    for (let i = 0; i < missingItems.length; i += batchSize) {
      const chunk = missingItems.slice(i, i + batchSize);
      for (const [index, name] of chunk.entries()) {
        await pb.collection(collection).create({
          public_key: keyFn(i + index),
          name,
          alias: name,
        });
      }
      await new Promise((r) => setTimeout(r, 250)); // ⏳ Delay preventivo
    }
  }

  /* ────────────────────────────────
     🧾 Inserta solo si faltan registros
  ──────────────────────────────── */
  private static async ensureCollection(collection: string, data: any[], keyField: string) {
    const existing = await pb.collection(collection).getFullList({ requestKey: null });
    const missing = data.filter(
      (d) => !existing.some((e) => e[keyField] === d[keyField])
    );

    if (missing.length === 0) {
      console.log(`✔️ ${collection} ya contiene todos los registros base.`);
      return;
    }

    console.log(`⚙️ Agregando ${missing.length} nuevos registros en ${collection}...`);
    for (const item of missing) {
      await pb.collection(collection).create(item);
      await new Promise((r) => setTimeout(r, 200)); // 🔹 Espera corta para evitar saturación
    }
  }
}
