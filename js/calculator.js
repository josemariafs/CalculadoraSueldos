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

// --- Tramos IRPF estatales y autonómicos ---
const TRAMOS_AUTONOMICOS = {
    '1': [ // Andalucía
        [0, 12450, 10.5], [12450, 20200, 12], [20200, 28000, 15], [28000, 35200, 16.5], [35200, 50000, 19], [50000, 60000, 19.5], [60000, 120000, 23.5], [120000, 999999999999, 25.5]
    ],
    '2': [ // Madrid
        [0, 12450, 9.5], [12450, 17707, 11.5], [17707, 33007, 15.5], [33007, 53407, 20.5], [53407, 999999999999, 23.5]
    ],
    '3': [ // Cataluña
        [0, 12450, 10.5], [12450, 17707, 12], [17707, 33007, 14], [33007, 53407, 18.5], [53407, 90000, 21.5], [90000, 120000, 23.5], [120000, 175000, 24.5], [175000, 999999999999, 25.5]
    ],
    '4': [ // Valencia
        [0, 12450, 9.5], [12450, 17707, 11], [17707, 33007, 13.5], [33007, 53407, 18], [53407, 999999999999, 21.5]
    ],
    '5': [ // Galicia
        [0, 12450, 9.5], [12450, 17707, 10], [17707, 33007, 12.8], [33007, 53407, 16], [53407, 999999999999, 19]
    ],
    '6': [ // País Vasco
        [0, 13500, 23], [13500, 21000, 28], [21000, 35000, 32], [35000, 60000, 39], [60000, 999999999999, 43]
    ],
    '7': [ // Castilla y León
        [0, 12450, 9.5], [12450, 17707, 11], [17707, 33007, 13.5], [33007, 53407, 17], [53407, 999999999999, 20]
    ],
    '8': [ // Castilla-La Mancha
        [0, 12450, 9.5], [12450, 17707, 11], [17707, 33007, 13.5], [33007, 53407, 17], [53407, 999999999999, 20]
    ],
    '9': [ // Canarias
        [0, 12450, 9.5], [12450, 17707, 11], [17707, 33007, 13.5], [33007, 53407, 17], [53407, 999999999999, 20]
    ],
    '10': [ // Murcia
        [0, 12450, 9.5], [12450, 17707, 11], [17707, 33007, 13.5], [33007, 53407, 17], [53407, 999999999999, 20]
    ],
    '11': [ // Aragón
        [0, 12450, 10], [12450, 17707, 11], [17707, 33007, 14], [33007, 53407, 17], [53407, 999999999999, 21]
    ],
    '12': [ // Extremadura
        [0, 12450, 9.5], [12450, 17707, 11], [17707, 33007, 13.5], [33007, 53407, 17], [53407, 999999999999, 20]
    ],
    '13': [ // Baleares
        [0, 12450, 10], [12450, 17707, 11.5], [17707, 33007, 14.5], [33007, 53407, 18], [53407, 90000, 22], [90000, 999999999999, 23]
    ],
    '14': [ // Asturias
        [0, 12450, 10], [12450, 17707, 12], [17707, 33007, 14], [33007, 53407, 18], [53407, 999999999999, 21]
    ],
    '15': [ // Navarra
        [0, 15876, 15], [15876, 25000, 20], [25000, 40000, 27], [40000, 70000, 31], [70000, 999999999999, 35]
    ],
    '16': [ // Cantabria
        [0, 12450, 9.5], [12450, 17707, 11], [17707, 33007, 13.5], [33007, 53407, 17], [53407, 999999999999, 20]
    ],
    '17': [ // La Rioja
        [0, 12450, 9.5], [12450, 17707, 11], [17707, 33007, 13.5], [33007, 53407, 17], [53407, 999999999999, 20]
    ],
    'E': [ // Estatal - Tramos oficiales 2025
        [0, 12450, 9.5], [12450, 20200, 12], [20200, 35200, 15], [35200, 60000, 18.5], [60000, 300000, 22.5], [300000, 999999999999, 24.5]
    ]
};

// Hacer disponible globalmente para los gráficos
window.TRAMOS_AUTONOMICOS = TRAMOS_AUTONOMICOS;

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
            comunidadAutonoma: document.getElementById('comunidad_autonoma').value,
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
        // 2. Rendimiento neto
        const rendimientoNeto = datos.salarioBruto - cuotaAnual;
        // 3. Reducción rendimiento neto
        let reduccion = this.calcularReduccionRendimientoNeto(rendimientoNeto, datos.movilidadGeografica, datos.discapacidad);
        if (datos.personasACargo > 2) reduccion += 600;
        // 4. Base imponible
        let baseImponible = datos.salarioBruto - cuotaAnual - reduccion;
        baseImponible = Math.max(baseImponible, 0);
        // 5. Mínimos personales y familiares (ahora detallados)
        let hijosMenores25 = 0, hijosMenores3 = 0, descendientesConDiscapacidad33_65 = 0, descendientesConDiscapacidadSup65 = 0;
        for (const p of datos.personas) {
            if (p.tipo === 'descendente') {
                if (p.edad <= 25) hijosMenores25++;
                if (p.edad <= 3) hijosMenores3++;
                if (p.discapacidad === 'B') descendientesConDiscapacidad33_65++;
                if (p.discapacidad === 'C') descendientesConDiscapacidadSup65++;
            }
        }
        const minimoPersonal = this.calcularMinimoPersonal(datos.edad);
        const minimoDescendientes = this.calcularMinimoDescendientes(hijosMenores25);
        const minimoHijosBeneficiarios = datos.hijosExclusiva ? minimoDescendientes : (minimoDescendientes / 2);
        const minimoHijosMenores3 = hijosMenores3 * 2800;
        const minimoHijosMenores3Beneficiarios = datos.hijosExclusiva ? minimoHijosMenores3 : (minimoHijosMenores3 / 2);
        const minimoDescDiscapacidad33_65 = descendientesConDiscapacidad33_65 * 3000;
        const minimoDescDiscapacidad33_65Beneficiarios = datos.hijosExclusiva ? minimoDescDiscapacidad33_65 : (minimoDescDiscapacidad33_65 / 2);
        const minimoDescDiscapacidadSup65 = descendientesConDiscapacidadSup65 * 12000;
        const minimoDescDiscapacidadSup65Beneficiarios = datos.hijosExclusiva ? minimoDescDiscapacidadSup65 : (minimoDescDiscapacidadSup65 / 2);
        const sumaMinimos = minimoPersonal + minimoHijosBeneficiarios + minimoHijosMenores3Beneficiarios + minimoDescDiscapacidad33_65Beneficiarios + minimoDescDiscapacidadSup65Beneficiarios;
        // 6. Cuota de retención
        const cuotaRetencion = (this.calcularTramosBaseLiquidable(baseImponible, datos.comunidadAutonoma) + this.calcularTramosBaseLiquidable(baseImponible, 'E')) - (this.calcularTramosBaseLiquidable(sumaMinimos, datos.comunidadAutonoma) + this.calcularTramosBaseLiquidable(sumaMinimos, 'E'));
        // 7. Tipo de retención
        const tipoPrevio = (cuotaRetencion / datos.salarioBruto) * 100;
        const importePrevioRetencion = (tipoPrevio / 100) * datos.salarioBruto;
        let tipoFinalRetencion = this.truncateNumber(importePrevioRetencion / datos.salarioBruto * 100, 2);
        tipoFinalRetencion = Math.max(tipoFinalRetencion, 0);
        let importeFinalRetencion = (tipoFinalRetencion / 100) * datos.salarioBruto;
        // 8. Sueldo neto
        const seguridadSocial = cuotaAnual;
        let importeRetencion = importeFinalRetencion;
        let sueldoNeto = datos.salarioBruto - seguridadSocial - importeRetencion;
        let sueldoNeto12Pagas = sueldoNeto / 12;
        let pagasExtras = (datos.salarioBruto - importeRetencion) / 14;
        let salarioMensual = pagasExtras - (seguridadSocial / 12);
        // 9. Ajuste para contratos inferiores a 12 meses
        if (datos.tipoContrato === TIPOS_CONTRATO.INFERIOR_12_MESES && tipoFinalRetencion < 2) tipoFinalRetencion = 2;
        // 10. Resultados
        return {
            sueldoBrutoAnual: datos.salarioBruto,
            sueldoNetoAnual: sueldoNeto,
            cuotaSS: seguridadSocial,
            retencionIRPF: importeRetencion,
            porcentajeRetencion: tipoFinalRetencion,
            sueldoNetoMensual: datos.numeroPagas === 14 ? salarioMensual : sueldoNeto12Pagas,
            pagasExtra: datos.numeroPagas === 14 ? pagasExtras : null
        };
    }

    calcularCuotaSS(datos) {
        // Implementación del cálculo de cuota de Seguridad Social
        const porcentajeSS = 0.0635; // 6.35% para 2025
        return datos.salarioBruto * porcentajeSS;
    }

    calcularRetencionIRPF(datos) {
        // Implementación del cálculo de retención IRPF
        // Aquí se mantiene la lógica original de cálculo
        let porcentajeIRPF = 0;

        // Cálculo base según salario
        if (datos.salarioBruto <= 12450) {
            porcentajeIRPF = 0.095;
        } else if (datos.salarioBruto <= 20200) {
            porcentajeIRPF = 0.12;
        } else if (datos.salarioBruto <= 35200) {
            porcentajeIRPF = 0.15;
        } else if (datos.salarioBruto <= 60000) {
            porcentajeIRPF = 0.18;
        } else if (datos.salarioBruto <= 300000) {
            porcentajeIRPF = 0.22;
        } else {
            porcentajeIRPF = 0.24;
        }

        // Ajustes según situación personal
        if (datos.personasACargo > 0) {
            porcentajeIRPF -= 0.01 * datos.personasACargo;
        }

        if (datos.discapacidad === 'B') {
            porcentajeIRPF -= 0.02;
        } else if (datos.discapacidad === 'C') {
            porcentajeIRPF -= 0.03;
        }

        return datos.salarioBruto * Math.max(porcentajeIRPF, 0.02);
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

    calcularReduccionRendimientoNeto(rendimientoNeto, movilidadGeografica, minusvaliaTitular) {
        let reduccionComun = 2000;
        let reduccionRendimientoNeto = 0;
        if (rendimientoNeto < 11250) {
            reduccionRendimientoNeto = 3700;
        } else if (rendimientoNeto >= 14450) {
            reduccionRendimientoNeto = 0;
        } else {
            reduccionRendimientoNeto = 3700 - (1.15625 * (rendimientoNeto - 11250));
        }
        let incrementoMovilidad = movilidadGeografica ? reduccionRendimientoNeto : 0;
        let minusvalia33 = minusvaliaTitular === 'B' ? 3500 : 0;
        let minusvalia65 = minusvaliaTitular === 'C' ? 7750 : 0;
        return reduccionComun + reduccionRendimientoNeto + incrementoMovilidad + minusvalia33 + minusvalia65;
    }

    calcularMinimoPersonal(edad) {
        if (edad <= 65) return 5550;
        else if (edad > 75) return 5550 + 918 + 1400;
        else return 5550 + 1150;
    }

    calcularMinimoDescendientes(hijosMenores25) {
        if (hijosMenores25 === 0) return 0;
        if (hijosMenores25 === 1) return 2400;
        if (hijosMenores25 === 2) return 2400 + 2700;
        if (hijosMenores25 === 3) return 2400 + 2700 + 4000;
        if (hijosMenores25 === 4) return 2400 + 2700 + 4000 + 4500;
        return 2400 + 2700 + 4000 + 4500 + (4500 * (hijosMenores25 - 4));
    }

    calcularTramosBaseLiquidable(base, comunidad) {
        const tramos = TRAMOS_AUTONOMICOS[comunidad] || TRAMOS_AUTONOMICOS['E'];
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