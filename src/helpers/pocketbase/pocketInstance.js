routerAdd('POST', '/api/entry/create', (e) => {

  function findEntryByPublicKey(key) {
    try {
      return $app.findFirstRecordByData("Entrys", "public_key", key);
    } catch (_) {
      return null;
    }
  }

  function findUserByEmail(email) {
    if (typeof email !== "string" || !email.trim()) {
      return null;
    }

    try {
      return $app.findFirstRecordByData(
        "users",
        "email",
        email.trim()
      );
    } catch (_) {
      return null;
    }
  }
  //IGKPIpTGucj4

  try {

    const user = e.auth;

    if (!user) {
      return e.json(401, { error: "No autenticado" });
    }
    const info = e.requestInfo();
    const body = info.body || {};

    const publicKey = typeof body.public_key === "string" ? body.public_key.trim() : "";


    if (!publicKey) {
      return e.json(400, { error: "public_key es requerido" });
    }
    
    let collection = $app.findCollectionByNameOrId("Entrys");

    const existingEntry = findEntryByPublicKey(publicKey);

    if (existingEntry) {
      return e.json(409, {
        error: "Ya existe una entrada con ese public_key",
        entry_id: existingEntry.id,
      });
    }

    let collectionStatus = $app.findFirstRecordByData("Status", "name", "Active")
    
    const recordEntrys = new Record(collection);

    recordEntrys.set("public_key", publicKey);
    recordEntrys.set("id_status", collectionStatus.id);
    recordEntrys.set("slug:autogenerate", "post-");
    $app.save(recordEntrys);

    return e.json(201, { status: "success", entry_id: recordEntrys.id, public_key: publicKey});

  } catch (error) {
    console.log("Entry create error:", error);
    return e.json(500, { error: "Internal server error" });
  }
},
$apis.requireAuth()
);
