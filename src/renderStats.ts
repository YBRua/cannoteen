interface MetaStat {
  id: number;
  name: string;
  total: number;
  available: number;
  occupied: number;
}

function initName2AbbrMapping() {
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
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "哈",
    "玉",
  ];

  const name2Abbr = new Map<string, string>();
  for (let id = 0; id < names.length; ++id) {
    name2Abbr.set(names[id], abbrs[id]);
  }

  return name2Abbr;
}

function parseMetaStat(input: any): MetaStat {
  let res = {} as MetaStat;
  res.id = input["Id"];
  res.name = input["Name"];
  res.total = input["Seat_s"];
  res.available = input["Seat_r"];
  res.occupied = input["Seat_u"];

  return res;
}

const CANTEEN_URL = "https://canteen.sjtu.edu.cn/CARD/Ajax/Place";

const name2abbr = initName2AbbrMapping();
const metaStats: Array<MetaStat> = [];

let selectedId = 0;
let selectedMeta: MetaStat;

function canteenSelectorOnClickGenerator(metaId: number, elId: string) {
  elId = "#" + elId;
  return function () {
    const currentSelected = document.querySelector<HTMLButtonElement>(
      `#canteen-selector-${selectedMeta.id}`
    )!;

    currentSelected.classList.remove("btn-canteen-selected");

    const newSelected = document.querySelector<HTMLButtonElement>(elId)!;
    newSelected.classList.add("btn-canteen-selected");

    selectedId = metaId;
    selectedMeta = metaStats[metaId];
  };
}

await fetch(CANTEEN_URL)
  .then((res) => res.json())
  .then(function (results) {
    for (const res of results) {
      let resObj = parseMetaStat(res);
      if (!resObj.name.includes("闵行")) {
        continue;
      }
      metaStats.push(resObj);
    }
    console.log("Fetched meta data.");
    metaStats.sort((a, b) => a.id - b.id);
  });

const canteenSelector =
  document.querySelector<HTMLDivElement>("#canteen-selector")!;

console.log("Entering For Loop");
for (let i = 0; i < metaStats.length; ++i) {
  const metaStat = metaStats[i];

  const abbr = name2abbr.get(metaStat.name)!;
  const canteenBtn = document.createElement("button");
  console.log(`Created ${abbr}`);
  canteenBtn.classList.add("btn-canteen");
  canteenBtn.id = `canteen-selector-${metaStat.id}`;
  if (i == selectedId) {
    canteenBtn.classList.add("btn-canteen-selected");
    selectedMeta = metaStat;
  }
  canteenBtn.innerText = abbr;
  canteenBtn.onclick = canteenSelectorOnClickGenerator(i, canteenBtn.id);
  canteenSelector.appendChild(canteenBtn);
}

export {};
