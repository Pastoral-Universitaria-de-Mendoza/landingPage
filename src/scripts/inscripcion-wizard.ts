export function initInscripcionWizard() {
  const root = document.getElementById("inscripcion-root");
  if (!root) return;

  const API_URL = (root.dataset.apiUrl ?? "").replace(/\/$/, "");
  const FORM_DEV_MODE = root.dataset.devMode === "true";
  const WHATSAPP_NUMBER = root.dataset.whatsapp ?? "5492634757235";
  const DRAFT_KEY = "mo2026_inscripcion_draft";
  const TOTAL_STEPS = 7;

  let currentStep = 0;
  let lastRegisteredDni = "";
  let activeConsultaDni = "";

  const form = document.getElementById("mo-form") as HTMLFormElement;
  const stepNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
  const indicatorNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-step-indicator]"));
  const errBox = document.getElementById("wizard-error")!;
  const errText = document.getElementById("wizard-error-text")!;
  const btnPrev = document.getElementById("btn-prev") as HTMLButtonElement;
  const btnNext = document.getElementById("btn-next") as HTMLButtonElement;
  const btnSubmit = document.getElementById("btn-submit") as HTMLButtonElement;

  const tabNueva = document.getElementById("tab-nueva")!;
  const tabConsulta = document.getElementById("tab-consulta")!;
  const wizardWrapper = document.getElementById("wizard-wrapper")!;
  const consultaWrapper = document.getElementById("consulta-wrapper")!;
  const successScreen = document.getElementById("success-screen")!;

  const getVal = (name: string) => {
    const item = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    return String(item?.value ?? "").trim();
  };
  const getRadio = (name: string) =>
    form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? "";

  function buildWhatsappUrl(nombre: string, dni: string) {
    const text = `¡Hola! Soy ${nombre || ""} (DNI ${dni || ""}) y me inscribí al Manos a la Obra 2026. Te envío mi comprobante de pago.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function switchMode(mode: "nueva" | "consulta") {
    const isConsulta = mode === "consulta";
    tabConsulta.classList.toggle("tab-active", isConsulta);
    tabNueva.classList.toggle("tab-active", !isConsulta);
    wizardWrapper.classList.toggle("hidden", isConsulta);
    consultaWrapper.classList.toggle("hidden", !isConsulta);
    successScreen.classList.add("hidden");
  }

  tabNueva.addEventListener("click", () => switchMode("nueva"));
  tabConsulta.addEventListener("click", () => switchMode("consulta"));

  const params = new URLSearchParams(window.location.search);
  if (params.get("modo") === "consulta") switchMode("consulta");

  const areaSlugParam = params.get("area");
  if (areaSlugParam) {
    const radio = form.querySelector<HTMLInputElement>(
      `input[name="area_pertenencia"][data-area-slug="${areaSlugParam}"]`,
    );
    if (radio) {
      radio.checked = true;
      const projSelect = form.querySelector<HTMLSelectElement>('select[name="proyecto_area"]');
      if (projSelect) projSelect.value = radio.value;
    }
  }

  function showError(msg: string) {
    if (!msg) {
      errBox.classList.add("hidden");
      return;
    }
    errText.textContent = msg;
    errBox.classList.remove("hidden");
    errBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderStep() {
    stepNodes.forEach((el, i) => el.classList.toggle("hidden", i !== currentStep));
    indicatorNodes.forEach((el, i) => {
      el.classList.toggle("step-secondary", i <= currentStep);
      el.classList.toggle("font-bold", i === currentStep);
    });
    btnPrev.classList.toggle("hidden", currentStep === 0);
    btnNext.classList.toggle("hidden", currentStep === TOTAL_STEPS - 1);
    btnSubmit.classList.toggle("hidden", currentStep !== TOTAL_STEPS - 1);
    showError("");
  }

  function syncConditionals() {
    const esMendoza = getRadio("es_mendoza") === "si";
    document.getElementById("mendoza-fields")!.classList.toggle("hidden", !esMendoza);
    document.getElementById("otra-provincia-fields")!.classList.toggle("hidden", esMendoza);

    const tieneOs = getRadio("tiene_obra_social") === "si";
    document.getElementById("obra-social-fields")!.classList.toggle("hidden", !tieneOs);

    const tieneAlergias = getRadio("tiene_alergias") === "si";
    document.getElementById("alergias-fields")!.classList.toggle("hidden", !tieneAlergias);

    const dieta = form.querySelector<HTMLSelectElement>('select[name="dieta_tipo"]')?.value;
    document.getElementById("dieta-otra-wrap")!.classList.toggle("hidden", dieta !== "Otro");

    const tipoParticipante = getRadio("tipo_participante");
    const subtipoEquipo = getRadio("subtipo_equipo");
    const esEquipo = tipoParticipante === "Parte del equipo";
    document.getElementById("subtipo-equipo-wrap")!.classList.toggle("hidden", !esEquipo);

    const mostrarProyecto = esEquipo && subtipoEquipo === "Referente";
    const mostrarRolGeneral = esEquipo && subtipoEquipo === "Equipo General";
    document.getElementById("proyecto-area-wrap")!.classList.toggle("hidden", !mostrarProyecto);
    document.getElementById("equipo-general-fields")!.classList.toggle("hidden", !mostrarRolGeneral);

    const esPropia = getRadio("forma_traslado") === "Movilidad propia";
    document.getElementById("estacionamiento-fields")!.classList.toggle("hidden", !esPropia);
    const necEst = getRadio("necesita_estacionamiento") === "si";
    document.getElementById("vehiculo-fields")!.classList.toggle("hidden", !(esPropia && necEst));
  }

  function saveDraft() {
    const fd = new FormData(form);
    const obj: Record<string, string | boolean> = {};
    for (const [k, v] of fd.entries()) {
      if (typeof v === "string") obj[k] = v;
    }
    obj.acepto_tyc = (form.querySelector("#acepto_tyc") as HTMLInputElement).checked;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(obj));
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw) as Record<string, unknown>;
      for (const [k, v] of Object.entries(obj)) {
        if (k === "acepto_tyc") {
          (form.querySelector("#acepto_tyc") as HTMLInputElement).checked = Boolean(v);
          continue;
        }
        const radios = form.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${k}"]`);
        if (radios.length > 0) {
          radios.forEach((r) => {
            if (r.value === v) r.checked = true;
          });
        } else {
          const el = form.elements.namedItem(k);
          if (el && "value" in el && typeof v === "string") {
            (el as HTMLInputElement).value = v;
          }
        }
      }
    } catch {
      // ignore invalid draft
    }
  }

  loadDraft();
  syncConditionals();
  renderStep();

  form.addEventListener("change", () => {
    syncConditionals();
    saveDraft();
  });
  form.addEventListener("input", saveDraft);

  function validateStep(stepIdx: number): string | null {
    if (stepIdx === 0) {
      if (!(form.querySelector("#acepto_tyc") as HTMLInputElement).checked) {
        return "Debés leer y aceptar las Bases y Condiciones para continuar.";
      }
    }
    if (stepIdx === 1) {
      if (!getVal("nombre_completo")) return "Ingresá tu nombre completo como aparece en el DNI.";
      const dni = getVal("dni").replace(/\D/g, "");
      if (dni.length < 7 || dni.length > 9) return "Ingresá un DNI válido sin puntos.";
      const dob = getVal("fecha_nacimiento");
      if (!dob) return "Ingresá tu fecha de nacimiento.";
      const birth = new Date(`${dob}T00:00:00Z`);
      const now = new Date();
      let age = now.getUTCFullYear() - birth.getUTCFullYear();
      const m = now.getUTCMonth() - birth.getUTCMonth();
      if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) age--;
      if (age < 18 || age > 35) return "Según las Bases y Condiciones, la participación es de 18 a 35 años.";
      if (!getVal("telefono") || !getVal("email") || !getVal("direccion")) {
        return "Completá teléfono, correo electrónico y dirección.";
      }
      if (getRadio("es_mendoza") === "si") {
        if (!getVal("departamento_mendoza")) return "Seleccioná tu departamento de Mendoza.";
      } else if (!getVal("provincia_origen") || !getVal("localidad_origen") || !getVal("fecha_llegada_mendoza")) {
        return "Completá provincia, localidad y día de llegada a Mendoza.";
      }
      if (
        !getVal("contacto1_nombre") || !getVal("contacto1_celular") || !getVal("contacto1_parentesco") ||
        !getVal("contacto2_nombre") || !getVal("contacto2_celular") || !getVal("contacto2_parentesco")
      ) {
        return "Completá los 2 contactos de emergencia (nombre, celular y parentesco).";
      }
    }
    if (stepIdx === 2) {
      if (getRadio("tiene_obra_social") === "si" && (!getVal("obra_social_nombre") || !getVal("obra_social_afiliado"))) {
        return "Indicá cuál es tu obra social y tu número de afiliado.";
      }
      if (!getVal("grupo_sanguineo")) return "Seleccioná tu grupo y factor sanguíneo.";
      if (getRadio("tiene_alergias") === "si" && !getVal("alergias_detalle")) {
        return "Especificá tus alergias.";
      }
      if (getVal("dieta_tipo") === "Otro" && !getVal("dieta_otra")) {
        return "Especificá tu opción de dieta.";
      }
    }
    if (stepIdx === 3) {
      if (!getVal("como_se_entero") || !getVal("actividad_anual_pum") || !getVal("carrera")) {
        return "Completá cómo te enteraste, actividades de la PUM y tu carrera.";
      }
      if (!getRadio("area_pertenencia")) return "Seleccioná el área a la que pertenecés.";
      if (!getRadio("disponibilidad_hospitalidad")) return "Indicá tu disponibilidad para alojamiento o transporte.";
    }
    if (stepIdx === 4) {
      const tipoPart = getRadio("tipo_participante");
      if (!tipoPart) return "Seleccioná qué tipo de participante sos.";
      if (tipoPart !== "Voluntario" && tipoPart !== "Participante del proyecto") {
        const subtipo = getRadio("subtipo_equipo");
        if (!subtipo) return "Indicá si sos Referente o del Equipo General.";
        if (subtipo === "Referente" && !getVal("proyecto_area")) {
          return "Seleccioná el proyecto o área del que sos referente.";
        }
        if (subtipo === "Equipo General" && !getVal("rol_equipo_general")) {
          return "Seleccioná tu rol en el Equipo General.";
        }
      }
    }
    if (stepIdx === 5) {
      const traslado = getRadio("forma_traslado");
      if (!traslado) return "Seleccioná cómo vas a trasladarte a la zona.";
      if (traslado === "Movilidad propia" && getRadio("necesita_estacionamiento") === "si" && !getRadio("vehiculo_estacionamiento")) {
        return "Indicá qué vehículo necesitás estacionar.";
      }
    }
    return null;
  }

  btnNext.addEventListener("click", () => {
    if (!FORM_DEV_MODE) {
      const err = validateStep(currentStep);
      if (err) {
        showError(err);
        return;
      }
    }
    if (currentStep < TOTAL_STEPS - 1) {
      currentStep++;
      renderStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  if (FORM_DEV_MODE) {
    indicatorNodes.forEach((node, idx) => {
      node.addEventListener("click", () => {
        currentStep = idx;
        renderStep();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  btnPrev.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  async function readAndCompressFile(file?: File | null) {
    if (!file) return null;
    if (file.type.startsWith("image/") && file.type !== "image/gif") {
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      return {
        nombreArchivo: file.name.replace(/\.[^.]+$/, ".jpg"),
        mimeType: "image/jpeg",
        dataBase64: canvas.toDataURL("image/jpeg", 0.82),
      };
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return {
      nombreArchivo: file.name,
      mimeType: file.type || "application/pdf",
      dataBase64: dataUrl,
    };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const err = validateStep(i);
      if (err) {
        currentStep = i;
        renderStep();
        showError(err);
        return;
      }
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando inscripción...";
    showError("");

    try {
      const certFile = (document.getElementById("certificado-file") as HTMLInputElement).files?.[0];
      const certificado = certFile ? await readAndCompressFile(certFile) : null;

      const tipoParticipanteVal = getRadio("tipo_participante");
      const subtipoEquipoVal = getRadio("subtipo_equipo");
      const esEquipoGeneral = tipoParticipanteVal === "Parte del equipo" && subtipoEquipoVal === "Equipo General";
      const esVoluntario = tipoParticipanteVal === "Voluntario" || tipoParticipanteVal === "Participante del proyecto";
      const rolProyectoVal = esVoluntario
        ? "Voluntario"
        : subtipoEquipoVal === "Referente"
          ? "Referente"
          : "Equipo General";
      const proyectoAreaVal = esVoluntario || esEquipoGeneral
        ? getRadio("area_pertenencia") || (esEquipoGeneral ? "EQUIPO GENERAL" : "")
        : getVal("proyecto_area") || getRadio("area_pertenencia");

      const payload = {
        acepto_tyc: true,
        nombre_completo: getVal("nombre_completo"),
        dni: getVal("dni").replace(/\D/g, ""),
        fecha_nacimiento: getVal("fecha_nacimiento"),
        telefono: getVal("telefono"),
        email: getVal("email"),
        direccion: getVal("direccion"),
        es_mendoza: getRadio("es_mendoza") === "si",
        departamento_mendoza: getVal("departamento_mendoza"),
        provincia_origen: getVal("provincia_origen"),
        localidad_origen: getVal("localidad_origen"),
        fecha_llegada_mendoza: getVal("fecha_llegada_mendoza") || null,
        contacto1_nombre: getVal("contacto1_nombre"),
        contacto1_celular: getVal("contacto1_celular"),
        contacto1_parentesco: getVal("contacto1_parentesco"),
        contacto2_nombre: getVal("contacto2_nombre"),
        contacto2_celular: getVal("contacto2_celular"),
        contacto2_parentesco: getVal("contacto2_parentesco"),
        tiene_obra_social: getRadio("tiene_obra_social") === "si",
        obra_social_nombre: getVal("obra_social_nombre"),
        obra_social_afiliado: getVal("obra_social_afiliado"),
        grupo_sanguineo: getVal("grupo_sanguineo"),
        tiene_alergias: getRadio("tiene_alergias") === "si",
        alergias_detalle: getVal("alergias_detalle"),
        enfermedad_cronica: getVal("enfermedad_cronica"),
        medicamento_actual: getVal("medicamento_actual"),
        dieta_tipo: getVal("dieta_tipo"),
        dieta_otra: getVal("dieta_otra"),
        como_se_entero: getVal("como_se_entero"),
        actividad_anual_pum: getVal("actividad_anual_pum"),
        carrera: getVal("carrera"),
        area_pertenencia: getRadio("area_pertenencia"),
        disponibilidad_hospitalidad: getRadio("disponibilidad_hospitalidad"),
        tipo_participante: tipoParticipanteVal,
        proyecto_area: proyectoAreaVal,
        rol_proyecto: rolProyectoVal,
        tiene_rol_equipo_general: esEquipoGeneral,
        rol_equipo_general: esEquipoGeneral ? getVal("rol_equipo_general") : "",
        forma_traslado: getRadio("forma_traslado"),
        necesita_estacionamiento: getRadio("necesita_estacionamiento") === "si",
        vehiculo_estacionamiento: getRadio("vehiculo_estacionamiento"),
        amigos_grupo: getVal("amigos_grupo"),
        certificado,
      };

      const res = await fetch(`${API_URL}/api/public/inscripciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo completar la inscripción.");
      }

      lastRegisteredDni = payload.dni;
      const waBtn = document.getElementById("btn-whatsapp-comprobante");
      if (waBtn) waBtn.setAttribute("href", buildWhatsappUrl(payload.nombre_completo, payload.dni));
      localStorage.removeItem(DRAFT_KEY);
      wizardWrapper.classList.add("hidden");
      successScreen.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error de conexión.");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Enviar Inscripción 🎒✨";
    }
  });

  document.getElementById("btn-go-consulta")!.addEventListener("click", () => {
    switchMode("consulta");
    if (lastRegisteredDni) {
      (document.getElementById("consulta-dni") as HTMLInputElement).value = lastRegisteredDni;
      void runConsulta(lastRegisteredDni);
    }
  });

  async function loadConfig() {
    try {
      const res = await fetch(`${API_URL}/api/public/config`);
      if (!res.ok) return;
      const cfg = await res.json();
      if (!cfg) return;
      if (cfg.inscripciones_abiertas === false) {
        document.getElementById("closed-banner")!.classList.remove("hidden");
      }
      document.getElementById("cfg-monto-total")!.textContent = cfg.monto_total || "A definir";
      document.getElementById("cfg-alias")!.textContent = cfg.alias_pago || "MO2026PUM";
      const titularEl = document.getElementById("cfg-titular")!;
      titularEl.textContent = "A nombre de ";
      const strongTitular = document.createElement("strong");
      strongTitular.textContent = cfg.titular_pago || "Lucas Nicolas Gonzales Cortez";
      titularEl.append(strongTitular, ` — ${cfg.entidad_pago || "Cuenta de NaranjaX"}`);
      const cuotasContainer = document.getElementById("cfg-cuotas-list")!;
      cuotasContainer.replaceChildren();
      (cfg.cuotas_info || []).forEach((c: { nombre: string; monto: string; fechaLimite: string }) => {
        const card = document.createElement("div");
        card.className = "bg-base-200 p-2.5 rounded-xl flex items-center justify-between";
        const spanLeft = document.createElement("span");
        spanLeft.className = "font-semibold";
        spanLeft.textContent = `${c.nombre}: ${c.monto}`;
        const spanRight = document.createElement("span");
        spanRight.className = "opacity-75";
        spanRight.textContent = `Vence: ${c.fechaLimite}`;
        card.append(spanLeft, spanRight);
        cuotasContainer.appendChild(card);
      });
    } catch {
      // fallback defaults remain rendered
    }
  }
  void loadConfig();

  document.getElementById("copy-alias-btn")!.addEventListener("click", async () => {
    const alias = document.getElementById("cfg-alias")!.textContent || "MO2026PUM";
    await navigator.clipboard.writeText(alias);
    const label = document.getElementById("copy-alias-label");
    if (label) {
      label.textContent = "¡Copiado!";
      setTimeout(() => (label.textContent = "Copiar"), 1500);
    }
  });

  async function runConsulta(dniRaw: string) {
    const dni = String(dniRaw).replace(/\D/g, "");
    const errEl = document.getElementById("consulta-error")!;
    const resEl = document.getElementById("consulta-result")!;
    errEl.classList.add("hidden");
    try {
      const res = await fetch(`${API_URL}/api/public/consulta?dni=${encodeURIComponent(dni)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No encontrado");

      activeConsultaDni = dni;
      const ins = data.inscripcion;
      document.getElementById("res-nombre")!.textContent = ins.nombre_completo;
      document.getElementById("res-detalle")!.textContent =
        `DNI ${ins.dni} · Área ${ins.proyecto_area} (${ins.rol_proyecto}) · Zona: ${ins.zona_asignada}`;
      document.getElementById("res-badge-cert")!.textContent = `Certificado: ${ins.estado_certificado}`;
      document.getElementById("res-badge-pago")!.textContent =
        `Pago: ${ins.estado_pago} ($${Number(ins.monto_abonado || 0).toLocaleString("es-AR")})`;

      const consultaWaBtn = document.getElementById("consulta-whatsapp-btn");
      if (consultaWaBtn) consultaWaBtn.setAttribute("href", buildWhatsappUrl(ins.nombre_completo, ins.dni));

      const archEl = document.getElementById("res-archivos")!;
      archEl.replaceChildren();
      if (!data.archivos?.length) {
        const emptyP = document.createElement("p");
        emptyP.className = "opacity-70";
        emptyP.textContent = "Todavía no subiste tu certificado de alumno regular.";
        archEl.appendChild(emptyP);
      } else {
        data.archivos.forEach(
          (a: { tipo: string; cuota_numero?: number; monto_declarado?: number; nombre_archivo: string; estado_revision: string }) => {
            const row = document.createElement("div");
            row.className = "bg-base-100/70 px-3 py-2 rounded-xl flex justify-between items-center";
            const labelSpan = document.createElement("span");
            const prefix =
              a.tipo === "certificado_regular"
                ? "Certificado Alumno Regular"
                : `Comprobante Cuota ${a.cuota_numero || 1} ($${a.monto_declarado || 0})`;
            labelSpan.textContent = `${prefix} — ${a.nombre_archivo}`;
            const badgeSpan = document.createElement("span");
            badgeSpan.className = "badge badge-xs";
            badgeSpan.textContent = a.estado_revision;
            row.append(labelSpan, badgeSpan);
            archEl.appendChild(row);
          },
        );
      }
      resEl.classList.remove("hidden");
    } catch (err) {
      resEl.classList.add("hidden");
      errEl.textContent = err instanceof Error ? err.message : "Error al consultar DNI";
      errEl.classList.remove("hidden");
    }
  }

  document.getElementById("consulta-form")!.addEventListener("submit", (e) => {
    e.preventDefault();
    void runConsulta((document.getElementById("consulta-dni") as HTMLInputElement).value);
  });

  document.getElementById("upload-cert-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("consulta-upload-msg")!;
    const errEl = document.getElementById("consulta-error")!;
    msgEl.classList.add("hidden");
    errEl.classList.add("hidden");
    const file = (document.getElementById("consulta-cert-file") as HTMLInputElement).files?.[0];
    if (!file || !activeConsultaDni) return;
    try {
      const compressed = await readAndCompressFile(file);
      const res = await fetch(`${API_URL}/api/public/adjuntos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: activeConsultaDni,
          tipo: "certificado_regular",
          ...compressed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir el archivo");
      msgEl.textContent = "¡Archivo subido correctamente! El equipo de inscripciones lo revisará pronto.";
      msgEl.classList.remove("hidden");
      await runConsulta(activeConsultaDni);
    } catch (err) {
      errEl.textContent = err instanceof Error ? err.message : "Error al subir";
      errEl.classList.remove("hidden");
    }
  });
}
