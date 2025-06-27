// Constantes y configuraciones
const TIPOS_CONTRATO = {
    GENERAL: 'General',
    INFERIOR_12_MESES: 'Inferior a 12 meses'
};

const CATEGORIAS_PROFESIONALES = {
    A: 'Ingenieros y Licenciados',
    B: 'Ingenieros Técnicos, Peritos y Ayudantes Titulados',
    C: 'Jefes Administrativos y de Taller',
    D: 'Ayudantes no Titulados',
    E: 'Oficiales Administrativos',
    F: 'Subalternos',
    G: 'Auxiliares Administrativos',
    H: 'Oficiales de primera y segunda',
    I: 'Oficiales de tercera y Especialistas',
    J: 'Peones',
    K: 'Trabajadores menores de dieciocho años'
};

// --- Tramos estatales de retenciones de sueldo 2025 ---
const TRAMOS_RETENCIONES = [
    [0, 15000, 7],
    [15000, 25000, 11],
    [25000, 35000, 15],
    [35000, 50000, 19],
    [50000, 75000, 23],
    [75000, 999999999999, 27]
];

// Hacer disponible globalmente para los gráficos
window.TRAMOS_RETENCIONES = TRAMOS_RETENCIONES;

// Clase principal de la calculadora
class CalculadoraSueldoNeto {
    constructor() {
        this.form = document.getElementById('calculadora');
        this.resultadosContainer = document.getElementById('resultados_calculadora_nomina');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Evento para el botón de calcular
        document.getElementById('calcular_nomina').addEventListener('click', () => {
            this.calcularNomina();
            window.location.href = '#resultados_calculadora_nomina';
        });

        // Eventos para validación en tiempo real
        document.getElementById('salariobruto').addEventListener('input', (e) => this.validarSalarioBruto(e));
        document.getElementById('edad').addEventListener('input', (e) => this.validarEdad(e));
        
        // Eventos para checkboxes mutuamente excluyentes
        document.getElementById('general').addEventListener('change', (e) => this.toggleContrato(e, 'menosdoce'));
        document.getElementById('menosdoce').addEventListener('change', (e) => this.toggleContrato(e, 'general'));
        document.getElementById('12p').addEventListener('change', (e) => this.togglePagas(e, '14p'));
        document.getElementById('14p').addEventListener('change', (e) => this.togglePagas(e, '12p'));
    }

    // Validaciones
    validarSalarioBruto(event) {
        const valor = event.target.value;
        const errorElement = document.getElementById('error-salariobruto');
        
        if (!valor || isNaN(valor) || valor <= 0) {
            errorElement.textContent = 'Por favor, introduce un salario válido';
            errorElement.style.display = 'block';
            return false;
        }
        
        errorElement.style.display = 'none';
        return true;
    }

    validarEdad(event) {
        const valor = event.target.value;
        const errorElement = document.getElementById('error-edad');
        
        if (!valor || isNaN(valor) || valor < 16 || valor > 100) {
            errorElement.textContent = 'La edad debe estar entre 16 y 100 años';
            errorElement.style.display = 'block';
            return false;
        }
        
        errorElement.style.display = 'none';
        return true;
    }

    // Toggle para checkboxes mutuamente excluyentes
    toggleContrato(event, otherId) {
        if (event.target.checked) {
            document.getElementById(otherId).checked = false;
        }
    }

    togglePagas(event, otherId) {
        if (event.target.checked) {
            document.getElementById(otherId).checked = false;
        }
    }

    // Cálculos principales
    calcularNomina() {
        console.log('Iniciando cálculo de nómina...');
        
        if (!this.validarFormulario()) {
            console.log('Validación del formulario falló');
            return;
        }

        console.log('Formulario validado correctamente');
        const datos = this.obtenerDatosFormulario();
        console.log('Datos obtenidos:', datos);
        
        const resultados = this.realizarCalculos(datos);
        console.log('Resultados calculados:', resultados);
        
        this.mostrarResultados(resultados);
        console.log('Resultados mostrados');
    }

    validarFormulario() {
        const salarioValido = this.validarSalarioBruto({ target: document.getElementById('salariobruto') });
        const edadValida = this.validarEdad({ target: document.getElementById('edad') });
        const contratoSeleccionado = document.getElementById('general').checked || document.getElementById('menosdoce').checked;
        const pagasSeleccionadas = document.getElementById('12p').checked || document.getElementById('14p').checked;

        // Limpiar errores anteriores
        document.getElementById('error-general').style.display = 'none';
        document.getElementById('error-docep').style.display = 'none';

        if (!contratoSeleccionado) {
            document.getElementById('error-general').textContent = 'Selecciona un tipo de contrato';
            document.getElementById('error-general').style.display = 'block';
            return false;
        }

        if (!pagasSeleccionadas) {
            document.getElementById('error-docep').textContent = 'Selecciona el número de pagas';
            document.getElementById('error-docep').style.display = 'block';
            return false;
        }

        return salarioValido && edadValida;
    }

    obtenerDatosFormulario() {
        const personasACargo = parseInt(document.getElementById('cargos').value);
        let personas = [];
        
        // Solo procesar personas a cargo si realmente hay campos creados
        for (let i = 1; i <= personasACargo; i++) {
            const edadElement = document.getElementById(`edad-${i}`);
            const tipoElement = document.getElementById(`genen_descen-${i}`);
            const discapacidadElement = document.getElementById(`discapacidad_descen-${i}`);
            
            // Solo agregar si todos los elementos existen
            if (edadElement && tipoElement && discapacidadElement) {
                personas.push({
                    edad: parseInt(edadElement.value) || 0,
                    tipo: tipoElement.value || 'descendente',
                    discapacidad: discapacidadElement.value || 'A'
                });
            }
        }
        
        return {
            salarioBruto: parseFloat(document.getElementById('salariobruto').value),
            tipoContrato: document.getElementById('general').checked ? TIPOS_CONTRATO.GENERAL : TIPOS_CONTRATO.INFERIOR_12_MESES,
            categoriaProfesional: document.getElementById('categoria_profesional').value,
            numeroPagas: document.getElementById('14p').checked ? 14 : 12,
            movilidadGeografica: document.getElementById('movili').checked,
            edad: parseInt(document.getElementById('edad').value),
            situacionFamiliar: document.getElementById('situacion_familiar').value,
            discapacidad: document.getElementById('minusvalia_titular').value,
            personasACargo: personasACargo,
            personas: personas,
            hijosExclusiva: document.getElementById('exclusiva').checked
        };
    }

    realizarCalculos(datos) {
        // 1. Seguridad Social
        const cuotaMensual = this.calcularCuotaMensualPagar(datos.salarioBruto, datos.categoriaProfesional);
        const cuotaAnual = cuotaMensual * 12;
        // 2. Base de cálculo
        const baseCalculo = datos.salarioBruto - cuotaAnual;
        // 3. Reducción por rendimientos del trabajo
        const reduccion = this.calcularReduccionRendimientoTrabajo(baseCalculo, datos);
        // 4. Base liquidable
        const baseLiquidable = Math.max(baseCalculo - reduccion, 0);
        // 5. Mínimos personales y familiares
        const minimo = this.calcularMinimosPersonalesFamiliares(datos);
        // 6. Cuota íntegra (solo tramos estatales)
        const cuotaIntegra = this.aplicarTramosIRPF(baseLiquidable);
        // 7. Cuota por mínimos
        const cuotaMinimos = this.aplicarTramosIRPF(minimo);
        // 8. Cuota de retención
        const cuotaRetencion = Math.max(cuotaIntegra - cuotaMinimos, 0);
        // 9. Tipo de retención
        const tipoRetencion = (cuotaRetencion / datos.salarioBruto) * 100;
        // 10. Sueldo neto
        const sueldoNeto = datos.salarioBruto - cuotaAnual - cuotaRetencion;
        // 11. Pagas
        let sueldoNetoMensual, pagasExtra;
        if (datos.numeroPagas === 14) {
            pagasExtra = (datos.salarioBruto - cuotaRetencion) / 14;
            sueldoNetoMensual = pagasExtra - (cuotaAnual / 12);
        } else {
            sueldoNetoMensual = sueldoNeto / 12;
            pagasExtra = null;
        }
        return {
            sueldoBrutoAnual: datos.salarioBruto,
            sueldoNetoAnual: sueldoNeto,
            cuotaSS: cuotaAnual,
            retencionIRPF: cuotaRetencion,
            porcentajeRetencion: this.truncateNumber(tipoRetencion, 2),
            sueldoNetoMensual: sueldoNetoMensual,
            pagasExtra: pagasExtra
        };
    }

    calcularReduccionRendimientoTrabajo(baseCalculo, datos) {
        // Reducción general: 2.000 €
        let reduccion = 2000;
        // Reducción adicional para rendimientos bajos (según algoritmo AEAT)
        if (baseCalculo < 14800) {
            reduccion += 5650 - (1.14 * (baseCalculo - 11212));
            if (baseCalculo < 11212) reduccion = 7650;
        }
        // Movilidad geográfica: +2000 €
        if (datos.movilidadGeografica) reduccion += 2000;
        // Discapacidad titular
        if (datos.discapacidad === 'B') reduccion += 3500;
        if (datos.discapacidad === 'C') reduccion += 7750;
        return Math.max(reduccion, 0);
    }

    calcularMinimosPersonalesFamiliares(datos) {
        // Mínimo personal
        let minimo = 5550;
        if (datos.edad > 65 && datos.edad <= 75) minimo += 1150;
        if (datos.edad > 75) minimo += 918 + 1400;
        // Mínimo por descendientes
        const descendientes = datos.personas.filter(p => p.tipo === 'descendente');
        if (descendientes.length > 0) {
            const edades = descendientes.map(p => p.edad).sort((a, b) => a - b);
            if (edades[0] !== undefined) minimo += 2400;
            if (edades[1] !== undefined) minimo += 2700;
            if (edades[2] !== undefined) minimo += 4000;
            if (edades[3] !== undefined) minimo += 4500;
            if (edades.length > 4) minimo += 4500 * (edades.length - 4);
        }
        // Mínimo por ascendientes
        const ascendientes = datos.personas.filter(p => p.tipo === 'ascendente');
        if (ascendientes.length > 0) minimo += 1150 * ascendientes.length;
        // Mínimo por discapacidad titular
        if (datos.discapacidad === 'B') minimo += 3500;
        if (datos.discapacidad === 'C') minimo += 7800;
        // Mínimo por discapacidad descendientes/ascendientes
        for (const p of datos.personas) {
            if (p.discapacidad === 'B') minimo += 3000;
            if (p.discapacidad === 'C') minimo += 12000;
        }
        // Mínimo por hijos menores de 3 años
        const hijosMenores3 = descendientes.filter(p => p.edad <= 3).length;
        minimo += hijosMenores3 * 2800;
        return minimo;
    }

    aplicarTramosIRPF(base) {
        const tramos = TRAMOS_RETENCIONES;
        let total = 0;
        for (let i = 0; i < tramos.length; i++) {
            let tramo = 0;
            if (i === tramos.length - 1) {
                if (base > tramos[i][0]) tramo = base - tramos[i][0];
            } else {
                if (base > tramos[i][0]) {
                    if (base <= tramos[i][1]) tramo = base - tramos[i][0];
                    else tramo = tramos[i][1] - tramos[i][0];
                }
            }
            tramo = Math.max(tramo, 0);
            total += (tramo * tramos[i][2]) / 100;
        }
        return total;
    }

    calcularCuotaSS(datos) {
        // Implementación del cálculo de cuota de Seguridad Social
        const porcentajeSS = 0.0635; // 6.35% para 2025
        return datos.salarioBruto * porcentajeSS;
    }

    mostrarResultados(resultados) {
        // Formatear números con separadores de miles y dos decimales
        const formatearNumero = (numero) => {
            return new Intl.NumberFormat('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numero);
        };

        // Actualizar campos de resultados
        document.getElementById('bruto').value = formatearNumero(resultados.sueldoBrutoAnual) + ' €';
        document.getElementById('netoa').value = formatearNumero(resultados.sueldoNetoAnual) + ' €';
        document.getElementById('segsocial').value = formatearNumero(resultados.cuotaSS) + ' €';
        document.getElementById('irpf').value = formatearNumero(resultados.retencionIRPF) + ' €';
        document.getElementById('retencion').value = formatearNumero(resultados.porcentajeRetencion) + ' %';
        document.getElementById('netom').value = formatearNumero(resultados.sueldoNetoMensual) + ' €';

        // Mostrar pagas extra si corresponde
        const extraPaymentsDiv = document.querySelector('.extra-payments');
        if (resultados.pagasExtra) {
            document.getElementById('pextras').value = formatearNumero(resultados.pagasExtra) + ' €';
            extraPaymentsDiv.style.display = 'block';
        } else {
            extraPaymentsDiv.style.display = 'none';
        }

        // Mostrar contenido de resultados y ocultar placeholder
        document.getElementById('results-content').style.display = 'block';
        document.getElementById('results-placeholder').style.display = 'none';

        // Actualizar gráficos si están disponibles
        if (window.salaryCharts) {
            const datos = this.obtenerDatosFormulario();
            window.salaryCharts.updateCharts(resultados, datos);
        }
    }

    // --- Utilidades de formato ---
    truncateNumber(num, digits) {
        num = String(num);
        if (num.indexOf('.') === -1) {
            num = Number(num).toFixed(digits);
            num = String(num);
        }
        const splitStr = num.split('.');
        const splitLeft = splitStr[0];
        const splitRight = splitStr[1] ? splitStr[1].substring(0, digits) : '';
        if (digits === 0) return splitLeft;
        else return splitLeft + '.' + splitRight;
    }

    formatNumber(num) {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    }

    // --- Cálculo de cuota mensual de Seguridad Social ---
    calcularCuotaMensualPagar(brutoAnual, categoria) {
        const datos = {
            A: [{ min: 1052.9, max: 3751.2 }],
            B: [{ min: 956.1, max: 3751.2 }],
            C: [{ min: 831.6, max: 3751.2 }],
            D: [{ min: 825.6, max: 3751.2 }],
            E: [{ min: 825.6, max: 3751.2 }],
            F: [{ min: 825.6, max: 3751.2 }],
            G: [{ min: 825.6, max: 3751.2 }],
            H: [{ min: 825.6, max: 3751.2 }],
            I: [{ min: 825.6, max: 3751.2 }],
            J: [{ min: 825.6, max: 3751.2 }],
            K: [{ min: 825.6, max: 3751.2 }]
        };
        const mensual = brutoAnual / 12;
        if (mensual < datos[categoria][0].min) {
            return datos[categoria][0].min * 0.0635;
        } else if (mensual > datos[categoria][0].max) {
            return datos[categoria][0].max * 0.0635;
        } else {
            return mensual * 0.0635;
        }
    }

    calcularTramosBaseLiquidable(base, comunidad) {
        const tramos = TRAMOS_RETENCIONES[comunidad] || TRAMOS_RETENCIONES['E'];
        let total = 0;
        for (let i = 0; i < tramos.length; i++) {
            let tramo = 0;
            if (i === tramos.length - 1) {
                if (base > tramos[i][0]) tramo = base - tramos[i][0];
            } else {
                if (base > tramos[i][0]) {
                    if (base <= tramos[i][1]) tramo = base - tramos[i][0];
                    else tramo = tramos[i][1] - tramos[i][0];
                }
            }
            tramo = Math.max(tramo, 0);
            total += (tramo * tramos[i][2]) / 100;
        }
        return total;
    }
}

// Inicializar la calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CalculadoraSueldoNeto();

    // Campos dinámicos para personas a cargo
    const selectCargos = document.getElementById('cargos');
    const contenedorDescendientes = document.querySelector('.descendientes');
    selectCargos.addEventListener('change', function() {
        const n = parseInt(this.value);
        contenedorDescendientes.innerHTML = '';
        for (let i = 1; i <= n; i++) {
            const div = document.createElement('div');
            div.className = `box-${i}`;
            div.innerHTML = `
                <div class='title_descendientes'><strong>Persona ${i}</strong></div>
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                    <label>Edad</label>
                    <input type='number' min='0' name='edad-${i}' id='edad-${i}' style='width:70px;'>
                    <label>años</label>
                    <select name='genen_descen-${i}' id='genen_descen-${i}'>
                        <option value='descendente' selected>Descendiente</option>
                        <option value='ascendente'>Ascendiente</option>
                    </select>
                    <select name='discapacidad_descen-${i}' id='discapacidad_descen-${i}'>
                        <option value='A' selected>Sin discapacidad</option>
                        <option value='B'>Entre el 33% y el 65%</option>
                        <option value='C'>Igual o superior al 65%</option>
                    </select>
                </div>
                <span class='error-edad-${i}' style='color:#e74c3c;display:none;'></span>
            `;
            contenedorDescendientes.appendChild(div);
        }
    });
}); 