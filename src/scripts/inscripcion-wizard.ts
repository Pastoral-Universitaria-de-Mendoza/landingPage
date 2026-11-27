import {
  MAX_CERT_FILE_BYTES,
  getAgeFromDob,
  isValidDni,
  isValidEmail,
  isValidPhone,
  normalizeDni,
} from "./inscripcion-validation";

export function initInscripcionWizard() {
  const root = document.getElementById("inscripcion-root");
  if (!root) return;

  const API_URL = (root.dataset.apiUrl ?? "").replace(/\/$/, "");
  const FORM_DEV_MODE = root.dataset.devMode === "true";
  const WHATSAPP_NUMBER = root.dataset.whatsapp ?? "5492634757235";
  const DRAFT_KEY = "mo2026_inscripcion_draft";
  const TOTAL_STEPS = 7;

  let currentStep = 0;
  let activeConsultaDni = "";
  let activeConsultaNombre = "";
  let isClosed = false;
  let montoTotalConfig = "$30.000";
  const MONTO_DIA_VISITA = "$10.000";

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

  function buildWhatsappUrl(nombre: string, dni: string, opcionPago?: string, tipoInscripcion?: string) {
    const opcionTxt =
      tipoInscripcion === "dia_visita"
        ? " (Opción: Día de Visita 29/12)"
        : opcionPago === "sena"
          ? " (Opción: Seña)"
          : opcionPago === "total"
            ? " (Opción: Pago total)"
            : "";
    const text = `¡Hola! Soy ${nombre || ""} (DNI ${dni || ""}) y me inscribí al Manos a la Obra 2026${opcionTxt}. Te envío mi comprobante de pago.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function syncStepWhatsappLink() {
    const stepWaBtn = document.getElementById("btn-step-whatsapp");
    if (!stepWaBtn) return;
    const tipoInscripcion = getRadio("tipo_inscripcion");
    const opcionPago = tipoInscripcion === "dia_visita" ? "total" : getRadio("opcion_pago");
    stepWaBtn.setAttribute(
      "href",
      buildWhatsappUrl(getVal("nombre_completo"), normalizeDni(getVal("dni")), opcionPago, tipoInscripcion),
    );
  }

  const btnOpenContactoModal = document.getElementById("btn-open-contacto-modal");
  const contactoModal = document.getElementById("contacto-inscripciones-modal") as HTMLDialogElement | null;
  if (btnOpenContactoModal && contactoModal) {
    btnOpenContactoModal.addEventListener("click", () => {
      contactoModal.showModal();
    });
  }

  function switchMode(mode: "nueva" | "consulta") {
    const isConsulta = mode === "consulta";
    tabConsulta.classList.toggle("tab-active", isConsulta);
    tabConsulta.setAttribute("aria-selected", String(isConsulta));
    tabNueva.classList.toggle("tab-active", !isConsulta);
    tabNueva.setAttribute("aria-selected", String(!isConsulta));
    wizardWrapper.classList.toggle("hidden", isConsulta);
    consultaWrapper.classList.toggle("hidden", !isConsulta);
    successScreen.classList.add("hidden");
  }

  tabNueva.addEventListener("click", () => switchMode("nueva"));
  tabConsulta.addEventListener("click", () => switchMode("consulta"));

  const params = new URLSearchParams(window.location.search);
  if (params.get("modo") === "consulta") switchMode("consulta");

  function showError(msg: string, focusField?: string) {
    form.querySelectorAll<HTMLElement>("[aria-invalid='true']").forEach((el) => el.removeAttribute("aria-invalid"));
    if (!msg) {
      errBox.classList.add("hidden");
      return;
    }
    errText.textContent = msg;
    errBox.classList.remove("hidden");
    const target = focusField
      ? form.querySelector<HTMLElement>(`[name="${focusField}"]`)
      : null;
    if (target) {
      target.setAttribute("aria-invalid", "true");
      target.focus({ preventScroll: true });
    }
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
    if (currentStep === TOTAL_STEPS - 1) syncStepWhatsappLink();
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
    const mostrarJovenProf = tipoParticipante === "Joven Profesional";
    const mostrarProyecto = tipoParticipante === "Referente de Área";
    const mostrarRolGeneral = tipoParticipante === "Equipo General del Manos";
    document.getElementById("estudiante-academico-fields")?.classList.toggle("hidden", mostrarJovenProf);
    document.getElementById("joven-profesional-fields")?.classList.toggle("hidden", !mostrarJovenProf);
    document.getElementById("proyecto-area-wrap")!.classList.toggle("hidden", !mostrarProyecto);
    document.getElementById("equipo-general-fields")!.classList.toggle("hidden", !mostrarRolGeneral);

    const areaSeleccionada = getRadio("area_pertenencia");
    document.getElementById("salud-convivencia-banner")?.classList.toggle("hidden", areaSeleccionada !== "SALUD");

    const tipoInscripcion = getRadio("tipo_inscripcion");
    const isDiaVisita = tipoInscripcion === "dia_visita";
    document.getElementById("pago-info-section")?.classList.toggle("hidden", !tipoInscripcion);
    document.getElementById("opcion-pago-fieldset")?.classList.toggle("hidden", tipoInscripcion !== "completo");
    document.getElementById("confirmacion-pago-completo")?.classList.toggle("hidden", isDiaVisita);
    document.getElementById("confirmacion-pago-visita")?.classList.toggle("hidden", !isDiaVisita);
    const montoLabel = document.getElementById("cfg-monto-label");
    if (montoLabel) {
      montoLabel.textContent =
        tipoInscripcion === "dia_visita" ? "Monto Día de Visita (29/12)" : "Monto total del Manos";
    }
    const montoTotalEl = document.getElementById("cfg-monto-total");
    if (montoTotalEl) {
      montoTotalEl.textContent = tipoInscripcion === "dia_visita" ? MONTO_DIA_VISITA : montoTotalConfig;
    }
    if (tipoInscripcion === "dia_visita") {
      const totalRadio = form.querySelector<HTMLInputElement>('input[name="opcion_pago"][value="total"]');
      if (totalRadio) totalRadio.checked = true;
    }
    syncStepWhatsappLink();
  }

  function saveDraft() {
    try {
      const fd = new FormData(form);
      const obj: Record<string, string | boolean> = {};
      for (const [k, v] of fd.entries()) {
        if (typeof v === "string") obj[k] = v;
      }
      obj.acepto_tyc = (form.querySelector("#acepto_tyc") as HTMLInputElement).checked;
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(obj));
    } catch {
      // ignore storage quota/security errors
    }
  }

  function loadDraft() {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
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

  syncConditionals();
  renderStep();

  form.addEventListener("change", () => {
    syncConditionals();
    saveDraft();
  });
  form.addEventListener("input", saveDraft);

  type ValidationError = { msg: string; field?: string };

  function validateStep(stepIdx: number): ValidationError | null {
    if (stepIdx === 0) {
      if (!(form.querySelector("#acepto_tyc") as HTMLInputElement).checked) {
        return { msg: "Debés leer y aceptar las Bases y Condiciones para continuar.", field: "acepto_tyc" };
      }
    }
    if (stepIdx === 1) {
      if (!getVal("nombre_completo")) {
        return { msg: "Ingresá tu nombre completo como aparece en el DNI.", field: "nombre_completo" };
      }
      if (!isValidDni(getVal("dni"))) {
        return { msg: "Ingresá un DNI válido sin puntos (7 a 9 dígitos).", field: "dni" };
      }
      const dob = getVal("fecha_nacimiento");
      if (!dob) return { msg: "Ingresá tu fecha de nacimiento.", field: "fecha_nacimiento" };
      const age = getAgeFromDob(dob);
      if (age === null) return { msg: "Ingresá una fecha de nacimiento válida.", field: "fecha_nacimiento" };
      if (age < 18 || age > 35) {
        return { msg: "Según las Bases y Condiciones, la participación es de 18 a 35 años.", field: "fecha_nacimiento" };
      }
      if (!isValidPhone(getVal("telefono"))) {
        return { msg: "Ingresá un número de teléfono válido (al menos 7 dígitos).", field: "telefono" };
      }
      if (!isValidEmail(getVal("email"))) {
        return { msg: "Ingresá un correo electrónico válido.", field: "email" };
      }
      if (!getVal("direccion")) {
        return { msg: "Ingresá tu dirección.", field: "direccion" };
      }
      if (getRadio("es_mendoza") === "si") {
        if (!getVal("departamento_mendoza")) {
          return { msg: "Seleccioná tu departamento de Mendoza.", field: "departamento_mendoza" };
        }
      } else {
        if (!getVal("provincia_origen")) return { msg: "Seleccioná tu provincia de origen.", field: "provincia_origen" };
        if (!getVal("localidad_origen")) return { msg: "Completá tu localidad de origen.", field: "localidad_origen" };
        if (!getVal("fecha_llegada_mendoza")) {
          return { msg: "Indicá qué día llegarías a Mendoza.", field: "fecha_llegada_mendoza" };
        }
      }
      for (const prefix of ["contacto1", "contacto2"] as const) {
        if (!getVal(`${prefix}_nombre`)) {
          return { msg: "Completá los 2 contactos de emergencia (nombre, celular y parentesco).", field: `${prefix}_nombre` };
        }
        if (!isValidPhone(getVal(`${prefix}_celular`))) {
          return { msg: "Ingresá un celular válido para los contactos de emergencia.", field: `${prefix}_celular` };
        }
        if (!getVal(`${prefix}_parentesco`)) {
          return { msg: "Completá el parentesco de los 2 contactos de emergencia.", field: `${prefix}_parentesco` };
        }
      }
    }
    if (stepIdx === 2) {
      if (getRadio("tiene_obra_social") === "si") {
        if (!getVal("obra_social_nombre")) return { msg: "Indicá cuál es tu obra social.", field: "obra_social_nombre" };
        if (!getVal("obra_social_afiliado")) return { msg: "Indicá tu número de afiliado.", field: "obra_social_afiliado" };
      }
      if (!getVal("grupo_sanguineo")) return { msg: "Seleccioná tu grupo y factor sanguíneo.", field: "grupo_sanguineo" };
      if (getRadio("tiene_alergias") === "si" && !getVal("alergias_detalle")) {
        return { msg: "Especificá tus alergias.", field: "alergias_detalle" };
      }
      if (getVal("dieta_tipo") === "Otro" && !getVal("dieta_otra")) {
        return { msg: "Especificá tu opción de dieta.", field: "dieta_otra" };
      }
    }
    if (stepIdx === 3) {
      const tipoPart = getRadio("tipo_participante");
      if (!tipoPart) return { msg: "Seleccioná qué tipo de participante sos.", field: "tipo_participante" };
      if (tipoPart === "Referente de Área" && !getVal("proyecto_area")) {
        return { msg: "Seleccioná el proyecto o área del que sos referente.", field: "proyecto_area" };
      }
      if (tipoPart === "Equipo General del Manos" && !getVal("rol_equipo_general")) {
        return { msg: "Seleccioná tu rol en el Equipo General.", field: "rol_equipo_general" };
      }
    }
    if (stepIdx === 4) {
      if (!getVal("como_se_entero")) return { msg: "Indicá cómo te enteraste del Manos a la Obra.", field: "como_se_entero" };
      if (!getVal("actividad_anual_pum")) return { msg: "Indicá tu participación en actividades de la PUM.", field: "actividad_anual_pum" };
      if (getRadio("tipo_participante") === "Joven Profesional") {
        if (!getVal("jp_recibido_donde_que")) return { msg: "Indicá dónde y de qué te recibiste.", field: "jp_recibido_donde_que" };
        if (!getVal("jp_recibido_hace_cuanto")) return { msg: "Indicá hace cuánto te recibiste.", field: "jp_recibido_hace_cuanto" };
        if (!getVal("jp_donde_trabaja")) return { msg: "Indicá dónde trabajás.", field: "jp_donde_trabaja" };
      } else {
        if (!getVal("universidad")) return { msg: "Ingresá en qué Universidad estudiás.", field: "universidad" };
        if (!getVal("carrera")) return { msg: "Ingresá tu carrera.", field: "carrera" };
      }
      if (!getRadio("area_pertenencia")) return { msg: "Seleccioná el área a la que pertenecés.", field: "area_pertenencia" };
      if (!getRadio("disponibilidad_hospitalidad")) {
        return { msg: "Indicá tu disponibilidad para alojamiento o transporte.", field: "disponibilidad_hospitalidad" };
      }
    }
    if (stepIdx === 5) {
      const traslado = getRadio("forma_traslado");
      if (!traslado) return { msg: "Seleccioná cómo vas a trasladarte a la zona.", field: "forma_traslado" };
    }
    if (stepIdx === 6) {
      const tipoInscripcion = getRadio("tipo_inscripcion");
      if (!tipoInscripcion) {
        return {
          msg: "Seleccioná si te inscribís al Manos a la Obra Completo o al Día de Visita 29/12.",
          field: "tipo_inscripcion",
        };
      }
      if (tipoInscripcion === "completo" && !getRadio("opcion_pago")) {
        return { msg: "Seleccioná si vas a pagar el total o señar ahora.", field: "opcion_pago" };
      }
    }
    return null;
  }

  btnNext.addEventListener("click", () => {
    if (!FORM_DEV_MODE) {
      const err = validateStep(currentStep);
      if (err) {
        showError(err.msg, err.field);
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
    if (file.size > MAX_CERT_FILE_BYTES) {
      throw new Error("El archivo supera el límite de 8 MB.");
    }
    if (file.type.startsWith("image/") && file.type !== "image/gif") {
      const img = new Image();
      const url = URL.createObjectURL(file);
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error("No se pudo procesar la imagen. Probá con JPG, PNG o PDF."));
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
        return {
          nombreArchivo: file.name.replace(/\.[^.]+$/, ".jpg"),
          mimeType: "image/jpeg",
          dataBase64: canvas.toDataURL("image/jpeg", 0.82),
        };
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
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
    if (!FORM_DEV_MODE && isClosed) {
      showError("Las inscripciones generales se encuentran cerradas por el momento.");
      return;
    }
    let firstErr: { step: number; err: ValidationError } | null = null;
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const err = validateStep(i);
      if (err) {
        firstErr = { step: i, err };
        break;
      }
    }
    if (firstErr && !FORM_DEV_MODE) {
      currentStep = firstErr.step;
      renderStep();
      showError(firstErr.err.msg, firstErr.err.field);
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando inscripción...";
    showError("");

    try {
      const tipoParticipanteVal = getRadio("tipo_participante");
      const esJovenProf = tipoParticipanteVal === "Joven Profesional";
      const certFile = (document.getElementById("certificado-file") as HTMLInputElement).files?.[0];
      const certificado = !esJovenProf && certFile ? await readAndCompressFile(certFile) : null;
      const certTallerFile = (document.getElementById("certificado-taller-file") as HTMLInputElement).files?.[0];
      const certificado_taller = certTallerFile ? await readAndCompressFile(certTallerFile) : null;

      const esEquipoGeneral = tipoParticipanteVal === "Equipo General del Manos";
      const esReferente = tipoParticipanteVal === "Referente de Área";
      const rolProyectoVal = tipoParticipanteVal;
      const proyectoAreaVal = esReferente
        ? getVal("proyecto_area") || getRadio("area_pertenencia")
        : getRadio("area_pertenencia") || (esEquipoGeneral ? "EQUIPO GENERAL" : "");

      const payload = {
        acepto_tyc: true,
        nombre_completo: getVal("nombre_completo"),
        dni: normalizeDni(getVal("dni")),
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
        universidad: esJovenProf ? getVal("jp_recibido_donde_que") : getVal("universidad"),
        carrera: esJovenProf ? getVal("jp_donde_trabaja") : getVal("carrera"),
        jp_recibido_donde_que: esJovenProf ? getVal("jp_recibido_donde_que") : "",
        jp_recibido_hace_cuanto: esJovenProf ? getVal("jp_recibido_hace_cuanto") : "",
        jp_donde_trabaja: esJovenProf ? getVal("jp_donde_trabaja") : "",
        jp_formaciones_extra: esJovenProf ? getVal("jp_formaciones_extra") : "",
        area_pertenencia: getRadio("area_pertenencia"),
        disponibilidad_hospitalidad: getRadio("disponibilidad_hospitalidad"),
        tipo_participante: tipoParticipanteVal,
        proyecto_area: proyectoAreaVal,
        rol_proyecto: rolProyectoVal,
        tiene_rol_equipo_general: esEquipoGeneral,
        rol_equipo_general: esEquipoGeneral ? getVal("rol_equipo_general") : "",
        forma_traslado: getRadio("forma_traslado"),
        tipo_inscripcion: getRadio("tipo_inscripcion") || "completo",
        opcion_pago: getRadio("tipo_inscripcion") === "dia_visita" ? "total" : (getRadio("opcion_pago") || "total"),
        certificado,
        certificado_taller,
      };

      if (!firstErr) {
        const res = await fetch(`${API_URL}/api/public/inscripciones`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "No se pudo completar la inscripción.");
        }
      }

      const waBtn = document.getElementById("btn-whatsapp-comprobante");
      if (waBtn) {
        waBtn.setAttribute(
          "href",
          buildWhatsappUrl(payload.nombre_completo, payload.dni, payload.opcion_pago, payload.tipo_inscripcion),
        );
      }

      const areaElegida = payload.proyecto_area || payload.area_pertenencia;
      const esSalud = areaElegida === "SALUD" || payload.area_pertenencia === "SALUD";
      document.getElementById("salud-convivencia-success")?.classList.toggle("hidden", !esSalud);

      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
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

  async function loadConfig() {
    try {
      const res = await fetch(`${API_URL}/api/public/config`);
      if (!res.ok) return;
      const cfg = await res.json();
      if (!cfg) return;
      if (cfg.inscripciones_abiertas === false) {
        isClosed = true;
        document.getElementById("closed-banner")!.classList.remove("hidden");
        btnNext.disabled = true;
        btnSubmit.disabled = true;
      }
      montoTotalConfig =
        cfg.monto_total && cfg.monto_total !== "A definir" ? cfg.monto_total : "$30.000";
      document.getElementById("cfg-monto-total")!.textContent =
        getRadio("tipo_inscripcion") === "dia_visita" ? MONTO_DIA_VISITA : montoTotalConfig;
      const montoTotalOptEl = document.getElementById("cfg-monto-total-opt");
      if (montoTotalOptEl) montoTotalOptEl.textContent = montoTotalConfig;
      const montoSenaEl = document.getElementById("cfg-monto-sena");
      if (montoSenaEl) {
        montoSenaEl.textContent =
          cfg.monto_minimo_sena && cfg.monto_minimo_sena !== "A definir"
            ? cfg.monto_minimo_sena
            : "$10.000";
      }
      document.getElementById("cfg-alias")!.textContent = cfg.alias_pago || "MO2026PUM";
      const titularEl = document.getElementById("cfg-titular")!;
      titularEl.textContent = "A nombre de ";
      const strongTitular = document.createElement("strong");
      strongTitular.textContent = cfg.titular_pago || "Lucas Nicolas Gonzales Cortez";
      titularEl.append(strongTitular, ` — ${cfg.entidad_pago || "Cuenta de NaranjaX"}`);
    } catch {
      // fallback defaults remain rendered
    }
  }
  void loadConfig();

  document.getElementById("copy-alias-btn")!.addEventListener("click", async () => {
    const alias = document.getElementById("cfg-alias")!.textContent || "MO2026PUM";
    try {
      await navigator.clipboard.writeText(alias);
      const label = document.getElementById("copy-alias-label");
      if (label) {
        label.textContent = "¡Copiado!";
        setTimeout(() => (label.textContent = "Copiar"), 1500);
      }
    } catch {
      // clipboard unavailable
    }
  });

  async function runConsulta(dniRaw: string, nombreRaw: string) {
    const dni = normalizeDni(dniRaw);
    const nombre = String(nombreRaw).trim();
    const errEl = document.getElementById("consulta-error")!;
    const errText = document.getElementById("consulta-error-text") || errEl;
    const resEl = document.getElementById("consulta-result")!;
    const btnSubmitConsulta = document.getElementById("btn-consulta-submit") as HTMLButtonElement | null;
    const btnLabel = document.getElementById("btn-consulta-label");

    errEl.classList.add("hidden");

    if (!isValidDni(dni)) {
      errText.textContent = "Ingresá un DNI válido (7 a 9 dígitos sin puntos).";
      errEl.classList.remove("hidden");
      return;
    }
    if (!nombre) {
      errText.textContent = "Ingresá tu nombre completo tal como figura en tu DNI.";
      errEl.classList.remove("hidden");
      return;
    }

    if (btnSubmitConsulta) btnSubmitConsulta.disabled = true;
    if (btnLabel) btnLabel.textContent = "Consultando...";

    try {
      const res = await fetch(
        `${API_URL}/api/public/consulta?dni=${encodeURIComponent(dni)}&nombre=${encodeURIComponent(nombre)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No encontramos ninguna inscripción con esos datos.");

      const ins = data.inscripcion;
      activeConsultaDni = dni;
      activeConsultaNombre = ins.nombre_completo;

      document.getElementById("res-nombre")!.textContent = ins.nombre_completo;
      document.getElementById("res-detalle")!.textContent =
        `DNI ${ins.dni} · Área ${ins.proyecto_area} (${ins.rol_proyecto}) · Sede: ${ins.zona_asignada || "A asignar"}`;

      const estadoEl = document.getElementById("res-badge-estado");
      if (estadoEl) {
        const estText = ins.estado_inscripcion || "registrada";
        estadoEl.textContent = `Estado: ${estText.toUpperCase()}`;
        estadoEl.className = "badge badge-sm font-sans " + (
          estText === "confirmada" ? "badge-success text-success-content" :
          estText === "lista_espera" ? "badge-warning text-warning-content" :
          "badge-outline border-base-content/30"
        );
      }

      const pagoBadge = document.getElementById("res-badge-pago")!;
      const opcionLabel =
        ins.tipo_inscripcion === "dia_visita"
          ? "Día de Visita 29/12"
          : ins.opcion_pago === "sena"
            ? "Seña"
            : "Total";
      const pagoLabel =
        ins.estado_pago === "pagado" ? "Pagado" : ins.estado_pago === "parcial" ? "Señó" : "Pendiente";
      pagoBadge.textContent = `${pagoLabel} (${opcionLabel})`;
      pagoBadge.className = "badge badge-md font-heading " + (
        ins.estado_pago === "pagado" ? "badge-success text-success-content" :
        ins.estado_pago === "parcial" ? "badge-warning text-warning-content" :
        "badge-secondary text-secondary-content"
      );

      const consultaWaBox = document.getElementById("consulta-whatsapp-box");
      consultaWaBox?.classList.toggle("hidden", ins.estado_pago === "pagado");
      const consultaWaBtn = document.getElementById("consulta-whatsapp-btn");
      if (consultaWaBtn) {
        consultaWaBtn.setAttribute(
          "href",
          buildWhatsappUrl(ins.nombre_completo, ins.dni, ins.opcion_pago, ins.tipo_inscripcion),
        );
      }

      const archivosList: Array<{
        tipo: string;
        cuota_numero?: number;
        monto_declarado?: number;
        nombre_archivo: string;
        estado_revision: string;
      }> = data.archivos ?? [];
      const tieneCertSubido = archivosList.some(
        (a) => a.tipo === "certificado_regular" && a.estado_revision !== "rechazado",
      );
      document.getElementById("upload-cert-form")?.classList.toggle("hidden", tieneCertSubido);

      const archEl = document.getElementById("res-archivos")!;
      archEl.replaceChildren();
      if (!archivosList.length) {
        const emptyP = document.createElement("p");
        emptyP.className = "text-xs sm:text-sm text-base-content/65 italic py-1";
        emptyP.textContent = "Todavía no subiste tu certificado de alumno regular o certificado de título.";
        archEl.appendChild(emptyP);
      } else {
        archivosList.forEach((a) => {
          const row = document.createElement("div");
          row.className = "bg-base-100/80 border border-base-content/10 px-3.5 py-2.5 rounded-xl flex justify-between items-center text-xs sm:text-sm";
          const labelSpan = document.createElement("span");
          const prefix =
            a.tipo === "certificado_regular"
              ? "Certificado Alumno Regular / Título"
              : a.tipo === "certificado_taller"
                ? "Certificado Taller Protección"
                : `Comprobante Cuota ${a.cuota_numero || 1} ($${a.monto_declarado || 0})`;
          labelSpan.textContent = `${prefix} — ${a.nombre_archivo}`;
          const badgeSpan = document.createElement("span");
          badgeSpan.className = "badge badge-xs " + (
            a.estado_revision === "aprobado" ? "badge-success text-success-content" :
            a.estado_revision === "rechazado" ? "badge-error text-error-content" :
            "badge-warning text-warning-content"
          );
          badgeSpan.textContent = a.estado_revision;
          row.append(labelSpan, badgeSpan);
          archEl.appendChild(row);
        });
      }
      resEl.classList.remove("hidden");
      resEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      resEl.classList.add("hidden");
      errText.textContent = err instanceof Error ? err.message : "Error al consultar inscripción.";
      errEl.classList.remove("hidden");
    } finally {
      if (btnSubmitConsulta) btnSubmitConsulta.disabled = false;
      if (btnLabel) btnLabel.textContent = "Consultar estado";
    }
  }

  document.getElementById("consulta-form")!.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("consulta-upload-msg")?.classList.add("hidden");
    const dniVal = (document.getElementById("consulta-dni") as HTMLInputElement).value;
    const nombreVal = (document.getElementById("consulta-nombre") as HTMLInputElement).value;
    void runConsulta(dniVal, nombreVal);
  });

  document.getElementById("upload-cert-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("consulta-upload-msg")!;
    const msgText = document.getElementById("consulta-upload-text") || msgEl;
    const errEl = document.getElementById("consulta-error")!;
    const errText = document.getElementById("consulta-error-text") || errEl;
    const btnUpload = document.getElementById("btn-upload-cert") as HTMLButtonElement | null;
    const fileInput = document.getElementById("consulta-cert-file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file || !activeConsultaDni || !activeConsultaNombre) return;

    msgEl.classList.add("hidden");
    errEl.classList.add("hidden");
    if (btnUpload) {
      btnUpload.disabled = true;
      btnUpload.textContent = "Subiendo...";
    }

    try {
      const compressed = await readAndCompressFile(file);
      const res = await fetch(`${API_URL}/api/public/adjuntos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: activeConsultaDni,
          nombre_completo: activeConsultaNombre,
          tipo: "certificado_regular",
          ...compressed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir el archivo.");
      fileInput.value = "";
      msgText.textContent = "¡Certificado subido correctamente! El equipo de inscripciones lo revisará pronto.";
      msgEl.classList.remove("hidden");
      await runConsulta(activeConsultaDni, activeConsultaNombre);
    } catch (err) {
      errText.textContent = err instanceof Error ? err.message : "Error al subir el certificado.";
      errEl.classList.remove("hidden");
    } finally {
      if (btnUpload) {
        btnUpload.disabled = false;
        btnUpload.textContent = "Subir certificado";
      }
    }
  });
}
