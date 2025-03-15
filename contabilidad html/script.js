// Variables globales
let debeTotal = 0, haberTotal = 0;
const transacciones = [];

// Función para cambiar entre pestañas
function openTab(event, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (const tab of tabContents) {
        tab.style.display = "none";
    }
    const tabButtons = document.getElementsByClassName("tabs")[0].getElementsByTagName("button");
    for (const button of tabButtons) {
        button.classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");
}

// Función para formatear números con $ y separadores de miles
function formatearMonto(monto) {
    return `$${monto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Función para agregar transacciones
const form = document.getElementById("transactionForm");
form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const descripcion = document.getElementById("descripcion").value;
    const tipo = document.getElementById("tipo").value;
    const movimiento = document.getElementById("movimiento").value;
    const clasificacion = document.getElementById("clasificacion").value;
    const monto = parseFloat(document.getElementById("monto").value);
    
    if (isNaN(monto) || monto <= 0) {
        alert("Ingrese un monto válido");
        return;
    }
    
    // Guardar la transacción
    transacciones.push({ descripcion, tipo, movimiento, clasificacion, monto });
    
    // Actualizar el libro diario
    const debeBody = document.getElementById("debeBody");
    const haberBody = document.getElementById("haberBody");
    const row = document.createElement("tr");
    row.innerHTML = `<td>${movimiento}</td><td>${descripcion}</td><td>${clasificacion}</td><td>${formatearMonto(monto)}</td>`;
    
    if (tipo === "debe") {
        debeBody.appendChild(row);
        debeTotal += monto;
    } else {
        haberBody.appendChild(row);
        haberTotal += monto;
    }
    
    // Actualizar la balanza
    actualizarBalanza();
    
    // Actualizar el balance de resultados
    actualizarBalanceResultados();
    
    // Actualizar el libro mayor
    actualizarLibroMayor();
    
    // Actualizar diagramas T
    actualizarDiagramasT();
    
    // Reiniciar el formulario
    form.reset();
});

// Función para actualizar la balanza de comprobación
function actualizarBalanza() {
    const balanzaDebeBody = document.getElementById("balanzaDebeBody");
    const balanzaHaberBody = document.getElementById("balanzaHaberBody");
    balanzaDebeBody.innerHTML = ""; // Limpiar contenido anterior
    balanzaHaberBody.innerHTML = ""; // Limpiar contenido anterior

    // Objeto para agrupar transacciones por cuenta
    const cuentas = {};

    // Agrupar transacciones por cuenta
    transacciones.forEach((transaccion) => {
        const cuenta = transaccion.descripcion;
        if (!cuentas[cuenta]) {
            cuentas[cuenta] = { debe: 0, haber: 0 };
        }
        if (transaccion.tipo === "debe") {
            cuentas[cuenta].debe += transaccion.monto;
        } else {
            cuentas[cuenta].haber += transaccion.monto;
        }
    });

    // Mostrar saldos en la balanza
    for (const cuenta in cuentas) {
        const debeRow = document.createElement("tr");
        debeRow.innerHTML = `<td>${cuenta}</td><td>${formatearMonto(cuentas[cuenta].debe)}</td>`;
        balanzaDebeBody.appendChild(debeRow);

        const haberRow = document.createElement("tr");
        haberRow.innerHTML = `<td>${cuenta}</td><td>${formatearMonto(cuentas[cuenta].haber)}</td>`;
        balanzaHaberBody.appendChild(haberRow);
    }

    // Actualizar totales
    const totalDebe = Object.values(cuentas).reduce((sum, cuenta) => sum + cuenta.debe, 0);
    const totalHaber = Object.values(cuentas).reduce((sum, cuenta) => sum + cuenta.haber, 0);
    document.getElementById("totalDebe").textContent = formatearMonto(totalDebe);
    document.getElementById("totalHaber").textContent = formatearMonto(totalHaber);
    document.getElementById("diferencia").textContent = formatearMonto(totalDebe - totalHaber);
}

// Función para actualizar el balance de resultados
function actualizarBalanceResultados() {
    const balanceResultadosBody = document.getElementById("balanceResultadosBody");
    balanceResultadosBody.innerHTML = ""; // Limpiar contenido anterior

    // Objeto para agrupar transacciones por cuenta
    const cuentas = {};

    // Agrupar transacciones por cuenta
    transacciones.forEach((transaccion) => {
        const cuenta = transaccion.descripcion;
        if (!cuentas[cuenta]) {
            cuentas[cuenta] = { debe: 0, haber: 0 };
        }
        if (transaccion.tipo === "debe") {
            cuentas[cuenta].debe += transaccion.monto;
        } else {
            cuentas[cuenta].haber += transaccion.monto;
        }
    });

    // Mostrar saldos en el balance de resultados
    for (const cuenta in cuentas) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${cuenta}</td>
            <td>${formatearMonto(cuentas[cuenta].debe)}</td>
            <td>${formatearMonto(cuentas[cuenta].haber)}</td>
        `;
        balanceResultadosBody.appendChild(row);
    }

    // Calcular utilidad o pérdida
    const totalDebe = Object.values(cuentas).reduce((sum, cuenta) => sum + cuenta.debe, 0);
    const totalHaber = Object.values(cuentas).reduce((sum, cuenta) => sum + cuenta.haber, 0);
    const utilidadPerdida = totalHaber - totalDebe;
    document.getElementById("utilidadPerdida").textContent = formatearMonto(utilidadPerdida);
}

// Función para actualizar el libro mayor
function actualizarLibroMayor() {
    const libroMayorContainer = document.getElementById("libroMayorContainer");
    libroMayorContainer.innerHTML = ""; // Limpiar contenido anterior

    // Objeto para agrupar transacciones por número de movimiento
    const movimientos = {};

    // Agrupar transacciones por número de movimiento
    transacciones.forEach((transaccion) => {
        const movimiento = transaccion.movimiento;
        if (!movimientos[movimiento]) {
            movimientos[movimiento] = { debe: [], haber: [] };
        }
        if (transaccion.tipo === "debe") {
            movimientos[movimiento].debe.push({ descripcion: transaccion.descripcion, monto: transaccion.monto });
        } else {
            movimientos[movimiento].haber.push({ descripcion: transaccion.descripcion, monto: transaccion.monto });
        }
    });

    // Crear tabla para cada movimiento
    for (const movimiento in movimientos) {
        const movimientoDiv = document.createElement("div");
        movimientoDiv.className = "movimiento";
        movimientoDiv.innerHTML = `<h3>Movimiento ${movimiento}</h3>`;

        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>Debe</th>
                    <th>Haber</th>
                </tr>
            </thead>
            <tbody>
                ${movimientos[movimiento].debe.map(t => `
                    <tr>
                        <td>${t.descripcion}</td>
                        <td>${formatearMonto(t.monto)}</td>
                        <td></td>
                    </tr>
                `).join("")}
                ${movimientos[movimiento].haber.map(t => `
                    <tr>
                        <td>${t.descripcion}</td>
                        <td></td>
                        <td>${formatearMonto(t.monto)}</td>
                    </tr>
                `).join("")}
            </tbody>
        `;
        movimientoDiv.appendChild(table);
        libroMayorContainer.appendChild(movimientoDiv);
    }
}

// Función para actualizar diagramas T
function actualizarDiagramasT() {
    const diagramasContainer = document.getElementById("diagramasContainer");
    diagramasContainer.innerHTML = ""; // Limpiar contenido anterior

    // Objeto para agrupar transacciones por cuenta
    const cuentas = {};

    // Agrupar transacciones por cuenta
    transacciones.forEach((transaccion) => {
        const cuenta = transaccion.descripcion;
        if (!cuentas[cuenta]) {
            cuentas[cuenta] = { debe: 0, haber: 0 };
        }
        if (transaccion.tipo === "debe") {
            cuentas[cuenta].debe += transaccion.monto;
        } else {
            cuentas[cuenta].haber += transaccion.monto;
        }
    });

    // Crear diagrama T para cada cuenta
    for (const cuenta in cuentas) {
        const diagrama = document.createElement("div");
        diagrama.className = "diagrama";
        diagrama.innerHTML = `
            <h3>${cuenta}</h3>
            <div class="cuenta">
                <div class="debe">
                    <h4>Debe</h4>
                    <p>${formatearMonto(cuentas[cuenta].debe)}</p>
                </div>
                <div class="haber">
                    <h4>Haber</h4>
                    <p>${formatearMonto(cuentas[cuenta].haber)}</p>
                </div>
            </div>
        `;
        diagramasContainer.appendChild(diagrama);
    }
}