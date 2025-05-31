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
        return {
            background: isDark ? '#263238' : '#f7f7f7',
            text: isDark ? '#f7f7f7' : '#222',
            primary: isDark ? '#90caf9' : '#1976d2',
            secondary: isDark ? '#23272a' : '#e3e3e3',
            accent: isDark ? '#ffd600' : '#fbc02d',
            grid: isDark ? '#444' : '#e0e0e0',
            axis: isDark ? '#888' : '#666'
        };
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
            fontSize: 12
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
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    const value = Number(params.value).toFixed(2);
                    const percent = Number(params.percent).toFixed(2);
                    return `${params.seriesName} <br/>${params.name}: ${value} € (${percent}%)`;
                }
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: { color: colors.text }
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
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: colors.text
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: resultados.sueldoNetoAnual, name: 'Sueldo Neto', itemStyle: { color: colors.primary } },
                        { value: resultados.cuotaSS, name: 'Seguridad Social', itemStyle: { color: colors.accent } },
                        { value: resultados.retencionIRPF, name: 'IRPF', itemStyle: { color: '#ff6b6b' } }
                    ]
                }
            ]
        };
        this.charts.salaryDistribution.setOption(option);
    }

    updateMonthlyComparisonChart(resultados, datos, colors) {
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
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const value = Number(params[0].value).toFixed(2);
                    return `${params[0].name}: ${value} €`;
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
                axisLabel: { color: colors.text },
                axisLine: { lineStyle: { color: colors.axis } }
            },
            yAxis: {
                type: 'value',
                axisLabel: { 
                    color: colors.text,
                    formatter: '{value} €'
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
                                return colors.accent;
                            }
                            return colors.primary;
                        }
                    }
                }
            ]
        };
        this.charts.monthlyComparison.setOption(option);
    }

    updateIrpfChart(resultados, datos, colors) {
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
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const salario = params[0].name;
                    const irpf = Number(params[0].value).toFixed(2);
                    return `Salario: ${salario} €<br/>IRPF: ${irpf}%`;
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
                axisLabel: { color: colors.text, rotate: 45 },
                axisLine: { lineStyle: { color: colors.axis } }
            },
            yAxis: {
                type: 'value',
                axisLabel: { 
                    color: colors.text,
                    formatter: '{value}%'
                },
                axisLine: { lineStyle: { color: colors.axis } },
                splitLine: { lineStyle: { color: colors.grid } }
            },
            series: [
                {
                    name: 'Porcentaje IRPF',
                    type: 'line',
                    data: tramos.map(t => t.irpf),
                    itemStyle: { color: colors.primary },
                    lineStyle: { color: colors.primary },
                    markPoint: {
                        data: [
                            {
                                coord: [tramos.length - 1, resultados.porcentajeRetencion],
                                name: 'Tu salario',
                                itemStyle: { color: colors.accent }
                            }
                        ]
                    }
                }
            ]
        };
        this.charts.irpf.setOption(option);
    }

    updateDeductionsChart(resultados, colors) {
        const deducciones = [
            { name: 'IRPF', value: resultados.retencionIRPF },
            { name: 'Seg. Social', value: resultados.cuotaSS }
        ];

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function(params) {
                    const value = Number(params[0].value).toFixed(2);
                    return `${params[0].name}: ${value} €`;
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
                    rotate: 45
                },
                axisLine: { lineStyle: { color: colors.axis } },
                splitLine: { lineStyle: { color: colors.grid } }
            },
            yAxis: {
                type: 'category',
                data: deducciones.map(d => d.name),
                axisLabel: { 
                    color: colors.text,
                    rotate: 45
                },
                axisLine: { lineStyle: { color: colors.axis } }
            },
            series: [
                {
                    name: 'Deducciones',
                    type: 'bar',
                    data: deducciones.map(d => d.value),
                    itemStyle: {
                        color: function(params) {
                            return params.dataIndex === 0 ? '#ff6b6b' : colors.accent;
                        }
                    }
                }
            ]
        };
        this.charts.deductions.setOption(option);
    }

    calcularIRPFSimulado(salario) {
        // Simulación simplificada del cálculo de IRPF
        if (salario <= 12450) return 9.5;
        if (salario <= 20200) return 12;
        if (salario <= 35200) return 15;
        if (salario <= 60000) return 18.5;
        return 22.5;
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