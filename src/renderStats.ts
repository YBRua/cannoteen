import * as echarts from "echarts";

interface CanteenStat {
  id: number;
  name: string;
  total: number;
  available: number;
  occupied: number;
}

function _initName2AbbrMapping() {
  const names: Array<string> = [
    "闵行第一餐厅",
    "闵行第二餐厅",
    "闵行第三餐厅",
    "闵行第四餐厅",
    "闵行第五餐厅",
    "闵行第六餐厅",
    "闵行第七餐厅",
    "闵行哈乐餐厅",
    "闵行玉兰苑",
  ];
  const abbrs: Array<string> = [
    "壹",
    "贰",
    "叁",
    "肆",
    "伍",
    "陆",
    "柒",
    "哈",
    "玉",
  ];

  const name2Abbr = new Map<string, string>();
  for (let id = 0; id < names.length; ++id) {
    name2Abbr.set(names[id], abbrs[id]);
  }

  return name2Abbr;
}

function _parseMetaStat(input: any): CanteenStat {
  let res = {} as CanteenStat;
  res.id = input["Id"];
  res.name = input["Name"];
  res.total = input["Seat_s"];
  res.available = input["Seat_r"];
  res.occupied = input["Seat_u"];

  return res;
}

const CANTEEN_URL = "https://canteen.sjtu.edu.cn/CARD/Ajax/Place";
const DETAIL_URL = "https://canteen.sjtu.edu.cn/CARD/Ajax/PlaceDetails/";

const name2abbr = _initName2AbbrMapping();
const metaStats: Array<CanteenStat> = [];

let selectedId = 0;
let selectedMeta: CanteenStat;

function _canteenSelectorOnClickGenerator(metaId: number, elId: string) {
  elId = "#" + elId;
  return async function () {
    const currentSelected = document.querySelector<HTMLButtonElement>(
      `#canteen-selector-${selectedMeta.id}`
    )!;

    currentSelected.classList.remove("btn-canteen-selected");

    const newSelected = document.querySelector<HTMLButtonElement>(elId)!;
    newSelected.classList.add("btn-canteen-selected");

    selectedId = metaId;
    selectedMeta = metaStats[metaId];
    await _renderCanteenDetails(metaId);
  };
}

async function _renderCanteenSelectors() {
  const canteenSelector =
    document.querySelector<HTMLDivElement>("#canteen-selector")!;

  for (let i = 0; i < metaStats.length; ++i) {
    const metaStat = metaStats[i];

    const abbr = name2abbr.get(metaStat.name)!;

    const canteenBtn = document.createElement("li");
    console.log(`Created ${abbr}`);
    canteenBtn.classList.add("btn-canteen");
    canteenBtn.id = `canteen-selector-${metaStat.id}`;

    if (i == selectedId) {
      canteenBtn.classList.add("btn-canteen-selected");
      selectedMeta = metaStat;
    }

    canteenBtn.innerText = abbr;
    canteenBtn.onclick = _canteenSelectorOnClickGenerator(i, canteenBtn.id);
    canteenSelector.appendChild(canteenBtn);
  }

  canteenSelector.classList.remove("conceal");
  await _renderCanteenDetails(selectedId);
}

function _getPieColor(value: number): string {
  if (value < 60) {
    return "#4ade80"; // green-400
  }
  if (value < 85) {
    return "#facc15"; // yellow-400
  }
  return "#f87171"; // red-400
}

function _createCanvas() {
  const canvas = document.createElement("div");
  canvas.id = "occupation-rate-canvas";

  return canvas;
}

function _createDetailCardStats(result: CanteenStat) {
  const detailCardContainer = document.createElement("div");
  detailCardContainer.id = "detail-card-container";

  const statContainer = document.createElement("div");
  statContainer.id = "stat-container";

  const subcanteenName = document.createElement("h3");
  subcanteenName.id = "subcanteen-name";
  subcanteenName.innerHTML = result.name;

  statContainer.appendChild(subcanteenName);

  for (const statKey of ["stat-empty", "stat-occupied"]) {
    const statEntry = document.createElement("div");
    statEntry.id = statKey;

    const statDesc = document.createElement("h4");
    statDesc.id = "stat-desc";
    const statNum = document.createElement("span");
    statNum.id = "stat-num";

    if (statKey == "stat-empty") {
      statDesc.innerHTML = "空";
      statNum.innerHTML =
        result.available < 0 ? "0" : result.available.toString();
    } else {
      statDesc.innerHTML = "占";
      statNum.innerHTML =
        result.occupied > result.total
          ? result.total.toString()
          : result.occupied.toString();
    }
    statEntry.appendChild(statDesc);
    statEntry.appendChild(statNum);
    statContainer.appendChild(statEntry);
  }
  detailCardContainer.appendChild(statContainer);

  return detailCardContainer;
}

function _renderCanvas(canvas: HTMLDivElement, result: CanteenStat) {
  const chart = echarts.init(canvas);
  console.log(result.name);

  let occupationRate = (result.occupied / result.total) * 100;
  occupationRate = occupationRate > 100 ? 100 : occupationRate;

  let pieColor = _getPieColor(occupationRate);

  let option: echarts.EChartsOption = {
    color: [pieColor, "#fff"],
    series: [
      {
        name: result.name,
        type: "pie",
        radius: ["50%", "80%"],
        itemStyle: {
          borderRadius: 5,
          borderColor: "#fff",
          borderWidth: 1,
        },
        avoidLabelOverlap: false,
        labelLine: {
          show: false,
        },
        label: {
          show: true,
          position: "center",
          fontSize: window.innerWidth > 768 ? 24 : 16,
          fontFamily: "Georgia",
          formatter: () => {
            return occupationRate.toFixed(0);
          },
        },
        data: [{ value: result.occupied }, { value: result.available }],
      },
    ],
  };
  option && chart.setOption(option);
}

function _createDetailCard(result: CanteenStat) {
  const detailCard = document.createElement("div");
  detailCard.id = "detail-card";
  const detailCardContainer = _createDetailCardStats(result);
  const canvas = _createCanvas();

  detailCard.appendChild(detailCardContainer);
  detailCard.appendChild(canvas);

  return { canvas: canvas, detailCard: detailCard };
}

async function _renderCanteenDetails(metaId: number) {
  const metaStat = metaStats[metaId];
  await fetch(DETAIL_URL + metaStat.id)
    .then((res) => res.json())
    .then(function (results) {
      const details: Array<CanteenStat> = [];
      for (const result of results) {
        details.push(_parseMetaStat(result));
      }
      details.sort((a, b) => a.id - b.id);

      const detailCardContainer = document.getElementById(
        "canteen-detail-container"
      )!;
      detailCardContainer.innerHTML = "";
      for (const detail of details) {
        const { canvas: canvas, detailCard: detailCard } =
          _createDetailCard(detail);
        detailCardContainer.append(detailCard);

        _renderCanvas(canvas, detail);
      }
    });
}

async function justRush() {
  await fetch(CANTEEN_URL)
    .then((res) => res.json())
    .then(function (results) {
      for (const res of results) {
        let resObj = _parseMetaStat(res);
        if (!resObj.name.includes("闵行")) {
          continue;
        }
        metaStats.push(resObj);
      }
      console.log("Fetched meta data.");
      metaStats.sort((a, b) => a.id - b.id);
    });

  await _renderCanteenSelectors();
}

justRush();
