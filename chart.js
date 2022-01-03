var TIME = 0

var CHART = new Chart("chart", {
    type: "line",
    data: {
        labels: [0],
        datasets: [{
            data: [0],
            fill: false,
            lineTension: 0,
            pointRadius: 5,
            backgroundColor: "rgba(0,0,255,1.0)",
            borderColor: "rgba(0,0,255,0.1)",
        }]
    },
    options: {
        legend: { display: false },
        scales: {
            yAxes: [{ ticks: { min: -10, max: 10 } }]
        }
    }
});

function updateData(chart, x, y) {
    let data = chart.data.datasets[0].data
    let range = chart.options.scales.yAxes[0].ticks


    if (x in chart.data.labels) data[chart.data.labels.indexOf(x)] = y
    else {
        chart.data.labels.push(x);
        data.push(y)
    }

    range.min = int(data.reduce((a, b) => a < b ? a : b))
    range.max = int(data.reduce((a, b) => a > b ? a : b))

    chart.update();
}