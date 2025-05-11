var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
document.querySelector("#analyzeBtn").addEventListener("click", function (ev) { return loadData(); });
function loadData() {
    return __awaiter(this, void 0, void 0, function () {
        var formulaConsumption, calc, result, formulaProduction, calc, result, historicalData, quarterData, from, to;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formulaConsumption = document.querySelector("#formulaConsumption").value;
                    try {
                        calc = getFormulaFunction(formulaConsumption);
                        result = calc({ "BELPEX": 100 });
                        if (isNaN(result)) {
                            alert("The formula returned an invalid value check to make sure it's valid syntax (use decimal point for decimals,etc)");
                        }
                    }
                    catch (err) {
                        alert("The formula gave an error, check to make sure it's valid syntax (use decimal point for decimals,etc)");
                        return [2 /*return*/];
                    }
                    formulaProduction = document.querySelector("#formulaProduction").value;
                    try {
                        calc = getFormulaFunction(formulaProduction);
                        result = calc({ "BELPEX": 100 });
                        if (isNaN(result)) {
                            alert("The formula returned an invalid value check to make sure it's valid syntax (use decimal point for decimals,etc)");
                        }
                    }
                    catch (err) {
                        alert("The formula gave an error, check to make sure it's valid syntax (use decimal point for decimals,etc)");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, loadHistoricalData()];
                case 1:
                    historicalData = _a.sent();
                    return [4 /*yield*/, loadQuarterData()];
                case 2:
                    quarterData = _a.sent();
                    from = document.querySelector("#fromDate").valueAsDate;
                    to = document.querySelector("#toDate").valueAsDate;
                    if (!(historicalData != null && quarterData != null)) return [3 /*break*/, 4];
                    return [4 /*yield*/, analyse(from, to, historicalData, quarterData, formulaConsumption, formulaProduction)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getFormulaFunction(formula) {
    return new Function("BELPEX", "with (BELPEX) { return (" + formula + ")}");
}
function loadHistoricalData() {
    return __awaiter(this, void 0, void 0, function () {
        var historicalData, historicFile, result, lines, i, line, values, date, price;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    historicalData = {};
                    historicFile = document.body.querySelector("#historicalFile").files[0];
                    if (typeof historicFile === "undefined") {
                        if (localStorage.getItem("historicalData") === null) {
                            alert("No local csv data is stored yet, select historical data file");
                            return [2 /*return*/, null];
                        }
                        else {
                            //alert("Local stored history data will be used");
                            historicalData = JSON.parse(localStorage.getItem("historicalData"));
                            return [2 /*return*/, historicalData];
                        }
                    }
                    return [4 /*yield*/, historicFile.text()];
                case 1:
                    result = _a.sent();
                    lines = result.split("\n");
                    for (i = 1; i < lines.length; i++) {
                        line = lines[i];
                        values = line.split(";");
                        date = Date.parse(values[0].split(" ")[0].split('/').reverse().join("-") + " " + values[0].split(" ")[1]);
                        price = parseFloat(values[1].replace("� � ", "").replace("\r", "").replace(",", "."));
                        historicalData[date] = price;
                    }
                    localStorage.setItem("historicalData", JSON.stringify(historicalData));
                    return [2 /*return*/, historicalData];
            }
        });
    });
}
function loadQuarterData() {
    return __awaiter(this, void 0, void 0, function () {
        var quarterDataProduction, quarterDataUsage, quarterFile, result, lines, i, line, values, dateStr, type, date, volume;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    quarterDataProduction = {};
                    quarterDataUsage = {};
                    quarterFile = document.body.querySelector("#quarterFile").files[0];
                    if (typeof quarterFile === "undefined") {
                        if (localStorage.getItem("quarterDataUsage") === null || localStorage.getItem("quarterDataProduction") === null) {
                            alert("No local csv data is stored yet, select quarter data file");
                            return [2 /*return*/, null];
                        }
                        else {
                            //alert("Local stored quarter data will be used");
                            quarterDataUsage = JSON.parse(localStorage.getItem("quarterDataUsage"));
                            quarterDataProduction = JSON.parse(localStorage.getItem("quarterDataProduction"));
                            return [2 /*return*/, {
                                    "usage": quarterDataUsage,
                                    "production": quarterDataProduction
                                }];
                        }
                    }
                    return [4 /*yield*/, quarterFile.text()];
                case 1:
                    result = _a.sent();
                    lines = result.split("\n");
                    for (i = 1; i < lines.length; i++) {
                        line = lines[i];
                        if (line != "") {
                            values = line.split(";");
                            dateStr = values[0].split("-").reverse().join("-") + " " + values[1];
                            type = values[7];
                            try {
                                date = Date.parse(dateStr);
                                if (values[8] !== "") {
                                    volume = parseFloat(values[8].replace(",", "."));
                                    if (type == "Afname Dag" || type == "Afname Nacht")
                                        quarterDataUsage[date] = volume;
                                    else if (type == "Injectie Dag" || type == "Injectie Nacht")
                                        quarterDataProduction[date] = volume;
                                }
                            }
                            catch (err) {
                                debugger;
                            }
                        }
                    }
                    localStorage.setItem("quarterDataUsage", JSON.stringify(quarterDataUsage));
                    localStorage.setItem("quarterDataProduction", JSON.stringify(quarterDataProduction));
                    return [2 /*return*/, {
                            "usage": quarterDataUsage,
                            "production": quarterDataProduction
                        }];
            }
        });
    });
}
function analyse(from, to, historicalData, quarterData, formulaConsumption, formulaProduction) {
    return __awaiter(this, void 0, void 0, function () {
        var totalPrice, totalConsumption, totalProduction, totalPriceWhenPositive, totalConsumptionWhenPositive, totalProductionWhenPositive, totalPriceWhenNegative, totalConsumptionWhenNegative, totalProductionWhenNegative, calcConsumption, calcProduction, cur, consumptionUnitPrice, productionUnitPrice, skip, q1Usage, q2Usage, q3Usage, q4Usage, q1Production, q2Production, q3Production, q4Production, consumption, production, priceConsumption, priceProduction, price;
        return __generator(this, function (_a) {
            totalPrice = 0;
            totalConsumption = 0;
            totalProduction = 0;
            totalPriceWhenPositive = 0;
            totalConsumptionWhenPositive = 0;
            totalProductionWhenPositive = 0;
            totalPriceWhenNegative = 0;
            totalConsumptionWhenNegative = 0;
            totalProductionWhenNegative = 0;
            calcConsumption = getFormulaFunction(formulaConsumption);
            calcProduction = getFormulaFunction(formulaProduction);
            cur = from.getTime();
            while (cur < to.getTime()) {
                consumptionUnitPrice = calcConsumption({ "BELPEX": historicalData[cur] });
                productionUnitPrice = calcProduction({ "BELPEX": historicalData[cur] });
                skip = false;
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
                    q1Usage = quarterData.usage[cur];
                    q2Usage = quarterData.usage[cur + 15 * 60 * 1000];
                    q3Usage = quarterData.usage[cur + 30 * 60 * 1000];
                    q4Usage = quarterData.usage[cur + 45 * 60 * 1000];
                    q1Production = quarterData.production[cur];
                    q2Production = quarterData.production[cur + 15 * 60 * 1000];
                    q3Production = quarterData.production[cur + 30 * 60 * 1000];
                    q4Production = quarterData.production[cur + 45 * 60 * 1000];
                    consumption = (q1Usage + q2Usage + q3Usage + q4Usage);
                    production = (q1Production + q2Production + q3Production + q4Production);
                    priceConsumption = consumption * consumptionUnitPrice;
                    priceProduction = production * productionUnitPrice;
                    price = priceConsumption - priceProduction;
                    totalPrice += price;
                    totalConsumption += consumption;
                    totalProduction += production;
                    if (historicalData[cur] < 0) {
                        totalPriceWhenNegative += price;
                        totalConsumptionWhenNegative += consumption;
                        totalProductionWhenNegative += production;
                    }
                    else {
                        totalPriceWhenPositive += price;
                        totalConsumptionWhenPositive += consumption;
                        totalProductionWhenPositive += production;
                    }
                }
                cur += 3600 * 1000;
            }
            document.querySelector("#results").innerHTML = "<hr/>\n      <h4>These are the totals for the full period given</h4>\n      <div>Total cost: " + totalPrice.toFixed(2) + "\u20AC</div>\n      <div>Total consumption: " + totalConsumption.toFixed(2) + "kwh</div>\n      <div>Total production: " + totalProduction.toFixed(2) + "kwh</div>\n      <br/> \n      <h4>These are the totals for the full period given when the BELPEX price was positive</h4>\n      <div>Total cost: " + totalPriceWhenPositive.toFixed(2) + "\u20AC</div>\n      <div>Total consumption: " + totalConsumptionWhenPositive.toFixed(2) + "kwh</div>\n      <div>Total production: " + totalProductionWhenPositive.toFixed(2) + "kwh</div>\n      <br/> \n      <h4>And similarly when the BELPEX price was negative</h4>\n      <div>Total cost: " + totalPriceWhenNegative.toFixed(2) + "\u20AC</div>\n      <div>Total consumption: " + totalConsumptionWhenNegative.toFixed(2) + "kwh</div>\n      <div>Total production: " + totalProductionWhenNegative.toFixed(2) + "kwh</div>        \n      <br/>\n      <div id=\"historicalDataChart\"></div>\n      <br/>\n      <div id=\"quarterDataChart\"></div>\n      <br/>\n      <div id=\"historicalDataAveragePerDayChart\"></div>\n      <br/>\n      <div id=\"quarterDataConsumptionAveragePerDayChart\"></div>\n      <br/>\n      <div id=\"quarterDataProductionAveragePerDayChart\"></div>\n    ";
            loadHistoricDataChart(historicalData, from, to);
            loadConsumptionProductionChart(quarterData, from, to);
            loadHistoricalAveragePerDayDataChart(historicalData, from, to);
            loadConsumptionAveragePerDayDataChart(quarterData, from, to);
            loadProductionAveragePerDayDataChart(quarterData, from, to);
            return [2 /*return*/];
        });
    });
}
function loadConsumptionProductionChart(quarterData, from, to) {
    var seriesProductionData = [];
    var seriesConsumptionData = [];
    var cur = from.getTime();
    while (cur < to.getTime()) {
        var skip = false;
        if (typeof quarterData.usage[cur] === "undefined") {
            console.error("No usage quarter data for " + new Date(cur));
            skip = true;
            seriesConsumptionData.push(null);
        }
        else {
            seriesConsumptionData.push(quarterData.usage[cur]);
        }
        if (typeof quarterData.production[cur] === "undefined") {
            console.error("No production quarter data for " + new Date(cur));
            skip = true;
            seriesProductionData.push(null);
        }
        else {
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
function loadHistoricDataChart(historicalData, from, to) {
    var seriesData = [];
    var cur = from.getTime();
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
function loadHistoricalAveragePerDayDataChart(historicalData, from, to) {
    var data = {};
    var cur = from.getTime();
    while (cur < to.getTime()) {
        var month = new Date(cur).getMonth();
        if (typeof data[month] === "undefined") {
            data[month] = {
                "sum": [],
                "count": []
            };
            for (var i = 0; i < 24; i++) {
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
            var month = new Date(cur).getMonth();
            data[month].sum[new Date(cur).getHours()] += historicalData[cur];
            data[month].count[new Date(cur).getHours()]++;
        }
        cur += 3600 * 1000;
    }
    var seriesData = [];
    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
        var m = _a[_i];
        var monthData = [];
        for (var i = 0; i < 24; i++) {
            monthData.push(Math.round(data[m].sum[i] / data[m].count[i] * 100) / 100);
        }
        seriesData.push({
            name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][m],
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
function loadConsumptionAveragePerDayDataChart(quarterData, from, to) {
    var data = {};
    var cur = from.getTime();
    while (cur < to.getTime()) {
        var month = new Date(cur).getMonth();
        if (typeof data[month] === "undefined") {
            data[month] = {
                "sum": [],
                "count": []
            };
            for (var i = 0; i < 24 * 4; i++) {
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
            var month = new Date(cur).getMonth();
            var idx = new Date(cur).getHours() * 4 + Math.floor(new Date(cur).getMinutes() / 15);
            data[month].sum[idx] += quarterData.usage[cur];
            data[month].count[idx]++;
        }
        cur += 900 * 1000;
    }
    var seriesData = [];
    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
        var m = _a[_i];
        var monthData = [];
        for (var i = 0; i < 24 * 4; i++) {
            monthData.push(Math.round(data[m].sum[i] / data[m].count[i] * 100) / 100);
        }
        seriesData.push({
            name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][m],
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
function loadProductionAveragePerDayDataChart(quarterData, from, to) {
    var data = {};
    var cur = from.getTime();
    while (cur < to.getTime()) {
        var month = new Date(cur).getMonth();
        if (typeof data[month] === "undefined") {
            data[month] = {
                "sum": [],
                "count": []
            };
            for (var i = 0; i < 24 * 4; i++) {
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
            var month = new Date(cur).getMonth();
            var idx = new Date(cur).getHours() * 4 + Math.floor(new Date(cur).getMinutes() / 15);
            data[month].sum[idx] += quarterData.production[cur];
            data[month].count[idx]++;
        }
        cur += 900 * 1000;
    }
    var seriesData = [];
    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
        var m = _a[_i];
        var monthData = [];
        for (var i = 0; i < 24 * 4; i++) {
            monthData.push(Math.round(data[m].sum[i] / data[m].count[i] * 100) / 100);
        }
        seriesData.push({
            name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"][m],
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
//# sourceMappingURL=main.js.map