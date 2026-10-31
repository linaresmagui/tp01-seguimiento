/* ==========================================================
   REGISTRO DE USO DE IA
   (Pegá acá el texto de tu comentario de registro de IA.)
   ========================================================== */

/* ==========================================================
   AVISO DE SEGURIDAD
   Esto NO es seguro para un sistema real: las claves se guardan
   en texto plano y cualquiera puede verlas o cambiarlas desde
   las herramientas del navegador (F12 > Application > Local Storage).
   Un sistema real necesita un servidor, claves cifradas (hash)
   y una base de datos. Acá usamos solo datos ficticios.
   ========================================================== */

/* ==========================================================
   1. CLAVES DE localStorage
   ========================================================== */
const CLAVE_DATOS = "seguimiento-datos";   // acá se guardan todos los arrays
const CLAVE_SESION = "seguimiento-sesion"; // acá se guarda el id del usuario conectado

/* ==========================================================
   2. ARRAYS (la "base de datos" en memoria)
   Campos de cada uno:
   - usuarios:      id, usuario, clave, rol, nombre, alumnoId
   - alumnos:       id, nombre, curso
   - notas:         id, alumnoId, materia, valor, fecha
   - asistencias:   id, alumnoId, fecha, estado ("P", "A", "T" o "J")
   - observaciones: id, alumnoId, tipo ("positiva" o "llamado"), texto, fecha, autorId
   ========================================================== */
let usuarios = [];
let alumnos = [];
let notas = [];
let asistencias = [];
let observaciones = [];

/* ==========================================================
   3. DATOS FICTICIOS (solo se usan si no hay nada guardado)
   ========================================================== */
function crearDatosFicticios() {
  // 6 alumnos: "Alumno A" a "Alumno F"
  alumnos = [
    { id: 1, nombre: "Alumno A", curso: "6.º A" },
    { id: 2, nombre: "Alumno B", curso: "6.º A" },
    { id: 3, nombre: "Alumno C", curso: "6.º A" },
    { id: 4, nombre: "Alumno D", curso: "6.º A" },
    { id: 5, nombre: "Alumno E", curso: "6.º A" },
    { id: 6, nombre: "Alumno F", curso: "6.º A" }
  ];

  // 5 usuarios, todos con clave 1234.
  // alumnoA y alumnoB quedan vinculados a su alumno con alumnoId.
  usuarios = [
    { id: 1, usuario: "docente1",   clave: "1234", rol: "docente",   nombre: "Docente Uno",   alumnoId: null },
    { id: 2, usuario: "preceptor1", clave: "1234", rol: "preceptor", nombre: "Preceptor Uno", alumnoId: null },
    { id: 3, usuario: "directivo1", clave: "1234", rol: "directivo", nombre: "Directivo Uno", alumnoId: null },
    { id: 4, usuario: "alumnoA",    clave: "1234", rol: "alumno",    nombre: "Alumno A",      alumnoId: 1 },
    { id: 5, usuario: "alumnoB",    clave: "1234", rol: "alumno",    nombre: "Alumno B",      alumnoId: 2 }
  ];

  // Estos tres empiezan vacíos: se van a llenar usando la aplicación
  notas = [];
  asistencias = [];
  observaciones = [];
}

/* ==========================================================
   4. GUARDAR Y CARGAR DATOS
   ========================================================== */

// Guarda los cinco arrays juntos, en un solo objeto, bajo "seguimiento-datos"
function guardarDatos() {
  const datos = { usuarios, alumnos, notas, asistencias, observaciones };
  localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
}

// Lee localStorage. Si no hay datos (o están dañados), crea los ficticios y los guarda
function cargarDatos() {
  const textoGuardado = localStorage.getItem(CLAVE_DATOS);

  if (textoGuardado) {
    try {
      const datos = JSON.parse(textoGuardado);
      usuarios = datos.usuarios || [];
      alumnos = datos.alumnos || [];
      notas = datos.notas || [];
      asistencias = datos.asistencias || [];
      observaciones = datos.observaciones || [];
      return; // ya cargamos todo, no hace falta crear nada
    } catch (error) {
      console.warn("Los datos guardados estaban dañados. Se crean datos nuevos.");
    }
  }

  crearDatosFicticios();
  guardarDatos();
}

/* ==========================================================
   5. SESIÓN (id del usuario conectado)
   ========================================================== */

// Guarda el id del usuario que inició sesión
function guardarSesion(usuarioId) {
  localStorage.setItem(CLAVE_SESION, String(usuarioId));
}

// Devuelve el id guardado como número, o null si no hay sesión
function obtenerSesion() {
  const textoGuardado = localStorage.getItem(CLAVE_SESION);
  return textoGuardado ? Number(textoGuardado) : null;
}

// Borra la sesión (la vamos a usar en el botón Salir)
function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}

/* ==========================================================
   6. REFERENCIAS A ELEMENTOS DEL HTML
   ========================================================== */
const pantallaInicioSesion = document.getElementById("pantalla-inicio-sesion");
const formularioInicioSesion = document.getElementById("formulario-inicio-sesion");
const campoUsuario = document.getElementById("campo-usuario");
const campoClave = document.getElementById("campo-clave");
const mensajeInicioSesion = document.getElementById("mensaje-inicio-sesion");

const encabezado = document.getElementById("encabezado");
const nombreUsuario = document.getElementById("nombre-usuario");
const rolUsuario = document.getElementById("rol-usuario");
const botonSalir = document.getElementById("boton-salir");

// Cada rol tiene su panel: la clave es el rol y el valor es el id del panel
const panelesPorRol = {
  docente: document.getElementById("panel-docente"),
  preceptor: document.getElementById("panel-preceptor"),
  directivo: document.getElementById("panel-directivo"),
  alumno: document.getElementById("panel-alumno")
};

/* ==========================================================
   7. FUNCIONES DE PANTALLA
   ========================================================== */

// Oculta los cuatro paneles (después mostramos solo el que corresponde)
function ocultarTodosLosPaneles() {
  for (const rol in panelesPorRol) {
    panelesPorRol[rol].hidden = true;
  }
}

// Muestra el login y oculta todo lo demás
function mostrarPantallaLogin() {
  ocultarTodosLosPaneles();
  encabezado.hidden = true;
  pantallaInicioSesion.hidden = false;
  formularioInicioSesion.reset();      // vacía usuario y clave
  mensajeInicioSesion.textContent = "";
  campoUsuario.focus();
}

// Oculta el login y muestra solo el panel del rol del usuario
function mostrarPanelDeUsuario(usuarioConectado) {
  pantallaInicioSesion.hidden = true;
  ocultarTodosLosPaneles();

  // Encabezado con el nombre y el rol
  nombreUsuario.textContent = usuarioConectado.nombre;
  rolUsuario.textContent = usuarioConectado.rol;
  encabezado.hidden = false;

  // Solo el panel de su rol
  panelesPorRol[usuarioConectado.rol].hidden = false;
}

/* ==========================================================
   8. INICIO DE SESIÓN Y SALIDA
   ========================================================== */

function iniciarSesion(evento) {
  evento.preventDefault(); // evita que el formulario recargue la página

  const usuarioEscrito = campoUsuario.value.trim();
  const claveEscrita = campoClave.value;

  // Buscamos el usuario por su nombre de usuario
  const usuarioEncontrado = usuarios.find(function (u) {
    return u.usuario === usuarioEscrito;
  });

  // Si no existe O la clave no coincide, damos el MISMO mensaje:
  // así no se revela cuál de los dos datos falló.
  if (!usuarioEncontrado || usuarioEncontrado.clave !== claveEscrita) {
    mensajeInicioSesion.textContent = "Usuario o clave incorrectos";
    campoClave.value = "";
    campoClave.focus();
    return;
  }

  // Todo bien: guardamos la sesión y mostramos su panel
  guardarSesion(usuarioEncontrado.id);
  mostrarPanelDeUsuario(usuarioEncontrado);
  formularioInicioSesion.reset();
}

function salir() {
  cerrarSesion();
  mostrarPantallaLogin();
}

// Conectamos los eventos
formularioInicioSesion.addEventListener("submit", iniciarSesion);
botonSalir.addEventListener("click", salir);

/* ==========================================================
   9. NOTAS (PANEL DOCENTE): alta, edición y baja
   Cada nota: id, alumnoId, materia, instancia, valor, fecha
   ========================================================== */
const formularioNotas = document.getElementById("formulario-notas");
const campoNotaAlumno = document.getElementById("nota-alumno");
const campoNotaMateria = document.getElementById("nota-materia");
const campoNotaInstancia = document.getElementById("nota-instancia");
const campoNotaValor = document.getElementById("nota-valor");
const campoNotaFecha = document.getElementById("nota-fecha");
const campoNotaId = document.getElementById("nota-id");
const mensajeNotas = document.getElementById("mensaje-notas");
const botonGuardarNota = document.getElementById("boton-guardar-nota");
const botonCancelarEdicion = document.getElementById("boton-cancelar-edicion");
const cuerpoPlanilla = document.querySelector("#planilla-notas tbody");

// Usamos nuestros propios mensajes en vez de los del navegador
formularioNotas.noValidate = true;

// --- Permisos ---------------------------------------------------------

// Devuelve el usuario conectado (según la sesión guardada) o null
function obtenerUsuarioConectado() {
  const idSesion = obtenerSesion();
  const encontrado = usuarios.find(function (u) {
    return u.id === idSesion;
  });
  return encontrado || null;
}

// true solo si hay alguien conectado y su rol es docente.
// Se vuelve a comprobar en cada función que modifica notas,
// porque ocultar un botón no alcanza para proteger nada.
function esDocenteConectado() {
  const usuarioConectado = obtenerUsuarioConectado();
  return usuarioConectado !== null && usuarioConectado.rol === "docente";
}

// --- Utilidades -------------------------------------------------------

// Fecha de hoy como texto "AAAA-MM-DD" (el mismo formato que usa input date)
function fechaDeHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return hoy.getFullYear() + "-" + mes + "-" + dia;
}

// "2026-10-24" -> "24/10/2026"
function formatearFecha(fechaTexto) {
  return fechaTexto.split("-").reverse().join("/");
}

function mostrarMensajeNotas(texto, esError) {
  mensajeNotas.textContent = texto;
  mensajeNotas.className = esError ? "mensaje-error" : "mensaje-ok";
}

// --- Validación -------------------------------------------------------

// Devuelve un texto con el error, o "" si todo está bien
function validarNota(datos) {
  const alumnoExiste = alumnos.some(function (a) {
    return a.id === datos.alumnoId;
  });
  if (!alumnoExiste) return "Elegí un alumno.";
  if (datos.materia === "") return "Escribí la materia.";
  if (datos.instancia === "") return "Elegí la instancia.";

  // Solo dígitos, y entre 1 y 10 (así se rechazan 7.5, -3 o 1e1)
  const valor = Number(datos.valorTexto);
  if (!/^[0-9]+$/.test(datos.valorTexto) || valor < 1 || valor > 10) {
    return "La nota debe ser un número entero entre 1 y 10.";
  }

  if (datos.fecha === "") return "Elegí la fecha.";
  if (datos.fecha > fechaDeHoy()) return "La fecha no puede ser futura.";

  // No repetir alumno + materia + instancia (ignorando la nota que se edita)
  const repetida = notas.some(function (n) {
    return n.id !== datos.id &&
      n.alumnoId === datos.alumnoId &&
      n.materia.toLowerCase() === datos.materia.toLowerCase() &&
      n.instancia === datos.instancia;
  });
  if (repetida) return "Ya hay una nota de ese alumno en esa materia e instancia.";

  return "";
}

// --- Alta y edición ---------------------------------------------------

function guardarNota(evento) {
  evento.preventDefault();

  if (!esDocenteConectado()) {
    mostrarMensajeNotas("Solo un docente puede guardar notas.", true);
    return;
  }

  const datos = {
    id: campoNotaId.value === "" ? null : Number(campoNotaId.value),
    alumnoId: Number(campoNotaAlumno.value),
    materia: campoNotaMateria.value.trim(),
    instancia: campoNotaInstancia.value,
    valorTexto: campoNotaValor.value.trim(),
    fecha: campoNotaFecha.value
  };

  const error = validarNota(datos);
  if (error !== "") {
    mostrarMensajeNotas(error, true);
    return;
  }

  if (datos.id === null) {
    // ALTA: id nuevo = el mayor que existe + 1
    const ids = notas.map(function (n) { return n.id; });
    const nuevoId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    notas.push({
      id: nuevoId,
      alumnoId: datos.alumnoId,
      materia: datos.materia,
      instancia: datos.instancia,
      valor: Number(datos.valorTexto),
      fecha: datos.fecha
    });
  } else {
    // EDICIÓN: buscamos la nota y cambiamos sus campos
    const nota = notas.find(function (n) { return n.id === datos.id; });
    if (!nota) {
      mostrarMensajeNotas("Esa nota ya no existe.", true);
      limpiarFormularioNotas();
      return;
    }
    nota.alumnoId = datos.alumnoId;
    nota.materia = datos.materia;
    nota.instancia = datos.instancia;
    nota.valor = Number(datos.valorTexto);
    nota.fecha = datos.fecha;
  }

  guardarDatos();
  limpiarFormularioNotas();
  dibujarPlanilla();
  mostrarMensajeNotas("Nota guardada.", false);
}

// Carga una nota en el formulario para modificarla
function iniciarEdicionNota(id) {
  if (!esDocenteConectado()) {
    mostrarMensajeNotas("Solo un docente puede editar notas.", true);
    return;
  }
  const nota = notas.find(function (n) { return n.id === id; });
  if (!nota) return;

  campoNotaId.value = nota.id;
  campoNotaAlumno.value = nota.alumnoId;
  campoNotaMateria.value = nota.materia;
  campoNotaInstancia.value = nota.instancia;
  campoNotaValor.value = nota.valor;
  campoNotaFecha.value = nota.fecha;

  botonGuardarNota.textContent = "Guardar cambios";
  botonCancelarEdicion.hidden = false;
  mostrarMensajeNotas("Editando una nota.", false);
  formularioNotas.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Vuelve el formulario al modo "nota nueva"
function limpiarFormularioNotas() {
  formularioNotas.reset();
  campoNotaId.value = "";
  botonGuardarNota.textContent = "Guardar nota";
  botonCancelarEdicion.hidden = true;
}

// --- Baja -------------------------------------------------------------

function eliminarNota(id) {
  if (!esDocenteConectado()) {
    mostrarMensajeNotas("Solo un docente puede borrar notas.", true);
    return;
  }
  if (!confirm("¿Seguro que querés borrar esta nota?")) return;

  notas = notas.filter(function (n) { return n.id !== id; });
  guardarDatos();

  // Si justo se estaba editando esa nota, salimos del modo edición
  if (campoNotaId.value === String(id)) limpiarFormularioNotas();

  dibujarPlanilla();
  mostrarMensajeNotas("Nota borrada.", false);
}

// --- Pantalla ---------------------------------------------------------

// Llena el desplegable de alumnos
function llenarSelectAlumnos() {
  campoNotaAlumno.replaceChildren();

  const opcionInicial = document.createElement("option");
  opcionInicial.value = "";
  opcionInicial.textContent = "Elegí un alumno";
  campoNotaAlumno.appendChild(opcionInicial);

  alumnos.forEach(function (alumno) {
    const opcion = document.createElement("option");
    opcion.value = alumno.id;
    opcion.textContent = alumno.nombre;
    campoNotaAlumno.appendChild(opcion);
  });
}

// Crea un botón chico con la acción y el id de la nota
function crearBotonNota(texto, accion, id) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton-chico";
  boton.textContent = texto;
  boton.dataset.accion = accion;
  boton.dataset.id = id;
  return boton;
}

// Dibuja la planilla: una fila por alumno, con sus notas y el promedio
function dibujarPlanilla() {
  cuerpoPlanilla.replaceChildren();

  alumnos.forEach(function (alumno) {
    const fila = document.createElement("tr");

    // Columna 1: nombre
    const celdaNombre = document.createElement("td");
    celdaNombre.textContent = alumno.nombre;

    // Columna 2: sus notas, ordenadas por fecha
    const celdaNotas = document.createElement("td");
    celdaNotas.className = "celda-notas";
    const notasDelAlumno = notas
      .filter(function (n) { return n.alumnoId === alumno.id; })
      .sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });

    if (notasDelAlumno.length === 0) {
      celdaNotas.textContent = "Sin notas";
    }

    notasDelAlumno.forEach(function (nota) {
      const item = document.createElement("div");
      item.className = "nota-item";

      const detalle = document.createElement("span");
      detalle.textContent = nota.materia + " (" + nota.instancia + ", " +
        formatearFecha(nota.fecha) + "): ";

      const valor = document.createElement("strong");
      valor.textContent = nota.valor;
      if (nota.valor < 6) valor.classList.add("nota-baja");

      item.append(detalle, valor,
        crearBotonNota("Editar", "editar", nota.id),
        crearBotonNota("Borrar", "borrar", nota.id));
      celdaNotas.appendChild(item);
    });

    // Columna 3: promedio con un decimal
    const celdaPromedio = document.createElement("td");
    if (notasDelAlumno.length === 0) {
      celdaPromedio.textContent = "—";
    } else {
      const suma = notasDelAlumno.reduce(function (total, n) { return total + n.valor; }, 0);
      const promedio = Math.round((suma / notasDelAlumno.length) * 10) / 10;
      celdaPromedio.textContent = promedio.toLocaleString("es-AR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
      if (promedio < 6) celdaPromedio.classList.add("nota-baja");
    }

    fila.append(celdaNombre, celdaNotas, celdaPromedio);
    cuerpoPlanilla.appendChild(fila);
  });
}

// Prepara el panel docente (se llama al abrir la página)
function prepararPanelDocente() {
  llenarSelectAlumnos();
  campoNotaFecha.max = fechaDeHoy(); // el calendario no deja elegir fechas futuras
  dibujarPlanilla();
}

// Eventos
formularioNotas.addEventListener("submit", guardarNota);
botonCancelarEdicion.addEventListener("click", function () {
  limpiarFormularioNotas();
  mostrarMensajeNotas("", false);
});

// Un solo evento para todos los botones Editar/Borrar de la planilla
cuerpoPlanilla.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;
  const id = Number(boton.dataset.id);
  if (boton.dataset.accion === "editar") iniciarEdicionNota(id);
  if (boton.dataset.accion === "borrar") eliminarNota(id);
});

/* ==========================================================
   10. UTILIDADES COMPARTIDAS (nuevas)
   ========================================================== */

// true si el usuario conectado tiene alguno de los roles de la lista
function conectadoTieneRol(rolesPermitidos) {
  const usuarioConectado = obtenerUsuarioConectado();
  return usuarioConectado !== null && rolesPermitidos.includes(usuarioConectado.rol);
}

// Muestra un mensaje en el elemento que le pasemos (rojo si es error)
function mostrarMensaje(elemento, texto, esError) {
  elemento.textContent = texto;
  elemento.className = esError ? "mensaje-error" : "mensaje-ok";
}

// Id nuevo para cualquier array: el mayor que existe + 1
function siguienteId(arreglo) {
  const ids = arreglo.map(function (elemento) { return elemento.id; });
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

// Llena un <select> con la lista de alumnos
function llenarOpcionesAlumnos(select) {
  select.replaceChildren();
  const opcionInicial = document.createElement("option");
  opcionInicial.value = "";
  opcionInicial.textContent = "Elegí un alumno";
  select.appendChild(opcionInicial);
  alumnos.forEach(function (alumno) {
    const opcion = document.createElement("option");
    opcion.value = alumno.id;
    opcion.textContent = alumno.nombre;
    select.appendChild(opcion);
  });
}

/* ==========================================================
   11. ASISTENCIA (PANEL PRECEPTOR)
   Cada registro: id, alumnoId, fecha, estado (P, A, T o J)
   ========================================================== */
const formularioAsistencia = document.getElementById("formulario-asistencia");
const campoAsistenciaFecha = document.getElementById("asistencia-fecha");
const listaAsistencia = document.getElementById("lista-asistencia");
const mensajeAsistencia = document.getElementById("mensaje-asistencia");

formularioAsistencia.noValidate = true;

const nombresDeEstado = { P: "Presente", A: "Ausente", T: "Tarde", J: "Justificada" };

// Lo que se ve en pantalla antes de guardar: { alumnoId: "P" | "A" | "T" | "J" }
let estadosEnPantalla = {};

// Carga la asistencia de la fecha elegida. Si ya existe, la trae para editarla.
// Si no existe, todos arrancan como Presente.
function cargarAsistenciaDeFecha() {
  const fecha = campoAsistenciaFecha.value;
  estadosEnPantalla = {};

  if (fecha === "") {
    listaAsistencia.replaceChildren();
    mostrarMensaje(mensajeAsistencia, "Elegí una fecha.", true);
    return;
  }

  const registrosDelDia = asistencias.filter(function (a) { return a.fecha === fecha; });

  alumnos.forEach(function (alumno) {
    const registro = registrosDelDia.find(function (r) { return r.alumnoId === alumno.id; });
    estadosEnPantalla[alumno.id] = registro ? registro.estado : "P";
  });

  dibujarListaAsistencia();

  if (registrosDelDia.length > 0) {
    mostrarMensaje(mensajeAsistencia, "Ya hay asistencia cargada para este día: la estás editando.", false);
  } else {
    mostrarMensaje(mensajeAsistencia, "", false);
  }
}

// Dibuja un <li> por alumno con los botones P, A, T y J
function dibujarListaAsistencia() {
  listaAsistencia.replaceChildren();

  alumnos.forEach(function (alumno) {
    const item = document.createElement("li");

    const nombre = document.createElement("span");
    nombre.textContent = alumno.nombre;

    const grupoBotones = document.createElement("div");
    grupoBotones.className = "botones-asistencia";

    for (const estado in nombresDeEstado) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "boton-estado";
      boton.textContent = estado;
      boton.title = nombresDeEstado[estado];
      boton.setAttribute("aria-label", nombresDeEstado[estado] + ": " + alumno.nombre);
      boton.dataset.estado = estado;
      boton.dataset.alumnoId = alumno.id;
      boton.setAttribute("aria-pressed", String(estadosEnPantalla[alumno.id] === estado));
      grupoBotones.appendChild(boton);
    }

    item.append(nombre, grupoBotones);
    listaAsistencia.appendChild(item);
  });
}

function guardarAsistencia(evento) {
  evento.preventDefault();

  if (!conectadoTieneRol(["preceptor"])) {
    mostrarMensaje(mensajeAsistencia, "Solo un preceptor puede guardar la asistencia.", true);
    return;
  }

  const fecha = campoAsistenciaFecha.value;
  if (fecha === "") {
    mostrarMensaje(mensajeAsistencia, "Elegí una fecha.", true);
    return;
  }
  if (fecha > fechaDeHoy()) {
    mostrarMensaje(mensajeAsistencia, "La fecha no puede ser futura.", true);
    return;
  }

  let seEdito = false;

  alumnos.forEach(function (alumno) {
    const estado = estadosEnPantalla[alumno.id];
    const registro = asistencias.find(function (a) {
      return a.alumnoId === alumno.id && a.fecha === fecha;
    });

    if (registro) {
      registro.estado = estado;   // ya existía: se modifica, no se duplica
      seEdito = true;
    } else {
      asistencias.push({ id: siguienteId(asistencias), alumnoId: alumno.id, fecha: fecha, estado: estado });
    }
  });

  guardarDatos();
  mostrarMensaje(mensajeAsistencia, seEdito ? "Asistencia actualizada." : "Asistencia guardada.", false);
}

function prepararPanelPreceptor() {
  campoAsistenciaFecha.value = fechaDeHoy();
  campoAsistenciaFecha.max = fechaDeHoy();
  cargarAsistenciaDeFecha();

  campoAsistenciaFecha.addEventListener("change", cargarAsistenciaDeFecha);
  formularioAsistencia.addEventListener("submit", guardarAsistencia);

  // Un solo evento para todos los botones P, A, T y J
  listaAsistencia.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button[data-estado]");
    if (!boton) return;

    estadosEnPantalla[boton.dataset.alumnoId] = boton.dataset.estado;

    // Marcamos solo el botón elegido dentro de su grupo
    boton.parentElement.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b === boton));
    });
  });
}

/* ==========================================================
   12. OBSERVACIONES (paneles docente y preceptor)
   Cada una: id, alumnoId, tipo, texto, fecha, autorId
   ========================================================== */

// Prepara el formulario de un panel. "sufijo" es "docente" o "preceptor":
// los ids del HTML terminan con ese sufijo.
function prepararObservaciones(sufijo) {
  const elementos = {
    formulario: document.getElementById("formulario-observaciones-" + sufijo),
    alumno: document.getElementById("observacion-alumno-" + sufijo),
    tipo: document.getElementById("observacion-tipo-" + sufijo),
    texto: document.getElementById("observacion-texto-" + sufijo),
    mensaje: document.getElementById("mensaje-observaciones-" + sufijo)
  };

  elementos.formulario.noValidate = true;
  llenarOpcionesAlumnos(elementos.alumno);

  elementos.formulario.addEventListener("submit", function (evento) {
    guardarObservacion(evento, elementos);
  });
}

function guardarObservacion(evento, elementos) {
  evento.preventDefault();

  if (!conectadoTieneRol(["docente", "preceptor"])) {
    mostrarMensaje(elementos.mensaje, "Solo docentes y preceptores pueden cargar observaciones.", true);
    return;
  }

  const alumnoId = Number(elementos.alumno.value);
  const tipo = elementos.tipo.value;
  const texto = elementos.texto.value.trim();

  const alumnoExiste = alumnos.some(function (a) { return a.id === alumnoId; });
  if (!alumnoExiste) {
    mostrarMensaje(elementos.mensaje, "Elegí un alumno.", true);
    return;
  }
  if (tipo !== "positiva" && tipo !== "llamado") {
    mostrarMensaje(elementos.mensaje, "Elegí el tipo de observación.", true);
    return;
  }
  if (texto.length < 10 || texto.length > 300) {
    mostrarMensaje(elementos.mensaje,
      "El texto debe tener entre 10 y 300 caracteres (ahora tiene " + texto.length + ").", true);
    return;
  }

  observaciones.push({
    id: siguienteId(observaciones),
    alumnoId: alumnoId,
    tipo: tipo,
    texto: texto,
    fecha: fechaDeHoy(),
    autorId: obtenerUsuarioConectado().id
  });

  guardarDatos();
  elementos.formulario.reset();
  dibujarObservaciones();
  mostrarMensaje(elementos.mensaje, "Observación guardada.", false);
}

// Dibuja la lista de observaciones de cada alumno en los dos paneles
function dibujarObservaciones() {
  ["docente", "preceptor"].forEach(function (sufijo) {
    const lista = document.getElementById("lista-observaciones-" + sufijo);
    lista.replaceChildren();

    alumnos.forEach(function (alumno) {
      const item = document.createElement("li");

      const nombre = document.createElement("strong");
      nombre.textContent = alumno.nombre;
      item.appendChild(nombre);

      // Observaciones de este alumno, las más nuevas primero
      const delAlumno = observaciones
        .filter(function (o) { return o.alumnoId === alumno.id; })
        .sort(function (a, b) { return b.fecha.localeCompare(a.fecha) || b.id - a.id; });

      if (delAlumno.length === 0) {
        const vacio = document.createElement("span");
        vacio.textContent = "Sin observaciones";
        item.appendChild(vacio);
      }

      delAlumno.forEach(function (obs) {
        const caja = document.createElement("div");
        caja.className = "observacion";

        const etiqueta = document.createElement("span");
        etiqueta.className = obs.tipo === "positiva" ? "etiqueta-positiva" : "etiqueta-llamado";
        etiqueta.textContent = obs.tipo === "positiva" ? "👍 Positiva" : "⚠️ Llamado de atención";

        const texto = document.createElement("p");
        texto.textContent = obs.texto;

        const autor = usuarios.find(function (u) { return u.id === obs.autorId; });
        const detalle = document.createElement("small");
        detalle.textContent = formatearFecha(obs.fecha) + " · " + (autor ? autor.nombre : "—");

        caja.append(etiqueta, texto, detalle);
        item.appendChild(caja);
      });

      lista.appendChild(item);
    });
  });
}

/* ==========================================================
   13. INICIO (se ejecuta al abrir o recargar la página)
   ========================================================== */
cargarDatos();
prepararPanelDocente();
prepararPanelPreceptor();
prepararObservaciones("docente");
prepararObservaciones("preceptor");
dibujarObservaciones();

// ¿Hay una sesión guardada? Buscamos a ese usuario
const idSesionGuardada = obtenerSesion();
const usuarioDeSesion = usuarios.find(function (u) {
  return u.id === idSesionGuardada;
});

if (usuarioDeSesion) {
  mostrarPanelDeUsuario(usuarioDeSesion); // entra directo a su panel
} else {
  cerrarSesion();          // limpia una sesión inválida, si la hubiera
  mostrarPantallaLogin();
}
