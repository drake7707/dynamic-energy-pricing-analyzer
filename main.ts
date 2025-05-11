


document.querySelector("#analyzeBtn").addEventListener("click", (ev) => loadData());

async function loadData() {

    const formulaConsumption = (<HTMLInputElement>document.querySelector("#formulaConsumption")).value;

    try {
        const calc = getFormulaFunction(formulaConsumption);
        const result = calc({ "BELPEX": 100 });
        if (isNaN(result)) {
            alert("The formula returned an invalid value check to make sure it's valid syntax (use decimal point for decimals,etc)");
        }
    }
    catch (err) {
        alert("The formula gave an error, check to make sure it's valid syntax (use decimal point for decimals,etc)");
        return;
    }
    const formulaProduction = (<HTMLInputElement>document.querySelector("#formulaProduction")).value;

    try {
        const calc = getFormulaFunction(formulaProduction);
        const result = calc({ "BELPEX": 100 });
        if (isNaN(result)) {
            alert("The formula returned an invalid value check to make sure it's valid syntax (use decimal point for decimals,etc)");
        }
    }
    catch (err) {
        alert("The formula gave an error, check to make sure it's valid syntax (use decimal point for decimals,etc)");
        return;
    }


    const historicalData = await loadHistoricalData();

    const quarterData = await loadQuarterData();

    const from = (<HTMLInputElement>document.querySelector("#fromDate")).valueAsDate;
    const to = (<HTMLInputElement>document.querySelector("#toDate")).valueAsDate;


    if (historicalData != null && quarterData != null)
        await analyse(from, to, historicalData, quarterData, formulaConsumption, formulaProduction);

}

function getFormulaFunction(formula: string) {
    return new Function("BELPEX", "with (BELPEX) { return (" + formula + ")}");
}

async function loadHistoricalData() {
    let historicalData: { [key: number]: number } = {};

    const historicFile: any = (<HTMLInputElement>document.body.querySelector("#historicalFile")).files[0];

    if (typeof historicFile === "undefined") {
        if (localStorage.getItem("historicalData") ===null) {
            alert("No local csv data is stored yet, select historical data file");
            return null;
        } else {
            //alert("Local stored history data will be used");
            historicalData = JSON.parse(localStorage.getItem("historicalData"));
            return historicalData;
        }
    }

    const result = await historicFile.text();
    const lines = result.split("\n");

    for (let i: number = 1; i < lines.length; i++) {
        const line = lines[i];
        //const values = line.split(",");
        //const date = Date.parse(values[2]); // todo find utc column index instead of assuming it's the 3rd
        //const price = parseFloat(values[4]);

        const values = line.split(";");
        const date = Date.parse(values[0].split(" ")[0].split('/').reverse().join("-") + " " + values[0].split(" ")[1]);
        const price = parseFloat(values[1].replace("� � ", "").replace("\r", "").replace(",", "."))

        historicalData[date] = price;
    }
    localStorage.setItem("historicalData", JSON.stringify(historicalData));

    return historicalData;
}

async function loadQuarterData() {
    let quarterDataProduction: { [key: number]: any } = {};
    let quarterDataUsage: { [key: number]: any } = {};

    const quarterFile: any = (<HTMLInputElement>document.body.querySelector("#quarterFile")).files[0];

    if (typeof quarterFile === "undefined") {
        if (localStorage.getItem("quarterDataUsage") === null || localStorage.getItem("quarterDataProduction") === null) {
            alert("No local csv data is stored yet, select quarter data file");
            return null;
        } else {
            //alert("Local stored quarter data will be used");
            quarterDataUsage = JSON.parse(localStorage.getItem("quarterDataUsage"));
            quarterDataProduction = JSON.parse(localStorage.getItem("quarterDataProduction"));
            return {
                "usage": quarterDataUsage,
                "production": quarterDataProduction
            }
        }
    }

    const result = await quarterFile.text();
    const lines = result.split("\n");

    for (let i: number = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line != "") {
            const values = line.split(";");

            const dateStr = values[0].split("-").reverse().join("-") + " " + values[1];

            const type = values[7];

            try {
                const date = Date.parse(dateStr); // todo find utc column index instead of assuming it's the 3rd
                if (values[8] !== "") {
                    const volume = parseFloat(values[8].replace(",", "."));

                    if (type == "Afname Dag" || type == "Afname Nacht")
                        quarterDataUsage[date] = volume;
                    else if (type == "Injectie Dag" || type == "Injectie Nacht")
                        quarterDataProduction[date] = volume;
                }
            } catch (err) {
                debugger;
            }
        }
    }


    localStorage.setItem("quarterDataUsage", JSON.stringify(quarterDataUsage));
    localStorage.setItem("quarterDataProduction", JSON.stringify(quarterDataProduction));

    return {
        "usage": quarterDataUsage,
        "production": quarterDataProduction
    }
}


async function analyse(from: Date, to: Date, historicalData: any, quarterData: any, formulaConsumption: string, formulaProduction: string) {

    // calculate the price per hour based on consumption and production

    let totalPrice = 0;
    let totalConsumption = 0;
    let totalProduction = 0;

    let totalPriceWhenPositive = 0;
    let totalConsumptionWhenPositive = 0;
    let totalProductionWhenPositive = 0;

    let totalPriceWhenNegative = 0;
    let totalConsumptionWhenNegative = 0;
    let totalProductionWhenNegative = 0;

    const calcConsumption = getFormulaFunction(formulaConsumption);
    const calcProduction = getFormulaFunction(formulaProduction);

    let cur = from.getTime();
    while (cur < to.getTime()) {

        const consumptionUnitPrice = calcConsumption({ "BELPEX": historicalData[cur] });
        const productionUnitPrice = calcProduction({ "BELPEX": historicalData[cur] });

        let skip = false;
        if (typeof historicalData[cur] === "undefined") {
            console.error("No historical data for " + new Date(cur));
            skip = true;
        }

        if (typeof quarterData.usage[cur] === "undefined") {
            console.error("No usage quarter data for " + new Date(cur));
            skip = true;
        }

        if (typeof quarterData.production[cur] === "undefined") {
            console.error("No production quarter data for " + new Date(cur));
            skip = true;
        }

        if (!skip) {
            const q1Usage = quarterData.usage[cur];
            const q2Usage = quarterData.usage[cur + 15 * 60 * 1000];
            const q3Usage = quarterData.usage[cur + 30 * 60 * 1000]
            const q4Usage = quarterData.usage[cur + 45 * 60 * 1000];

            const q1Production = quarterData.production[cur];
            const q2Production = quarterData.production[cur + 15 * 60 * 1000];
            const q3Production = quarterData.production[cur + 30 * 60 * 1000]
            const q4Production = quarterData.production[cur + 45 * 60 * 1000];

            const consumption = (q1Usage + q2Usage + q3Usage + q4Usage);
            const production = (q1Production + q2Production + q3Production + q4Production)

            //console.log(cur + " " + unitPrice + "€/kwh usage: " + consumption + "kwh, production: " + production + "kwh");

            let priceConsumption = consumption * consumptionUnitPrice;
            let priceProduction = production * productionUnitPrice;

            let price = priceConsumption - priceProduction;

            totalPrice += price;
            totalConsumption += consumption;
            totalProduction += production;

            if (historicalData[cur] < 0) {
                totalPriceWhenNegative += price;
                totalConsumptionWhenNegative += consumption;
                totalProductionWhenNegative += production;
            } else {
                totalPriceWhenPositive += price;
                totalConsumptionWhenPositive += consumption;
                totalProductionWhenPositive += production;
            }
        }

        cur += 3600 * 1000;

    }

    document.querySelector("#results").innerHTML = `<hr/>
      <h4>These are the totals for the full period given</h4>
      <div>Total cost: ${totalPrice.toFixed(2)}€</div>
      <div>Total consumption: ${totalConsumption.toFixed(2)}kwh</div>
      <div>Total production: ${totalProduction.toFixed(2)}kwh</div>
      <br/> 
      <h4>These are the totals for the full period given when the BELPEX price was positive</h4>
      <div>Total cost: ${totalPriceWhenPositive.toFixed(2)}€</div>
      <div>Total consumption: ${totalConsumptionWhenPositive.toFixed(2)}kwh</div>
      <div>Total production: ${totalProductionWhenPositive.toFixed(2)}kwh</div>
      <br/> 
      <h4>And similarly when the BELPEX price was negative</h4>
      <div>Total cost: ${totalPriceWhenNegative.toFixed(2)}€</div>
      <div>Total consumption: ${totalConsumptionWhenNegative.toFixed(2)}kwh</div>
      <div>Total production: ${totalProductionWhenNegative.toFixed(2)}kwh</div>        
      <br/>
      <div id="historicalDataChart"></div>
      <br/>
      <div id="quarterDataChart"></div>
      <br/>
      <div id="historicalDataAveragePerDayChart"></div>
      <br/>
      <div id="quarterDataConsumptionAveragePerDayChart"></div>
      <br/>
      <div id="quarterDataProductionAveragePerDayChart"></div>
    `;
    loadHistoricDataChart(historicalData, from, to);
    loadConsumptionProductionChart(quarterData, from, to);
    loadHistoricalAveragePerDayDataChart(historicalData, from, to);
    loadConsumptionAveragePerDayDataChart(quarterData, from, to);
    loadProductionAveragePerDayDataChart(quarterData, from, to);
}

function loadConsumptionProductionChart(quarterData: any, from: Date, to: Date) {

    let seriesProductionData = [];
    let seriesConsumptionData = [];

    let cur = from.getTime();
    while (cur < to.getTime()) {
        let skip = false;
        if (typeof quarterData.usage[cur] === "undefined") {
            console.error("No usage quarter data for " + new Date(cur));
            skip = true;
            seriesConsumptionData.push(null);
        } else {
            seriesConsumptionData.push(quarterData.usage[cur]);
        }

        if (typeof quarterData.production[cur] === "undefined") {
            console.error("No production quarter data for " + new Date(cur));
            skip = true;
            seriesProductionData.push(null)
        } else {
            seriesProductionData.push(-quarterData.production[cur]);
        }

        cur += 900 * 1000;
    }
    //   seriesData = [12, 1, 3, 7, 14];

    Highcharts.chart('quarterDataChart', {
        chart: {
            zooming: {
                type: 'x'
            }
        },
        title: {
            text: 'Quarter data',
            align: 'left'
        },
        xAxis: {
            type: 'datetime',
            showFirstLabel: true,
            showLastLabel: true,
            min: from.getTime(),
            //minRange: 24 * 3600 * 1000,
            dateTimeLabelFormats: {
                hour: '%H:%M',
            }
        },
        yAxis: {
            title: {
                text: 'kwh'
            }
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        series: [{
            name: 'Consumption',
            pointInterval: 3600 * 1000,
            pointStart: from.getTime(),
            data: seriesConsumptionData
        }, {
            name: 'Production',
            pointInterval: 3600 * 1000,
            pointStart: from.getTime(),
            data: seriesProductionData
        }],



    });
}

function loadHistoricDataChart(historicalData: any, from: Date, to: Date) {

    let seriesData = [];

    let cur = from.getTime();
    while (cur < to.getTime()) {

        if (typeof historicalData[cur] === "undefined") {
            seriesData.push(0);
        }
        else
            seriesData.push(historicalData[cur]);

        cur += 3600 * 1000;
    }
    //   seriesData = [12, 1, 3, 7, 14];

    Highcharts.chart('historicalDataChart', {
        chart: {
            zooming: {
                type: 'x'
            }
        },
        title: {
            text: 'BELPEX for period',
            align: 'left'
        },
        xAxis: {
            type: 'datetime',
            showFirstLabel: true,
            showLastLabel: true,
            min: from.getTime(),
            //minRange: 24 * 3600 * 1000,
            dateTimeLabelFormats: {
                hour: '%H:%M',
            }
        },
        yAxis: {
            title: {
                text: '€/Mwh'
            }
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        series: [{
            name: 'BELPEX',
            pointInterval: 3600 * 1000,
            pointStart: from.getTime(),
            data: seriesData
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });
}



function loadHistoricalAveragePerDayDataChart(historicalData: any, from: Date, to: Date) {

    let data: any = {};

    let cur = from.getTime();
    while (cur < to.getTime()) {


        const month = new Date(cur).getMonth();
        if (typeof data[month] === "undefined") {
            data[month] = {
                "sum": [],
                "count": []
            }
            for (let i = 0; i < 24; i++) {
                data[month].sum.push(0);
                data[month].count.push(0);
            }

        }
        cur += 3600 * 1000;
    }


    cur = from.getTime();
    while (cur < to.getTime()) {


        if (typeof historicalData[cur] === "undefined") {

        }
        else {
            const month = new Date(cur).getMonth();

            data[month].sum[new Date(cur).getHours()] += historicalData[cur];
            data[month].count[new Date(cur).getHours()]++;
        }

        cur += 3600 * 1000;
    }

    let seriesData = [];
    for (let m of Object.keys(data)) {

        const monthData = [];
        for (let i: number = 0; i < 24; i++) {
            monthData.push(Math.round(data[m].sum[i] / data[m].count[i] * 100) / 100);
        }

        seriesData.push({
            name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][<any>m],
            pointInterval: 3600 * 1000,
            pointStart: from.getTime(),
            data: monthData
        });
    }


    Highcharts.chart('historicalDataAveragePerDayChart', {
        chart: {
            zooming: {
                type: 'x'
            },
            type: 'line'
        },
        title: {
            text: 'Average BELPEX price per hour',
            align: 'left'
        },
        xAxis: {
            type: 'datetime',
            showFirstLabel: false,
            showLastLabel: true,
            min: from.getTime(),
            //minRange: 24 * 3600 * 1000,
            dateTimeLabelFormats: {
                hour: '%H:%M',
            }
        },
        yAxis: {
            title: {
                text: '€/Mwh'
            }
        },
        tooltip: {
            xDateFormat: "%k:%M",
            shared: true,

        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        series: seriesData,

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });
}


function loadConsumptionAveragePerDayDataChart(quarterData: any, from: Date, to: Date) {

    let data: any = {};

    let cur = from.getTime();
    while (cur < to.getTime()) {


        const month = new Date(cur).getMonth();
        if (typeof data[month] === "undefined") {
            data[month] = {
                "sum": [],
                "count": []
            }
            for (let i = 0; i < 24 * 4; i++) {
                data[month].sum.push(0);
                data[month].count.push(0);
            }

        }
        cur += 900 * 1000;
    }


    cur = from.getTime();
    while (cur < to.getTime()) {


        if (typeof quarterData.usage[cur] === "undefined") {

        }
        else {
            const month = new Date(cur).getMonth();
            const idx = new Date(cur).getHours() * 4 + Math.floor(new Date(cur).getMinutes() / 15);
            data[month].sum[idx] += quarterData.usage[cur];
            data[month].count[idx]++;

        }

        cur += 900 * 1000;
    }

    let seriesData = [];
    for (let m of Object.keys(data)) {

        const monthData = [];
        for (let i: number = 0; i < 24 * 4; i++) {
            monthData.push(Math.round(data[m].sum[i] / data[m].count[i] * 100) / 100);
        }


        seriesData.push({
            name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][<any>m],
            pointInterval: 900 * 1000,
            pointStart: from.getTime(),
            data: monthData
        });
    }


    Highcharts.chart('quarterDataConsumptionAveragePerDayChart', {
        chart: {
            zooming: {
                type: 'x'
            },
            type: 'line'
        },
        title: {
            text: 'Average consumption per day',
            align: 'left'
        },
        xAxis: {
            type: 'datetime',
            showFirstLabel: false,
            showLastLabel: true,
            min: from.getTime(),
            //minRange: 24 * 3600 * 1000,
            dateTimeLabelFormats: {
                hour: '%H:%M',
            }
        },
        yAxis: {
            title: {
                text: 'kwh'
            }
        },
        tooltip: {
            xDateFormat: "%k:%M",
            shared: true,

        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        series: seriesData,

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });
}


function loadProductionAveragePerDayDataChart(quarterData: any, from: Date, to: Date) {

    let data: any = {};

    let cur = from.getTime();
    while (cur < to.getTime()) {


        const month = new Date(cur).getMonth();
        if (typeof data[month] === "undefined") {
            data[month] = {
                "sum": [],
                "count": []
            }
            for (let i = 0; i < 24 * 4; i++) {
                data[month].sum.push(0);
                data[month].count.push(0);
            }

        }
        cur += 900 * 1000;
    }


    cur = from.getTime();
    while (cur < to.getTime()) {


        if (typeof quarterData.production[cur] === "undefined") {

        }
        else {
            const month = new Date(cur).getMonth();
            const idx = new Date(cur).getHours() * 4 + Math.floor(new Date(cur).getMinutes() / 15);
            data[month].sum[idx] += quarterData.production[cur];
            data[month].count[idx]++;

        }

        cur += 900 * 1000;
    }

    let seriesData = [];
    for (let m of Object.keys(data)) {

        const monthData = [];
        for (let i: number = 0; i < 24 * 4; i++) {
            monthData.push(Math.round(data[m].sum[i] / data[m].count[i] * 100) / 100);
        }


        seriesData.push({
            name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][<any>m],
            pointInterval: 900 * 1000,
            pointStart: from.getTime(),
            data: monthData
        });
    }


    Highcharts.chart('quarterDataProductionAveragePerDayChart', {
        chart: {
            zooming: {
                type: 'x'
            },
            type: 'line'
        },
        title: {
            text: 'Average production per day',
            align: 'left'
        },
        xAxis: {
            type: 'datetime',
            showFirstLabel: false,
            showLastLabel: true,
            min: from.getTime(),
            //minRange: 24 * 3600 * 1000,
            dateTimeLabelFormats: {
                hour: '%H:%M',
            }
        },
        yAxis: {
            title: {
                text: 'kwh'
            }
        },
        tooltip: {
            xDateFormat: "%k:%M",
            shared: true,
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        series: seriesData,

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });
}



