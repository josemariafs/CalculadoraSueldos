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
        
        // 3. Gráfico de tramos de retención
        this.updateRetencionesChart(resultados, datos, colors);
        
        // 4. Gráfico de retenciones
        this.updateRetencionesDesgloseChart(resultados, colors);

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
        const retencionMensual = (resultados.retencionIRPF + resultados.cuotaSS) / pagas;
        const retencionExtra = (resultados.retencionIRPF + resultados.cuotaSS) / pagas; // Se reparte igual
        // Datos para cada mes
        const dataNeto = [];
        const dataRetencion = [];
        for (let i = 0; i < 12; i++) {
            if (pagas === 14 && (i === 5 || i === 11)) { // Junio y Diciembre
                dataNeto.push(salarioMensual + pagaExtra);
                dataRetencion.push(retencionMensual + retencionExtra);
            } else {
                dataNeto.push(salarioMensual);
                dataRetencion.push(retencionMensual);
            }
        }
        const option = {
            backgroundColor: 'transparent',
            textStyle: {
                fontFamily: 'Montserrat, sans-serif'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function(params) {
                    let txt = `<b>${params[0].name}</b><br/>`;
                    params.forEach(p => {
                        txt += `${p.marker} ${p.seriesName}: <b>${Number(p.value).toFixed(2)} €</b><br/>`;
                    });
                    const total = params.reduce((sum, p) => sum + Number(p.value), 0);
                    txt += `<b>Total: ${total.toFixed(2)} €</b>`;
                    return txt;
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
                    name: 'Retenciones',
                    type: 'bar',
                    stack: 'total',
                    data: dataRetencion,
                    itemStyle: {
                        color: seriesColors[2]
                    }
                },
                {
                    name: 'Sueldo Neto',
                    type: 'bar',
                    stack: 'total',
                    data: dataNeto,
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

    updateRetencionesChart(resultados, datos, colors) {
        const seriesColors = this.getSeriesColors();
        // Simular diferentes tramos de salario para mostrar la progresión de las retenciones
        let tramos = [
            { salario: 15000, retencion: this.calcularRetencionSimulada(15000) },
            { salario: 25000, retencion: this.calcularRetencionSimulada(25000) },
            { salario: 35000, retencion: this.calcularRetencionSimulada(35000) },
            { salario: 45000, retencion: this.calcularRetencionSimulada(45000) },
            { salario: 55000, retencion: this.calcularRetencionSimulada(55000) }
        ];
        // Insertar el salario del usuario en la posición correcta
        const salarioUsuario = datos.salarioBruto;
        const retencionUsuario = resultados.porcentajeRetencion;
        let insertado = false;
        for (let i = 0; i < tramos.length; i++) {
            if (salarioUsuario < tramos[i].salario) {
                tramos.splice(i, 0, { salario: salarioUsuario, retencion: retencionUsuario });
                insertado = true;
                break;
            }
        }
        if (!insertado) {
            tramos.push({ salario: salarioUsuario, retencion: retencionUsuario });
        }
        // Buscar la posición del salario del usuario para el markPoint
        const idxUsuario = tramos.findIndex(t => t.salario === salarioUsuario);
        const option = {
            backgroundColor: 'transparent',
            textStyle: {
                fontFamily: 'Montserrat, sans-serif'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const salario = params[0].name;
                    const retencion = Number(params[0].value).toFixed(2);
                    return `Salario: ${salario} €<br/>Retención: ${retencion}%`;
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
                    name: 'Porcentaje Retención',
                    type: 'line',
                    data: tramos.map(t => t.retencion),
                    itemStyle: { color: seriesColors[0] },
                    lineStyle: { color: seriesColors[0] },
                    markPoint: {
                        data: [
                            {
                                coord: [idxUsuario, retencionUsuario],
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

    updateRetencionesDesgloseChart(resultados, colors) {
        const seriesColors = this.getSeriesColors();
        
        const retenciones = [
            { name: 'Retenciones de Sueldo', value: resultados.retencionIRPF },
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
                data: retenciones.map(d => d.name),
                axisLabel: { 
                    color: colors.text,
                    rotate: 45,
                    fontFamily: 'Montserrat, sans-serif'
                },
                axisLine: { lineStyle: { color: colors.axis } }
            },
            series: [
                {
                    name: 'Retenciones',
                    type: 'bar',
                    data: retenciones.map((d, index) => ({
                        value: d.value,
                        name: d.name,
                        itemStyle: {
                            color: index === 0 ? seriesColors[2] : seriesColors[1] // Retenciones: terciario, SS: secundario
                        }
                    }))
                }
            ]
        };
        this.charts.deductions.setOption(option);
    }

    calcularRetencionSimulada(salario) {
        // Usar la misma lógica que el calculador principal para retenciones
        // Simulamos los cálculos básicos para obtener un porcentaje realista
        
        // Obtener tramos de retenciones estatales
        const tramos = window.TRAMOS_RETENCIONES;
        
        // Calcular retención por tramos
        let retencionTotal = 0;
        let salarioRestante = salario;
        
        for (let i = 0; i < tramos.length; i++) {
            const [limiteInferior, limiteSuperior, porcentaje] = tramos[i];
            
            if (salarioRestante > limiteInferior) {
                const baseImponible = Math.min(salarioRestante - limiteInferior, limiteSuperior - limiteInferior);
                retencionTotal += (baseImponible * porcentaje) / 100;
            }
        }
        
        // Porcentaje de retención
        const porcentaje = (retencionTotal / salario) * 100;
        
        return Math.max(porcentaje, 0);
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