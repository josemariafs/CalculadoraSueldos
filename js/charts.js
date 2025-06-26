// Clase para manejar los gráficos con ECharts
class SalaryCharts {
    constructor() {
        this.charts = {};
        this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.lastResultados = null;
        this.lastDatos = null;
        this.initializeCharts();
        this.setupThemeListener();
    }

    setupThemeListener() {
        // Escuchar cambios de tema para actualizar gráficos
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                    this.updateChartsTheme();
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    getThemeColors() {
        const isDark = this.currentTheme === 'dark';
        
        // Obtener colores desde CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        const primary = rootStyles.getPropertyValue('--primary').trim();
        const secondary = rootStyles.getPropertyValue('--secondary').trim();
        const tertiary = rootStyles.getPropertyValue('--tertiary').trim();
        
        return {
            background: isDark ? '#263238' : '#f7f7f7',
            text: isDark ? '#f7f7f7' : '#222',
            primary: primary || '#1ea8e7',
            secondary: secondary || '#6cdbef', 
            tertiary: tertiary || '#5de3c8',
            accent: isDark ? '#ffd600' : '#fbc02d',
            grid: isDark ? '#444' : '#e0e0e0',
            axis: isDark ? '#888' : '#666'
        };
    }

    // Función auxiliar para obtener paleta de colores para series
    getSeriesColors() {
        const colors = this.getThemeColors();
        return [
            colors.primary,   // #1ea8e7
            colors.secondary, // #6cdbef
            colors.tertiary,  // #5de3c8
            colors.accent,    // Color de acento
            '#ff6b6b',        // Rojo para deducciones/gastos
            '#4ecdc4',        // Verde agua adicional
            '#45b7d1',        // Azul claro adicional
            '#96ceb4'         // Verde claro adicional
        ];
    }

    initializeCharts() {
        // Inicializar cada gráfico con configuración de tamaño completo
        this.charts.salaryDistribution = echarts.init(document.getElementById('salaryDistributionChart'), null, { 
            width: 'auto', 
            height: 300 
        });
        this.charts.monthlyComparison = echarts.init(document.getElementById('monthlyComparisonChart'), null, { 
            width: 'auto', 
            height: 300 
        });
        this.charts.irpf = echarts.init(document.getElementById('irpfChart'), null, { 
            width: 'auto', 
            height: 300 
        });
        this.charts.deductions = echarts.init(document.getElementById('deductionsChart'), null, { 
            width: 'auto', 
            height: 300 
        });

        // Configurar gráficos iniciales vacíos
        this.setupEmptyCharts();
    }

    setupEmptyCharts() {
        const colors = this.getThemeColors();
        
        // Configuración base para todos los gráficos
        const baseTextStyle = {
            color: colors.text,
            fontSize: 12,
            fontFamily: 'Montserrat, sans-serif'
        };

        // Gráfico de distribución del salario (donut chart)
        this.charts.salaryDistribution.setOption({
            backgroundColor: 'transparent',
            textStyle: baseTextStyle,
            tooltip: { trigger: 'item' },
            series: []
        });

        // Gráfico de comparativa mensual (barras)
        this.charts.monthlyComparison.setOption({
            backgroundColor: 'transparent',
            textStyle: baseTextStyle,
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: [] },
            yAxis: { type: 'value' },
            series: []
        });

        // Gráfico de tramos IRPF (línea)
        this.charts.irpf.setOption({
            backgroundColor: 'transparent',
            textStyle: baseTextStyle,
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: [] },
            yAxis: { type: 'value' },
            series: []
        });

        // Gráfico de deducciones (barras horizontales)
        this.charts.deductions.setOption({
            backgroundColor: 'transparent',
            textStyle: baseTextStyle,
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'value' },
            yAxis: { type: 'category', data: [] },
            series: []
        });
    }

    updateChartsTheme() {
        Object.values(this.charts).forEach(chart => {
            chart.dispose();
        });
        this.initializeCharts();
        // Volver a renderizar los datos si existen
        if (this.lastResultados && this.lastDatos) {
            this.updateCharts(this.lastResultados, this.lastDatos);
        }
    }

    updateCharts(resultados, datos) {
        this.lastResultados = resultados;
        this.lastDatos = datos;
        const colors = this.getThemeColors();
        
        // Mostrar la sección de gráficos
        document.getElementById('charts-section').style.display = 'block';

        // 1. Gráfico de distribución del salario
        this.updateSalaryDistributionChart(resultados, colors);
        
        // 2. Gráfico de comparativa mensual vs anual
        this.updateMonthlyComparisonChart(resultados, datos, colors);
        
        // 3. Gráfico de tramos IRPF
        this.updateIrpfChart(resultados, datos, colors);
        
        // 4. Gráfico de deducciones
        this.updateDeductionsChart(resultados, colors);

        // Forzar redimensionamiento para ocupar el ancho completo
        setTimeout(() => {
            this.resize();
        }, 100);
    }

    updateSalaryDistributionChart(resultados, colors) {
        const seriesColors = this.getSeriesColors();
        
        const option = {
            backgroundColor: 'transparent',
            textStyle: {
                fontFamily: 'Montserrat, sans-serif'
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    const value = Number(params.value).toFixed(2);
                    const percent = Number(params.percent).toFixed(2);
                    return `${params.seriesName} <br/>${params.name}: ${value} € (${percent}%)`;
                },
                textStyle: {
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: { 
                    color: colors.text,
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            series: [
                {
                    name: 'Distribución Salarial',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['60%', '50%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: colors.background,
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center',
                        fontFamily: 'Montserrat, sans-serif'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: colors.text,
                            fontFamily: 'Montserrat, sans-serif'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: resultados.sueldoNetoAnual, name: 'Sueldo Neto', itemStyle: { color: seriesColors[0] } },
                        { value: resultados.cuotaSS, name: 'Seguridad Social', itemStyle: { color: seriesColors[1] } },
                        { value: resultados.retencionIRPF, name: 'IRPF', itemStyle: { color: seriesColors[2] } }
                    ]
                }
            ]
        };
        this.charts.salaryDistribution.setOption(option);
    }

    updateMonthlyComparisonChart(resultados, datos, colors) {
        const seriesColors = this.getSeriesColors();
        const pagas = datos.numeroPagas;
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const salarioMensual = resultados.sueldoNetoMensual;
        const pagaExtra = resultados.pagasExtra || 0;
        
        const data = meses.map((mes, index) => {
            if (pagas === 14 && (index === 5 || index === 11)) { // Junio y Diciembre
                return salarioMensual + pagaExtra;
            }
            return salarioMensual;
        });

        const option = {
            backgroundColor: 'transparent',
            textStyle: {
                fontFamily: 'Montserrat, sans-serif'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const value = Number(params[0].value).toFixed(2);
                    return `${params[0].name}: ${value} €`;
                },
                textStyle: {
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: meses,
                axisLabel: { 
                    color: colors.text,
                    fontFamily: 'Montserrat, sans-serif'
                },
                axisLine: { lineStyle: { color: colors.axis } }
            },
            yAxis: {
                type: 'value',
                axisLabel: { 
                    color: colors.text,
                    formatter: '{value} €',
                    fontFamily: 'Montserrat, sans-serif'
                },
                axisLine: { lineStyle: { color: colors.axis } },
                splitLine: { lineStyle: { color: colors.grid } }
            },
            series: [
                {
                    name: 'Sueldo Neto Mensual',
                    type: 'bar',
                    data: data,
                    itemStyle: {
                        color: function(params) {
                            // Resaltar meses con pagas extra
                            if (pagas === 14 && (params.dataIndex === 5 || params.dataIndex === 11)) {
                                return seriesColors[1]; // Color secundario para pagas extra
                            }
                            return seriesColors[0]; // Color primario para salario normal
                        }
                    }
                }
            ]
        };
        this.charts.monthlyComparison.setOption(option);
    }

    updateIrpfChart(resultados, datos, colors) {
        const seriesColors = this.getSeriesColors();
        
        // Simular diferentes tramos de salario para mostrar la progresión del IRPF
        const tramos = [
            { salario: 15000, irpf: this.calcularIRPFSimulado(15000) },
            { salario: 25000, irpf: this.calcularIRPFSimulado(25000) },
            { salario: 35000, irpf: this.calcularIRPFSimulado(35000) },
            { salario: 45000, irpf: this.calcularIRPFSimulado(45000) },
            { salario: 55000, irpf: this.calcularIRPFSimulado(55000) },
            { salario: datos.salarioBruto, irpf: resultados.porcentajeRetencion }
        ];

        const option = {
            backgroundColor: 'transparent',
            textStyle: {
                fontFamily: 'Montserrat, sans-serif'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const salario = params[0].name;
                    const irpf = Number(params[0].value).toFixed(2);
                    return `Salario: ${salario} €<br/>IRPF: ${irpf}%`;
                },
                textStyle: {
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: tramos.map(t => t.salario.toLocaleString('es-ES')),
                axisLabel: { 
                    color: colors.text, 
                    rotate: 45,
                    fontFamily: 'Montserrat, sans-serif'
                },
                axisLine: { lineStyle: { color: colors.axis } }
            },
            yAxis: {
                type: 'value',
                axisLabel: { 
                    color: colors.text,
                    formatter: '{value}%',
                    fontFamily: 'Montserrat, sans-serif'
                },
                axisLine: { lineStyle: { color: colors.axis } },
                splitLine: { lineStyle: { color: colors.grid } }
            },
            series: [
                {
                    name: 'Porcentaje IRPF',
                    type: 'line',
                    data: tramos.map(t => t.irpf),
                    itemStyle: { color: seriesColors[0] },
                    lineStyle: { color: seriesColors[0] },
                    markPoint: {
                        data: [
                            {
                                coord: [tramos.length - 1, resultados.porcentajeRetencion],
                                name: 'Tu salario',
                                itemStyle: { 
                                    color: seriesColors[2],
                                    borderColor: seriesColors[2],
                                    borderWidth: 2
                                },
                                label: {
                                    color: colors.text,
                                    fontWeight: 'bold',
                                    fontFamily: 'Montserrat, sans-serif'
                                }
                            }
                        ]
                    }
                }
            ]
        };
        this.charts.irpf.setOption(option);
    }

    updateDeductionsChart(resultados, colors) {
        const seriesColors = this.getSeriesColors();
        
        const deducciones = [
            { name: 'IRPF', value: resultados.retencionIRPF },
            { name: 'Seg. Social', value: resultados.cuotaSS }
        ];

        const option = {
            backgroundColor: 'transparent',
            textStyle: {
                fontFamily: 'Montserrat, sans-serif'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function(params) {
                    const value = Number(params[0].value).toFixed(2);
                    return `${params[0].name}: ${value} €`;
                },
                textStyle: {
                    fontFamily: 'Montserrat, sans-serif'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLabel: { 
                    color: colors.text,
                    formatter: '{value} €',
                    rotate: 45,
                    fontFamily: 'Montserrat, sans-serif'
                },
                axisLine: { lineStyle: { color: colors.axis } },
                splitLine: { lineStyle: { color: colors.grid } }
            },
            yAxis: {
                type: 'category',
                data: deducciones.map(d => d.name),
                axisLabel: { 
                    color: colors.text,
                    rotate: 45,
                    fontFamily: 'Montserrat, sans-serif'
                },
                axisLine: { lineStyle: { color: colors.axis } }
            },
            series: [
                {
                    name: 'Deducciones',
                    type: 'bar',
                    data: deducciones.map((d, index) => ({
                        value: d.value,
                        name: d.name,
                        itemStyle: {
                            color: index === 0 ? seriesColors[2] : seriesColors[1] // IRPF: terciario, SS: secundario
                        }
                    }))
                }
            ]
        };
        this.charts.deductions.setOption(option);
    }

    calcularIRPFSimulado(salario) {
        // Usar la misma lógica que el calculador principal
        // Simulamos los cálculos básicos para obtener un porcentaje realista
        
        // 1. Cuota de Seguridad Social aproximada (6.35%)
        const cuotaSS = salario * 0.0635;
        
        // 2. Rendimiento neto
        const rendimientoNeto = salario - cuotaSS;
        
        // 3. Reducción básica (simplificada para la simulación)
        let reduccion = 2000; // Reducción común
        if (rendimientoNeto < 11250) {
            reduccion += 3700;
        } else if (rendimientoNeto < 14450) {
            reduccion += 3700 - (1.15625 * (rendimientoNeto - 11250));
        }
        
        // 4. Base imponible
        let baseImponible = Math.max(salario - cuotaSS - reduccion, 0);
        
        // 5. Mínimo personal básico (edad media 40 años)
        const minimoPersonal = 5550;
        
        // 6. Obtener comunidad autónoma del formulario actual si existe
        let comunidadAutonoma = 'E'; // Por defecto estatal
        const selectComunidad = document.getElementById('comunidad_autonoma');
        if (selectComunidad && selectComunidad.value) {
            comunidadAutonoma = selectComunidad.value;
        }
        
        // 7. Cálculo de cuota usando los tramos reales
        const cuotaTotal = this.calcularTramosBaseLiquidable(baseImponible, comunidadAutonoma) + 
                          this.calcularTramosBaseLiquidable(baseImponible, 'E');
        const cuotaMinimos = this.calcularTramosBaseLiquidable(minimoPersonal, comunidadAutonoma) + 
                            this.calcularTramosBaseLiquidable(minimoPersonal, 'E');
        
        const cuotaRetencion = Math.max(cuotaTotal - cuotaMinimos, 0);
        
        // 8. Porcentaje de retención
        const porcentaje = (cuotaRetencion / salario) * 100;
        
        return Math.max(porcentaje, 0);
    }

    // Método auxiliar para calcular tramos (copiado del calculador principal)
    calcularTramosBaseLiquidable(base, comunidad) {
        // Usar los mismos tramos que el calculador principal
        const tramos = window.TRAMOS_AUTONOMICOS ? 
                      (window.TRAMOS_AUTONOMICOS[comunidad] || window.TRAMOS_AUTONOMICOS['E']) :
                      this.getTramosBasicos(comunidad);
        
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

    // Tramos básicos como fallback si no están disponibles los globales
    getTramosBasicos(comunidad) {
        const tramosBasicos = {
            'E': [ // Estatal - Tramos oficiales 2025
                [0, 12450, 9.5], [12450, 20200, 12], [20200, 35200, 15], [35200, 60000, 18.5], [60000, 300000, 22.5], [300000, 999999999999, 24.5]
            ],
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
            ]
        };
        return tramosBasicos[comunidad] || tramosBasicos['E'];
    }

    resize() {
        // Redimensionar gráficos cuando cambia el tamaño de la ventana
        Object.values(this.charts).forEach(chart => {
            chart.resize();
        });
    }
}

// Instancia global de gráficos
let salaryCharts = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    salaryCharts = new SalaryCharts();
    window.salaryCharts = salaryCharts; // Hacer accesible globalmente
    
    // Redimensionar gráficos cuando cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
        if (salaryCharts) {
            salaryCharts.resize();
        }
    });

    // Observer para redimensionar cuando los contenedores cambien de tamaño
    if (window.ResizeObserver) {
        const chartContainers = document.querySelectorAll('.chart');
        const resizeObserver = new ResizeObserver(entries => {
            if (salaryCharts) {
                salaryCharts.resize();
            }
        });
        
        chartContainers.forEach(container => {
            resizeObserver.observe(container);
        });
    }
}); 