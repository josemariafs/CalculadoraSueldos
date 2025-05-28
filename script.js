
let datosCargados = true;

// Cargar datos desde data.json
async function cargarDatos() {
    try {
        console.log("Cargando datos...");
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        datos = await response.json();
        console.log('Datos cargados correctamente:', datos);
        // Habilitar el formulario una vez cargados los datos
        document.getElementById('salary-form').classList.remove('loading');
        return true;
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        const mensajeError = error.message.includes('Failed to fetch') 
            ? 'Error: No se puede acceder a data.json. Por favor, asegúrate de estar ejecutando la aplicación a través de un servidor web local. Puedes usar Python (python -m http.server) o Node.js (npx serve) para servir los archivos.'
            : 'Error al cargar los datos. Por favor, recarga la página.';
        mostrarError('gross-salary', mensajeError);
        return false;
    }
}

// Manejo del tema claro/oscuro
function inicializarTema() {
    const themeToggle = document.getElementById('theme-toggle');
    const temaGuardado = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    themeToggle.textContent = temaGuardado === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const temaActual = document.documentElement.getAttribute('data-theme');
        const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nuevoTema);
        localStorage.setItem('theme', nuevoTema);
        themeToggle.textContent = nuevoTema === 'dark' ? '☀️' : '🌙';
    });
}

// Validación de formulario
function validarFormulario() {
    const sueldoBruto = parseFloat(document.getElementById('gross-salary').value);
    const pagas = document.getElementById('payments').value;
    const region = document.getElementById('region').value;
    const edad = parseInt(document.getElementById('age').value);

    let esValido = true;

    // Validar sueldo bruto
    if (isNaN(sueldoBruto) || sueldoBruto <= 0) {
        mostrarError('gross-salary', 'El sueldo bruto debe ser mayor que 0');
        esValido = false;
    } else {
        limpiarError('gross-salary');
    }

    // Validar pagas
    if (!pagas) {
        mostrarError('payments', 'Selecciona el número de pagas');
        esValido = false;
    } else {
        limpiarError('payments');
    }

    // Validar región
    if (!region) {
        mostrarError('region', 'Selecciona tu comunidad autónoma');
        esValido = false;
    } else {
        limpiarError('region');
    }

    // Validar edad
    if (isNaN(edad) || edad < 16 || edad > 99) {
        mostrarError('age', 'La edad debe estar entre 16 y 99 años');
        esValido = false;
    } else {
        limpiarError('age');
    }

    return esValido;
}

// Mostrar mensaje de error
function mostrarError(campoId, mensaje) {
    const errorElement = document.getElementById(`${campoId}-error`);
    errorElement.textContent = mensaje;
    document.getElementById(campoId).setAttribute('aria-invalid', 'true');
}

// Limpiar mensaje de error
function limpiarError(campoId) {
    const errorElement = document.getElementById(`${campoId}-error`);
    errorElement.textContent = '';
    document.getElementById(campoId).setAttribute('aria-invalid', 'false');
}

// Calcular sueldo neto
function calcularSueldoNeto(sueldoBruto, pagas, region) {
    if (!datos) {
        console.error('Los datos no están cargados');
        return null;
    }

    const sueldoMensual = sueldoBruto / parseInt(pagas);
    const deducciones = [];

    // Calcular IRPF según tramos y comunidad autónoma
    let irpf = 0;
    const tramoIRPF = datos.irpf.tramos.find(tramo => 
        sueldoBruto > tramo.desde && (tramo.hasta === null || sueldoBruto <= tramo.hasta)
    );
    
    if (tramoIRPF) {
        const porcentajeBase = tramoIRPF.porcentaje;
        const incrementoComunidad = datos.irpf.comunidades[region].incremento;
        const porcentajeTotal = porcentajeBase + incrementoComunidad;
        irpf = (sueldoBruto * porcentajeTotal) / 100;
        deducciones.push({
            concepto: 'IRPF',
            valor: irpf,
            detalle: `Tramo ${porcentajeBase}% + ${incrementoComunidad}% CCAA`
        });
    }

    // Calcular Seguridad Social
    const ssContingencias = (sueldoBruto * datos.seguridad_social.contingencias_comunes.empleado) / 100;
    deducciones.push({
        concepto: 'Contingencias Comunes',
        valor: ssContingencias
    });

    const ssDesempleo = (sueldoBruto * datos.seguridad_social.desempleo.empleado) / 100;
    deducciones.push({
        concepto: 'Desempleo',
        valor: ssDesempleo
    });

    const ssFormacion = (sueldoBruto * datos.seguridad_social.formacion_profesional.empleado) / 100;
    deducciones.push({
        concepto: 'Formación Profesional',
        valor: ssFormacion
    });

    // Calcular retenciones adicionales por comunidad autónoma
    const retencionAdicional = (sueldoBruto * datos.retenciones_adicionales.comunidades[region].porcentaje) / 100;
    if (retencionAdicional > 0) {
        deducciones.push({
            concepto: 'Retención Adicional CCAA',
            valor: retencionAdicional
        });
    }

    // Calcular total de deducciones
    const totalDeducciones = deducciones.reduce((total, ded) => total + ded.valor, 0);
    const sueldoNeto = sueldoBruto - totalDeducciones;

    // Añadir información de la empresa (solo informativa)
    const costeEmpresa = {
        contingencias: (sueldoBruto * datos.seguridad_social.contingencias_comunes.empresa) / 100,
        desempleo: (sueldoBruto * datos.seguridad_social.desempleo.empresa) / 100,
        formacion: (sueldoBruto * datos.seguridad_social.formacion_profesional.empresa) / 100,
        fogasa: (sueldoBruto * datos.seguridad_social.fogasa.empresa) / 100,
        accidentes: (sueldoBruto * datos.seguridad_social.accidentes_trabajo.empresa) / 100
    };

    const costeTotalEmpresa = Object.values(costeEmpresa).reduce((total, valor) => total + valor, 0) + sueldoBruto;

    return {
        sueldoBruto,
        sueldoNeto,
        deducciones,
        sueldoMensualBruto: sueldoMensual,
        sueldoMensualNeto: sueldoNeto / parseInt(pagas),
        costeEmpresa: {
            mensual: costeTotalEmpresa / parseInt(pagas),
            anual: costeTotalEmpresa
        }
    };
}

// Mostrar resultados
function mostrarResultados(resultados) {
    if (!resultados) return;

    // Formatear números con separadores de miles y decimales
    const formatearMoneda = (valor) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    };

    // Mostrar sueldo bruto
    document.getElementById('gross-result').innerHTML = `
        <div>Anual: ${formatearMoneda(resultados.sueldoBruto)}</div>
        <div>Mensual: ${formatearMoneda(resultados.sueldoMensualBruto)}</div>
    `;

    // Mostrar deducciones
    const deduccionesList = document.getElementById('deductions-list');
    deduccionesList.innerHTML = resultados.deducciones
        .map(ded => `
            <div class="deduccion-item">
                <span class="concepto">${ded.concepto}</span>
                <span class="valor">${formatearMoneda(ded.valor)}</span>
                ${ded.detalle ? `<span class="detalle">${ded.detalle}</span>` : ''}
            </div>
        `)
        .join('');

    // Mostrar sueldo neto
    document.getElementById('net-result').innerHTML = `
        <div>Anual: ${formatearMoneda(resultados.sueldoNeto)}</div>
        <div>Mensual: ${formatearMoneda(resultados.sueldoMensualNeto)}</div>
        <div class="coste-empresa">
            <small>Coste total para la empresa: ${formatearMoneda(resultados.costeEmpresa.anual)}/año</small>
        </div>
    `;
}

// Manejar envío del formulario
document.getElementById('salary-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!datosCargados) {
        mostrarError('gross-salary', 'Esperando a que se carguen los datos...');
        return;
    }
    
    if (!validarFormulario()) {
        return;
    }
    
    const sueldoBruto = parseFloat(document.getElementById('gross-salary').value);
    const pagas = document.getElementById('payments').value;
    const region = document.getElementById('region').value;
    
    const resultados = calcularSueldoNeto(sueldoBruto, pagas, region);
    mostrarResultados(resultados);
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar tema
    inicializarTema();
    
    // Los datos ya están disponibles globalmente desde data.js
    console.log('Datos disponibles:', datos);
}); 