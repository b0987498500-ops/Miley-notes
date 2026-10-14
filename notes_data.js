/**
 * 麥麥筆記 資料庫 (NOTES_DATA)
 * 忠實收錄由書本、講義或課堂精華提煉之重點筆記
 * 每頁筆記精煉控制於 500 字內（最高上限 700 字，題目不計入總字數）
 * 完整保留速查比較表格、繪圖插圖與即測即評題目
 */
const NOTES_DATA = [
  // ==========================================
  // 📐 數學科 (Mathematics) - 複習手帳 (第 3 冊)
  // ==========================================
  {
    id: "math-1",
    stage: "review",
    volume: "第 3 冊",
    stageName: "複習筆記本",
    subject: "math",
    subjectName: "數學",
    subjectIcon: "fa-calculator",
    gradeVersion: "八年級上（翰林版）",
    unit: "第 3 章 畢氏定理",
    title: "特殊直角三角形三邊長比（45°-45°-90° 與 30°-60°-90°）",
    concept: "45°-45°-90° 邊長比 1:1:√2 與 30°-60°-90° 邊長比 1:√3:2 特殊角直角三角形三邊比",
    coreConcepts: [
      "**45°-45°-90° 等腰直角三角形**：兩底角相等 $\\implies$ 兩股等長。依畢氏定理：$1^2 + 1^2 = 2 \\implies$ 邊長比為 $1 : 1 : \\sqrt{2}$。",
      "**30°-60°-90° 特殊直角三角形**：由正三角形切半而來。短股（$30^\\circ$ 對邊）: 長股（$60^\\circ$ 對邊）: 斜邊（$90^\\circ$ 對邊）$= 1 : \\sqrt{3} : 2$。"
    ],
    table: {
      headers: ["三角形類型", "內角度數", "三邊長比例 (短股 : 長股 : 斜邊)", "速算解題技巧"],
      rows: [
        ["等腰直角三角形", "45° - 45° - 90°", "1 : 1 : √2", "知股求斜乘 √2；知斜求股除 √2（例：股 5 ⇒ 斜 5√2）"],
        ["特殊直角三角形", "30° - 60° - 90°", "1 : √3 : 2", "30° 對邊為 a ⇒ 斜邊為 2a、高為 √3 a"]
      ]
    },
    image: "images/math/special_right_triangles_45_45_90.png",
    imageCaption: "45°-45°-90° 等腰直角三角形邊長比 1:1:√2 與實例（邊長 5 : 5 : 5√2）",
    mnemonic: "【45°-45°-90° 口訣】：一股、二股、根號二斜邊！<br>【30°-60°-90° 口訣】：三十對一，六十對根號三，九十對二！",
    quiz: [
      {
        question: "若一個等腰直角三角形的兩股長皆為 7 公分，請問其斜邊長為多少公分？",
        options: [
          { prefix: "A", text: "7√2 公分", correct: true, explanation: "太棒了！45°-45°-90° 邊長比為 1 : 1 : √2，已知股長為 7，斜邊即為 7 × √2 = 7√2 公分！" },
          { prefix: "B", text: "14 公分", correct: false, explanation: "注意：等腰直角三角形不是 1:1:2，斜邊是股長的 √2 倍，不是 2 倍！" },
          { prefix: "C", text: "7√3 公分", correct: false, explanation: "√3 是 30°-60°-90° 特殊三角形的長股比例喔！" },
          { prefix: "D", text: "49 公分", correct: false, explanation: "這是股長平方，不是斜邊長度！" }
        ]
      }
    ]
  },
  {
    id: "math-2",
    stage: "review",
    volume: "第 3 冊",
    stageName: "複習筆記本",
    subject: "math",
    subjectName: "數學",
    subjectIcon: "fa-square-root-variable",
    gradeVersion: "八年級上（翰林版）",
    unit: "第 3 章 畢氏定理",
    title: "正三角形的高與面積公式",
    concept: "正三角形邊長 a，高 h = (√3/2)a，面積 A = (√3/4)a²",
    coreConcepts: [
      "**高 ($h$) 公式**：$h = \\frac{\\sqrt{3}}{2} a$（利用畢氏定理：從頂點作垂線切成兩個 $30^\\circ-60^\\circ-90^\\circ$ 直角三角形，高為邊長的 $\\frac{\\sqrt{3}}{2}$ 倍）。",
      "**面積 ($A$) 公式**：$A = \\frac{\\sqrt{3}}{4} a^2$（由「底 $\\times$ 高 $\\div 2$」計算得出：$a \\times \\frac{\\sqrt{3}}{2}a \\div 2 = \\frac{\\sqrt{3}}{4} a^2$）。"
    ],
    table: {
      headers: ["幾何項目", "符號", "計算公式", "推導依據與幾何原理"],
      rows: [
        ["正三角形的高", "h", "h = (√3 / 2) a", "作垂線切成兩個 30°-60°-90° 直角三角形，高為邊長之 (√3 / 2) 倍"],
        ["正三角形面積", "A", "A = (√3 / 4) a²", "由「底 × 高 ÷ 2」計算：a × (√3 / 2) a ÷ 2 = (√3 / 4) a²"]
      ]
    },
    mnemonic: "【正三角形雙公式秒殺口訣】：高是「二分之根號三 a」，面積是「四分之根號三 a 平方」！",
    quiz: [
      {
        question: "已知一個正三角形的邊長為 6 公分，請問其面積為多少平方公分？",
        options: [
          { prefix: "A", text: "9√3 平方公分", correct: true, explanation: "答對了！正三角形面積公式為 (√3 / 4) a²。將 a = 6 代入得：(√3 / 4) × 36 = 9√3 平方公分！" },
          { prefix: "B", text: "3√3 平方公分", correct: false, explanation: "這是高 (h = (√3/2) × 6 = 3√3)，題目問的是面積喔！" },
          { prefix: "C", text: "18√3 平方公分", correct: false, explanation: "小心！面積公式是四分之根號三 a²，分母是 4 不是 2！" },
          { prefix: "D", text: "36 平方公分", correct: false, explanation: "正三角形面積不是邊長平方，記得乘以 (√3 / 4)！" }
        ]
      }
    ]
  },

  // ==========================================
  // 🔬 自然科 (Science) - 複習手帳 (第 1～4 冊)
  // ==========================================
  {
    id: "science-1",
    stage: "review",
    volume: "第 2 冊",
    stageName: "複習筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-seedling",
    gradeVersion: "七年級下（翰林版）",
    unit: "第 2 章 生物的分類與植物界",
    title: "植物界五大族群演化與構造特徵全比較",
    concept: "藻類、蘚苔、蕨類、裸子、被子植物演化樹與關鍵器官對決",
    coreConcepts: [
      "**角質層**：蘚苔植物開始演化出角質層防止水分蒸散；生活於水中的藻類無。",
      "**維管束**：蕨類植物首度演化出維管束與真根、莖、葉，植物體開始能向上長高。",
      "**花粉管與種子**：裸子與被子植物演化出花粉管輸送精細胞，受精**免水**。",
      "**花與果實**：被子植物獨具子房保護胚珠，受精後結成果實保護種子，為陸地最優勢族群。"
    ],
    table: {
      headers: ["構造 / 特徵", "藻類", "蘚苔植物", "蕨類植物", "裸子植物", "被子植物 (開花植物)"],
      rows: [
        ["細胞壁 / 葉綠體", "○", "○", "○", "○", "○"],
        ["角質層 (登陸)", "×", "○", "○", "○", "○"],
        ["維管束 (長高)", "×", "× (無真根莖葉)", "○ (首度演化出)", "○", "○"],
        ["繁殖器官", "孢子", "孢子", "孢子", "種子", "種子"],
        ["胚珠", "×", "×", "×", "○ (裸露無子房)", "○ (包於子房內)"],
        ["花 / 果實 / 子房", "× / × / ×", "× / × / ×", "× / × / ×", "× / × / ×", "○ / ○ / ○ (唯一開花結實)"],
        ["毬果", "×", "×", "×", "○ (專屬毬果)", "×"],
        ["花粉管 (受精免水)", "× (精子游水)", "× (精子游水)", "× (精子游水)", "○ (免水受精)", "○ (免水受精)"]
      ]
    },
    image: "images/science/plant_evolution_diagram.jpg",
    imageCaption: "植物界五大族群演化階梯與器官構造圖解",
    mnemonic: "【演化突破口訣】：蘚苔長角質，蕨類有血管；裸被通水管（花粉管），被子抱子房！<br>【秒殺金律】：有花、果實、子房必為被子；有毬果必為裸子！",
    quiz: [
      {
        question: "在野外發現一種綠色植物，具有維管束，以孢子繁殖，生活史中受精過程仍需要水分為媒介。請問此植物最可能屬於下列哪一類？",
        options: [
          { prefix: "A", text: "藻類", correct: false, explanation: "藻類生活在水中，尚未演化出維管束與真正的根、莖、葉。" },
          { prefix: "B", text: "蘚苔植物", correct: false, explanation: "蘚苔植物雖已登陸，但尚未演化出維管束，植株矮小無法長高。" },
          { prefix: "C", text: "蕨類植物", correct: true, explanation: "太厲害了！具有維管束（排除藻類、蘚苔），以孢子繁殖且受精需水（排除種子植物），故必定為「蕨類植物」！" },
          { prefix: "D", text: "裸子植物", correct: false, explanation: "裸子植物是以種子繁殖，具有花粉管受精免水！" }
        ]
      }
    ]
  },
  {
    id: "science-2",
    stage: "review",
    volume: "第 2 冊",
    stageName: "複習筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-leaf",
    gradeVersion: "七年級下（翰林版）",
    unit: "第 2 章 生物的分類與植物界",
    title: "被子植物（開花植物）雙子葉 vs. 單子葉大對決",
    concept: "雙子葉與單子葉植物子葉數、花瓣、葉脈、維管束、根系五大形態對照",
    coreConcepts: [
      "**雙子葉植物**：子葉 2 片、花瓣 4 或 5 的倍數、網狀脈、莖維管束**環狀排列**（有形成層能加粗）、**軸根系**（主根明顯）。",
      "**單子葉植物**：子葉 1 片、花瓣 3 的倍數、平行脈、莖維管束**散生排列**（無形成層不能加粗）、**鬚根系**（叢生細根）。"
    ],
    table: {
      headers: ["比較項目", "雙子葉植物", "單子葉植物", "常見植物範例"],
      rows: [
        ["子葉數目", "2 片", "1 片", "花生、大豆 / 玉米、水稻"],
        ["花瓣數目", "4 或 5 的倍數", "3 的倍數", "梅花 (5瓣) / 百合 (6瓣)"],
        ["葉脈型態", "網狀脈", "平行脈", "菩提、楓葉 / 竹、蔥、韭菜"],
        ["莖維管束", "環狀排列 (有形成層，能加粗)", "散生排列 (無形成層，不能加粗)", "多木本樹木 / 多草本竹稻"],
        ["根系型態", "軸根系 (有主根深扎)", "鬚根系 (叢生細根)", "拔蔥看根是一把鬚！"]
      ]
    },
    image: "images/science/dicot_vs_monocot_diagram.jpg",
    imageCaption: "雙子葉植物 vs. 單子葉植物形態特徵對照圖",
    mnemonic: "【單雙子葉秒殺口訣】：一葉三花平行脈，散生鬚根無層次；雙葉四五網狀脈，環狀軸根有層次！",
    quiz: [
      {
        question: "小麥在校園中撿到一片具有平行脈的落葉，請推測該植物的莖與根最可能具有下列何種特徵？",
        options: [
          { prefix: "A", text: "莖維管束散生排列，根為鬚根系", correct: true, explanation: "完全正確！平行脈為「單子葉植物」典型特徵，其莖維管束呈散生排列（無形成層不能加粗），根為鬚根系！" },
          { prefix: "B", text: "莖維管束環狀排列，根為軸根系", correct: false, explanation: "環狀排列與軸根系是雙子葉植物（網狀脈）的特徵！" },
          { prefix: "C", text: "莖具發達形成層能年年加粗", correct: false, explanation: "單子葉植物維管束散生無形成層，不能加粗！" },
          { prefix: "D", text: "種子具有兩片子葉", correct: false, explanation: "平行脈是單子葉植物，種子僅有 1 片子葉！" }
        ]
      }
    ]
  },
  {
    id: "science-3",
    stage: "review",
    volume: "第 2 冊",
    stageName: "複習筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-paw",
    gradeVersion: "七年級下（翰林版）",
    unit: "第 3 章 動物界的分類",
    title: "動物界 — 脊椎動物五大類比較表",
    concept: "魚類、兩生類、爬蟲類、鳥類、哺乳類五大族群體溫、呼吸、受精與生殖對決",
    coreConcepts: [
      "**體溫調節**：魚類、兩生類、爬蟲類為「外溫（變溫）動物」；鳥類、哺乳類為「內溫（定溫）動物」。",
      "**呼吸器官演化**：鰓（魚類、兩生幼體）$\\to$ 肺與皮膚（兩生成體）$\\to$ 肺（爬蟲、鳥、哺乳）；鳥類具氣囊輔助飛行。",
      "**受精與生殖**：魚與兩生多體外受精、卵生無卵殼；爬蟲、鳥、哺乳體內受精，具卵殼或胎生適應陸生環境。"
    ],
    table: {
      headers: ["比較項目", "魚類", "兩生類", "爬蟲類", "鳥類", "哺乳類"],
      rows: [
        ["呼吸構造", "鰓", "幼體鰓 / 成體肺與皮膚", "肺", "肺 (具氣囊)", "肺"],
        ["受精方式", "多數體外受精", "體外受精", "體內受精", "體內受精", "體內受精"],
        ["生殖方式", "卵生 (無卵殼)", "卵生 (無卵殼)", "卵生 (具革質卵殼)", "卵生 (具硬鈣質卵殼)", "多數胎生 (鴨嘴獸卵生)"],
        ["體溫調節", "外溫 (變溫)", "外溫 (變溫)", "外溫 (變溫)", "內溫 (定溫)", "內溫 (定溫)"],
        ["體表構造", "鱗片 / 黏液", "濕潤裸露皮膚", "乾燥鱗片或骨板", "羽毛", "毛髮"]
      ]
    },
    image: "images/science/vertebrates_classes_diagram.jpg",
    imageCaption: "脊椎動物五大類呼吸、體溫、受精與生殖演化圖解",
    mnemonic: "【五大類秒殺口訣】：外溫魚兩爬，內溫鳥哺乳；兩生皮膚輔呼吸，羊膜卵殼登陸齊！",
    quiz: [
      {
        question: "下列有關脊椎動物五大類群特徵的敘述，何者完全正確？",
        options: [
          { prefix: "A", text: "爬蟲類、鳥類與哺乳類皆為體內受精，並具有防止水分散失的卵殼或胎生構造", correct: true, explanation: "答對了！爬蟲、鳥、哺乳演化出體內受精與羊膜卵/胎生，成功擺脫對水域繁衍的依賴！" },
          { prefix: "B", text: "兩生類成體已完全適應陸生乾燥環境，繁殖受精不需水分", correct: false, explanation: "兩生類皮膚裸露易散失水分，且體外受精卵無殼，繁殖仍必須依賴水！" },
          { prefix: "C", text: "魚類與爬蟲類皆為內溫（定溫）動物", correct: false, explanation: "魚類、兩生類、爬蟲類皆為「外溫（變溫）動物」！" },
          { prefix: "D", text: "鳥類與哺乳類皆為卵生且體表覆蓋鱗片", correct: false, explanation: "鳥類覆蓋羽毛，哺乳類多胎生且覆蓋毛髮！" }
        ]
      }
    ]
  },
  {
    id: "science-4",
    stage: "review",
    volume: "第 2 冊",
    stageName: "複習筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-tree",
    gradeVersion: "七年級下（翰林版）",
    unit: "第 2 章 生物的分類與植物界",
    title: "裸子植物核心代表 — 蘇鐵（鐵樹）特徵全剖析",
    concept: "蘇鐵羽狀複葉、毬果生殖、胚珠種子裸露不具子房、花粉管受精免水",
    coreConcepts: [
      "**分類定位**：蘇鐵（鐵樹）屬於**裸子植物**、種子植物、維管束植物，不是蕨類，亦非被子植物。",
      "**生殖器官**：**不開真正的花**！生殖器官為「毬果（孢子葉球）」，雌雄異株，風力傳粉。",
      "**胚珠種子裸露**：胚珠直接著生於苞片邊緣，完全裸露在外，**沒有子房構造，絕不結出果實**。",
      "**花粉管受精**：具有花粉管輸送精細胞，受精過程**完全不需要水為媒介**。"
    ],
    table: {
      headers: ["比較項目", "蘇鐵（裸子植物代表）", "被子植物（開花植物）", "考試秒殺關鍵判斷"],
      rows: [
        ["維管束 (木質部/韌皮部)", "○", "○", "兩者皆具維管束，能向上直立長高"],
        ["花粉管 (受精免水)", "○", "○", "兩者精細胞皆由花粉管輸送，免水受精"],
        ["生殖器官", "毬果 (孢子葉球)", "花", "看到「毬果」秒選裸子植物！"],
        ["胚珠位置", "裸露在外 (無子房)", "包於子房內", "裸子植物因無子房，故絕無果實！"],
        ["果實構造", "× (無果實)", "○ (果實保護種子)", "蘇鐵紅色的不是果實，是裸露種子！"],
        ["繁殖方式", "種子 (種子裸露)", "種子 (種子在果實內)", "兩者皆為「種子植物」"],
        ["常見家族代表", "蘇鐵、二葉松、紅檜、側柏、銀杏", "百合、梅花、向日葵、水稻", "口訣「蘇鐵松杉柏銀杏」一秒記！"]
      ]
    },
    image: "images/science/cycad_gymnosperm_diagram.png",
    imageCaption: "蘇鐵（裸子植物）羽狀複葉、毬果、裸露種子與花粉管特徵圖解",
    mnemonic: "【蘇鐵秒殺密碼】：「蘇鐵松杉柏銀杏，毬果裸露不結果；羽葉雖似蕨與棕，通水免水管中游！」",
    quiz: [
      {
        question: "俗話說「鐵樹開花」比喻極為罕見。就現代生物分類觀點來看，下列敘述何者最精確？",
        options: [
          { prefix: "A", text: "蘇鐵屬於裸子植物，俗稱的開花其實是長出毬果（孢子葉球），並非被子植物的花", correct: true, explanation: "完全正確！蘇鐵為裸子植物，其生殖構造為毬果（孢子葉球），胚珠直接裸生於苞片上無子房包覆，在生物學上沒有花！" },
          { prefix: "B", text: "蘇鐵秋天結出紅色肉質的果實，藉由鳥類取食傳播種子", correct: false, explanation: "蘇鐵無子房，絕無果實！紅色肉質顆粒是裸露的種子（肉質外種皮）！" },
          { prefix: "C", text: "蘇鐵具有大型羽狀複葉，以孢子囊群繁殖，屬於蕨類植物", correct: false, explanation: "蘇鐵具種子與毬果，屬於種子植物，不是蕨類！" },
          { prefix: "D", text: "蘇鐵精卵結合時仍需要雨水為媒介才能完成受精", correct: false, explanation: "裸子植物具花粉管輸送精細胞，受精完全不需要水！" }
        ]
      }
    ]
  },
  {
    id: "science-5",
    stage: "progress",
    volume: "第 5 冊",
    stageName: "進度筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-gem",
    gradeVersion: "九年級上（翰林版）",
    unit: "第 2 章 地球的歷史與岩石",
    title: "原岩經變質作用形成變質岩與用途對照表",
    concept: "沉積岩與火成岩經高溫高壓變質後形成的變質岩種類及其生活應用用途",
    coreConcepts: [
      "**原岩經變質**：沉積岩或火成岩在高溫高壓環境下重新結晶，形成新變質岩。",
      "**常見對照**：砂岩 $\\to$ 石英岩；頁岩 $\\to$ 板岩與片岩；石灰岩 $\\to$ 大理岩；花崗岩 $\\to$ 片麻岩。"
    ],
    table: {
      headers: ["原岩類別", "原岩", "經變質作用形成變質岩", "用途"],
      rows: [
        ["沉積岩", "砂岩", "石英岩", "玻璃原料、建築飾材"],
        ["沉積岩", "頁岩", "板岩與片岩", "冬暖夏涼的石板屋"],
        ["沉積岩", "石灰岩", "大理岩", "藝術石雕、建築飾材"],
        ["火成岩", "花崗岩", "片麻岩", "堅硬鋪路石、建築基石"]
      ]
    },
    mnemonic: "【變質岩秒殺口訣】：砂變石英頁面板，石灰大理花片麻；高溫高壓葉理出！",
    quiz: [
      {
        question: "台灣東部著名的太魯閣峽谷壯麗雄偉，其岩壁主要由石灰岩經高溫高壓變質而形成。請問此種變質岩名稱為何？",
        options: [
          { prefix: "A", text: "大理岩", correct: true, explanation: "完全正確！石灰岩（沉積岩）經高溫高壓變質後形成「大理岩」，質地堅硬、紋理優美！" },
          { prefix: "B", text: "板岩", correct: false, explanation: "板岩是由頁岩變質而來的！" },
          { prefix: "C", text: "石英岩", correct: false, explanation: "石英岩是由砂岩變質而來的！" },
          { prefix: "D", text: "片麻岩", correct: false, explanation: "片麻岩是由花崗岩變質而來的！" }
        ]
      }
    ]
  },
  {
    id: "science-6",
    stage: "review",
    volume: "第 4 冊",
    stageName: "複習筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-mountain",
    gradeVersion: "八年級下（翰林版）",
    unit: "第 4 章 地層與地表地質",
    title: "地表三大岩石分類全攻略（沉積岩、火成岩、變質岩）",
    concept: "沉積岩、火成岩、變質岩三大岩石成因、構造特徵、化石有無與代表岩石",
    coreConcepts: [
      "**沉積岩**：地表最常見，具層理，是唯一**能保存化石**的岩石（石灰岩、砂岩、頁岩）。",
      "**火成岩**：岩漿冷卻形成。地表噴發冷卻快結晶細（安山岩、玄武岩）；地下深處冷卻慢結晶粗（花崗岩）。",
      "**變質岩**：地下高溫高壓下再結晶，常具葉理（片麻岩、大理岩、板岩）。"
    ],
    table: {
      headers: ["岩石類別", "形成方式與成因", "外觀構造關鍵", "常見代表岩石", "有無化石可能"],
      rows: [
        ["沉積岩", "沉積物堆積經壓密、膠結", "層理構造、顆粒分明", "石灰岩、砂岩、頁岩、礫岩", "○ 唯一可能含化石！"],
        ["火成岩", "地底岩漿或地表熔岩冷卻結晶", "塊狀構造、結晶顆粒", "花崗岩 (深成) / 玄武岩、安山岩 (噴出)", "× 熔融高溫化石已燒毀"],
        ["變質岩", "地下深處經高溫高壓變質", "葉理構造、礦物重新排列", "片麻岩、大理岩、板岩、片岩", "× 絕大多數化石已變形破壞"]
      ]
    },
    mnemonic: "【三大岩石秒殺口訣】：有層有化石選沉積；火山岩漿選火成；高溫高壓葉理變質！",
    quiz: [
      {
        question: "地質學家在野外地層中採集到三葉蟲化石，請問該地層最可能由下列哪一種岩石構成？",
        options: [
          { prefix: "A", text: "沉積岩（如頁岩、砂岩、石灰岩）", correct: true, explanation: "答對了！只有沉積物緩慢堆積掩埋才能保存古生物遺骸，因此「沉積岩」是唯一可能含有化石的岩石！" },
          { prefix: "B", text: "火成岩（如花崗岩、玄武岩）", correct: false, explanation: "火成岩由高溫岩漿熔融冷卻形成，古生物化石早已被高溫熔毀！" },
          { prefix: "C", text: "變質岩（如片麻岩）", correct: false, explanation: "變質岩經歷地下高溫高壓作用，原有化石大多變形破壞消失！" },
          { prefix: "D", text: "岩漿岩", correct: false, explanation: "岩漿岩即火成岩，無法保存化石！" }
        ]
      }
    ]
  },
  {
    id: "science-7",
    stage: "review",
    volume: "第 2 冊",
    stageName: "複習筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-leaf",
    gradeVersion: "七年級下（翰林版）",
    unit: "第 5 章 生態系",
    title: "食物鏈中的「能量流動」vs.「生物累積（生物放大作用）」",
    concept: "較高級的消費者累積的毒素濃度會越高；較高級的消費者獲得的能量會越少",
    coreConcepts: [
      "**毒素累積（生物放大作用）**：較高級的消費者累積的毒素濃度會越高（脂溶性重金屬、DDT 等不易代謝的毒素，隨食物鏈逐級濃縮）。",
      "**能量傳遞（能量流動）**：較高級的消費者獲得的能量會越少（各階層能量約僅 10% 能傳遞至下一階，其餘 90% 以熱能散失）。"
    ],
    table: {
      headers: ["營養階層 (由下至上)", "生態角色範例", "累積毒素濃度 (生物放大)", "獲得能量多寡 (能量流動)", "總生物量金字塔"],
      rows: [
        ["生產者", "綠色植物、浮游藻類", "最低", "最多 (100% 原始太陽能)", "最大 (金字塔底部)"],
        ["初級消費者", "草食動物 (如磷蝦、昆蟲、牛羊)", "較低", "次多 (約 10%)", "次大"],
        ["次級消費者", "小型肉食動物 (如小魚、青蛙)", "較高", "較少 (約 1%)", "較小"],
        ["最高級消費者", "頂級掠食者 (如老鷹、虎鯨、人類)", "最高 ★ (極度濃縮)", "最少 ★ (約 0.1% 或更低)", "最小 (金字塔頂端)"],
        ["規律總結", "沿食物鏈階層由低到高", "越高級 ➡ 毒素濃度越高", "越高級 ➡ 獲得能量越少", "越高級 ➡ 總生物量越少"]
      ]
    },
    mnemonic: "【能量與毒素雙向秒殺口訣】：能量往上越少，毒素往上越高！",
    quiz: [
      {
        question: "在某重金屬污染的水域中有一食物鏈：矽藻 → 劍水蚤 → 小魚 → 大魚 → 魚鷹。請問下列何者體內累積的重金屬濃度最高？且哪一生物所獲得的總能量最少？",
        options: [
          { prefix: "A", text: "魚鷹累積重金屬濃度最高；魚鷹獲得的總能量最少", correct: true, explanation: "太棒了！依據生物放大作用與能量流動定律：較高級的消費者累積的毒素濃度越高，獲得的能量越少。魚鷹為頂級消費者，兩者皆為魚鷹！" },
          { prefix: "B", text: "矽藻累積重金屬濃度最高；魚鷹獲得的總能量最少", correct: false, explanation: "矽藻是生產者，體內累積的毒素濃度最低！" },
          { prefix: "C", text: "魚鷹累積重金屬濃度最高；矽藻獲得的總能量最少", correct: false, explanation: "矽藻固定光能，獲得的總能量最多！" },
          { prefix: "D", text: "矽藻累積重金屬濃度最低；矽藻獲得的總能量最多", correct: false, explanation: "雖然敘述本身符合事實，但題目問的是哪一生物獲得能量最少（應為魚鷹）！" }
        ]
      }
    ]
  },
  {
    id: "science-8",
    stage: "review",
    volume: "第 2 冊",
    stageName: "複習筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-frog",
    gradeVersion: "七年級下（翰林版）",
    unit: "第 5 章 生態系",
    title: "族群與群集（定義、三大要素與夢幻湖實例）",
    concept: "族群：同一時間、特定地域自然棲地、同物種；群集：同一時期、相同棲地、多於一個族群",
    coreConcepts: [
      "**族群 (Population)**：同一時間、由特定地域**同物種**的個體組成的群體。通常以**自然棲地**當成區分單位，而不是以人為劃界為單位。",
      "**群集 (Community)**：在同一時期、相同棲地上，**多於一個族群**結合而成群集（即生活在該棲地的所有生物個體總和）。",
      "**原稿實例**：2009 年陽明山夢幻湖的面天樹蛙 ＋ 山紅頭 ＋ 臺灣水韭 ＝ **夢幻湖群集**。"
    ],
    table: {
      headers: ["比較項目", "族群 (Population)", "群集 (Community)"],
      rows: [
        ["時間條件", "同一時間", "同一時期"],
        ["空間範圍", "特定地域（以自然棲地為單位，非人為劃界）", "相同棲地"],
        ["物種組成", "同物種（單一物種個體群體）", "多於一個族群（生活於該地所有生物總和）"],
        ["代表實例", "夢幻湖的面天樹蛙族群、夢幻湖的臺灣水韭族群", "2009 年夢幻湖的面天樹蛙＋山紅頭＋臺灣水韭＝夢幻湖群集"],
        ["考試陷阱", "❌ 池塘裡的所有魚（包含多種魚，非同物種）", "❌ 夢幻湖群集＋湖水土壤（加上無生物環境是生態系）"]
      ]
    },
    image: "images/science/population_and_community.png",
    imageCaption: "族群與群集教學重點投影片（含夢幻湖實例與「韭」字手寫標記）",
    mnemonic: "【族群三要素口訣】：同時、同地、同物種，自然棲地非人為！<br>特別注意：臺灣水「韭」（ㄐㄧㄡˇ），為特有種珍稀水生蕨類！",
    quiz: [
      {
        question: "下列關於「族群」與「群集」的敘述，何者完全正確？",
        options: [
          { prefix: "A", text: "陽明山夢幻湖中的面天樹蛙、山紅頭與臺灣水韭共同生活於同一棲地，屬於夢幻湖群集", correct: true, explanation: "答對了！群集是指同一時期、同一棲地上所有生活在一起的不同生物族群總和！" },
          { prefix: "B", text: "台北市的麻雀與新北市的麻雀因行政區劃分不同，屬於兩個不同族群", correct: false, explanation: "族群以「自然棲地」而非「人為行政劃界」為單位，麻雀可自由飛越邊界，屬同一族群！" },
          { prefix: "C", text: "學校花圃裡所有的開花植物構成一個族群", correct: false, explanation: "花圃裡有多種不同植物，非單一物種，不能稱為單一族群！" },
          { prefix: "D", text: "群集加上陽光、空氣與水環境後稱為生物圈", correct: false, explanation: "群集加上無生物環境稱為「生態系 (Ecosystem)」！" }
        ]
      }
    ]
  },
  {
    id: "science-9",
    stage: "review",
    volume: "第 2 冊",
    stageName: "複習筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-calculator",
    gradeVersion: "七年級下（翰林版）",
    unit: "第 5 章 生態系",
    title: "族群個體數調查三大法（樣區法、捉放法、直接計數法）",
    concept: "樣區法（不動植物/隨機取樣）、捉放法（移動動物/標記比例）、直接計數法（小範圍/瀕危）",
    coreConcepts: [
      "**樣區法**：將大樣區劃分為若干面積相同的小樣區，**隨機選取**數個小樣區計算平均值，依比例推估大樣區族群個體數（適合大區域、難以直接計數的植物或不動生物）。",
      "**捉放法**：先捕獲並標記部分個體後放回，經充分混勻後再捕獲，依標記比例回推總數（適合不易直接計數且**會移動的動物**）。",
      "**直接計數法**：直接清點全部個體數（適合分布於小區域且不會快速移動或極稀少瀕危生物）。"
    ],
    table: {
      headers: ["調查方法", "適用對象與特徵", "調查原理與作法", "經典實例"],
      rows: [
        ["樣區法", "難以直接計數、分布大區域（固定不動或移動緩慢）", "劃分等大樣區，隨機抽樣計算平均值後依比例推估", "草原蒲公英、岩礁藤壺、神木樹木"],
        ["捉放法", "不易直接計數且會移動的動物", "初次捕捉標記後釋回，充分混合後二次捕捉，依標記比例回推", "池塘魚類、森林野兔、鳥類"],
        ["直接計數法", "分布於較小區域且不會快速移動（或極度瀕危）", "逐一清點全部數量，最準確但最費時", "教室學生、夢幻湖殘存的臺灣水韭"]
      ]
    },
    image: "images/science/population_sampling_methods.png",
    imageCaption: "樣區法、捉放法與直接計數法調查原理與適用生物",
    mnemonic: "【捉放法偏大偏小黃金心法】：看二次標記數 m（分母）！m 變少 ⇒ 估計值 N 偏大（標記脫落、被天敵吃）；m 變多 ⇒ 估計值 N 偏小（未混勻原地抓、動物貪吃常被捕）！",
    quiz: [
      {
        question: "小麥調查池塘中的吳郭魚數量，第一次捕捉 40 隻並在其魚鰭做記號後放回。一週後再隨機捕獲 50 隻，發現其中有 5 隻帶有標記。若調查期間標記有部分脫落，請問此估算出來的魚群數量與實際數量相比會如何？",
        options: [
          { prefix: "A", text: "估計值約為 400 隻，且因標記脫落會導致估計值偏大", correct: true, explanation: "太厲害了！公式 N = 40 × 50 ÷ 5 = 400 隻；若標記脫落，第二次抓到的標記數變少（分母變小），回推的估計值會比實際值偏大！" },
          { prefix: "B", text: "估計值約為 400 隻，且因標記脫落會導致估計值偏小", correct: false, explanation: "標記脫落會使有標記個體變少，分母變小，估計值會偏大而非偏小！" },
          { prefix: "C", text: "估計值約為 200 隻，估計值不受影響", correct: false, explanation: "計算錯誤，交叉相乘 40 × 50 ÷ 5 = 400 隻！" },
          { prefix: "D", text: "估計值約為 500 隻，且因標記脫落會導致估計值偏小", correct: false, explanation: "計算與偏大偏小判斷皆不正確！" }
        ]
      }
    ]
  },
  {
    id: "science-10",
    stage: "review",
    volume: "第 2 冊",
    stageName: "複習筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-handshake",
    gradeVersion: "七年級下（翰林版）",
    unit: "第 5 章 生態系",
    title: "生物間的交互作用全攻略（共生、競爭、捕食、寄生）",
    concept: "互利共生(+/+)、片利共生(+/○)、競爭(-/-)、捕食(+/-)、寄生(+/-)、片害共生(-/○)",
    coreConcepts: [
      "**互利共生 (+/+)**：彼此皆得到好處（螞蟻和蚜蟲、小丑魚和海葵）。",
      "**片利共生 (+/○)**：對一方有益，對另一方無影響（鳥巢蕨依附樹幹）。",
      "**競爭 (-/-)**：雙方都受損，為爭奪資源相互排擠（牛、羊、馬爭草）。",
      "**捕食 (+/-)**：捕食者族群變大、被捕食者族群變小，獵物迅速致死（蛇吃青蛙）。",
      "**寄生 (+/-)**：寄生於他體利用其養分，通常不讓宿主立即死亡（蛔蟲、蟯蟲）。",
      "**片害共生 (-/○)**：對一方有害，對另一方無影響（青黴菌分泌青黴素抑制其他細菌）。"
    ],
    table: {
      headers: ["關係名稱", "符號", "敘述特徵", "原稿經典例子", "考試解題關鍵"],
      rows: [
        ["互利共生", "+ / +", "共生的生物體成員彼此都得到好處", "螞蟻和蚜蟲、小丑魚和海葵", "兩者同甘共苦，分開後生長皆受限"],
        ["片利共生", "+ / ○", "對其中一方有益，卻對另一方沒有影響", "鳥巢蕨依附樹幹", "附生植物僅借位爭光，不吸宿主養分"],
        ["競爭", "- / -", "雙方都受損", "牛、羊、馬", "雙方耗能受損，分開生活長得更好"],
        ["捕食或掠食", "+ / -", "捕食者族群變大、被捕食者族群變小", "蛇吃青蛙", "捕食者體型通常較大，獵物迅速致死"],
        ["寄生", "+ / -", "寄附在另一生物上，且利用他體養分生存", "寄生蟲如蛔蟲、蟯蟲等", "寄生者體型小，通常不讓宿主立即死亡"],
        ["片害共生", "- / ○", "對其中一方有害，對其他成員沒有影響", "青黴菌分泌青黴素抑制其他細菌", "分泌化學物非特異性抑制周遭菌群"]
      ]
    },
    image: "images/science/organism_interactions.png",
    imageCaption: "生物間的交互作用關係表（符號、敘述與經典實例對照）",
    mnemonic: "【互動關係秒殺心法】：競爭雙負號（爭食爭地兩敗俱傷 -/-）；捕食 vs 寄生同為正負，吃掉立死為捕食，吸血慢性為寄生！",
    quiz: [
      {
        question: "下列哪一組生物之間的交互作用關係，其代號屬於「雙方皆受損 (-/-)」的競爭關係？",
        options: [
          { prefix: "A", text: "稻田中的水稻與雜草", correct: true, explanation: "太棒了！水稻與雜草競爭陽光、水分與土壤養分，雙方生長皆受抑制，屬於雙方受損 (-/-) 的競爭關係！" },
          { prefix: "B", text: "附生在樟樹上的鳥巢蕨與樟樹", correct: false, explanation: "鳥巢蕨附生獲益，樟樹不受影響，屬於片利共生 (+/○)！" },
          { prefix: "C", text: "小丑魚與海葵", correct: false, explanation: "兩者互相提供保護與覓食好處，屬於互利共生 (+/+)！" },
          { prefix: "D", text: "寄生在人體小腸中的蛔蟲與人", correct: false, explanation: "蛔蟲獲益、人受損，屬於寄生 (+/-)！" }
        ]
      }
    ]
  },

  // ==========================================
  // 🏛️ 社會科 (Social Studies) - 複習與進度手帳
  // ==========================================
  {
    id: "social-1",
    stage: "progress",
    volume: "第 5 冊",
    stageName: "進度筆記本",
    subject: "social",
    subjectName: "社會",
    subjectIcon: "fa-landmark",
    gradeVersion: "九年級上（康軒／翰林／南一版）",
    unit: "第 1～2 章 古代大河文明至古典地中海文明",
    title: "古代大河文明至古典地中海 — 縱貫時序時間線",
    concept: "一條時間線掌握大河文明、希臘城邦、亞歷山大希臘化、羅馬帝國與基督教演進",
    coreConcepts: [
      "一條時序貫穿四大階段：大河文明發源、希臘古典哲學、亞歷山大希臘化實用科學、古羅馬帝國法制與基督教興起。"
    ],
    timeline: [
      {
        eraId: "river-valleys",
        eraName: "一、大河流域古文明",
        period: "前 3500～前 6 世紀",
        icon: "fa-water",
        badge: "大河文明",
        color: "#0284c7",
        events: [
          { time: "前 3500～539 年", title: "兩河文明（楔形文字/漢摩拉比法典同態復仇）；埃及（木乃伊/太陽曆）；印度（種姓/佛教）。", tag: "大河" }
        ]
      },
      {
        eraId: "greek-classical",
        eraName: "二、希臘古典城邦",
        period: "前 8～前 4 世紀",
        icon: "fa-landmark",
        badge: "古典希臘",
        color: "#0d9488",
        events: [
          { time: "前 8～前 4 世紀", title: "雅典民主（公民大會、哲學三哲）vs. 斯巴達軍國教育；波希戰爭勝、伯羅奔尼撒內戰衰亡。", tag: "城邦" }
        ]
      },
      {
        eraId: "hellenistic-age",
        eraName: "三、希臘化時代",
        period: "前 336～前 30 年",
        icon: "fa-earth-americas",
        badge: "希臘化",
        color: "#d97706",
        events: [
          { time: "前 336～前 30 年", title: "亞歷山大大帝東征融匯歐亞非，埃及亞歷山卓成重心，實用科學（幾何/浮力）鼎盛。", tag: "融匯" }
        ]
      },
      {
        eraId: "roman-christian",
        eraName: "四、古羅馬與基督教",
        period: "前 509～西元 476 年",
        icon: "fa-crown",
        badge: "古羅馬",
        color: "#e11d48",
        events: [
          { time: "前 509～西元 476 年", title: "共和法制（十二表法）轉帝制（屋大維羅馬和平）；313 年合法基督教、392 年定國教；476 年西羅馬亡入中古。", tag: "帝國" }
        ]
      }
    ],
    table: {
      headers: ["核心指標", "古希臘古典時代", "希臘化時代", "古羅馬時代"],
      rows: [
        ["政治體制", "城邦獨立 (雅典民主 / 斯巴達軍國)", "專制大帝國 (歐亞非東西大融合)", "共和轉帝制 (屋大維奧古斯都)"],
        ["文化重心", "希臘半島雅典城邦", "埃及「亞歷山卓城」", "義大利羅馬城"],
        ["核心成就", "民主政治、哲學三哲 (蘇/柏/亞)", "實用科學 (幾何 / 槓桿浮力)", "實用法學 (羅馬法)、圓頂拱券工程"],
        ["宗教演進", "奧林帕斯多神教、奧運祭神", "希臘神話與東方宗教融合", "基督教合法化(313)至立為國教(392)"],
        ["時代終局", "內戰衰微，亡於北方馬其頓", "各王國相繼亡於羅馬", "西元 476 年西羅馬滅亡，步入中古"]
      ]
    },
    image: "images/social/ancient_classical_civilizations_timeline.jpg",
    imageCaption: "古代大河文明至古典地中海文明歷史演進圖解",
    mnemonic: "【時序秒殺口訣】：蘇美造字埃及曆，雅典民主斯巴軍；亞歷山大融東西，屋大維創羅馬平；三一三合法信基督，四七六西羅入中古！",
    quiz: [
      {
        question: "古代西方歷史上，西元 313 年君士坦丁大帝頒布《米蘭詔令》，對基督教發展造成何種劃時代影響？",
        options: [
          { prefix: "A", text: "承認基督教具有合法地位，停止迫害教徒", correct: true, explanation: "秒殺正確！西元 313 年君士坦丁《米蘭詔令》是將基督教「合法化」；到西元 392 年狄奧多西皇帝才正式「定為國教」！" },
          { prefix: "B", text: "正式將基督教定為羅馬帝國唯一的官方國教", correct: false, explanation: "定為國教是西元 392 年狄奧多西皇帝所做，西元 313 年是「合法化」！" },
          { prefix: "C", text: "基督教分裂為羅馬天主教與希臘正教", correct: false, explanation: "教會大分裂發生於中古時代西元 1054 年！" },
          { prefix: "D", text: "創立基督教並確立舊約聖經一神信仰", correct: false, explanation: "耶穌於西元 1 世紀初創立基督教，非君士坦丁大帝！" }
        ]
      }
    ]
  },
  {
    id: "social-2",
    stage: "progress",
    volume: "第 5 冊",
    stageName: "進度筆記本",
    subject: "social",
    subjectName: "社會",
    subjectIcon: "fa-scale-balanced",
    gradeVersion: "九年級上（翰林／康軒／南一版）",
    unit: "第 3 章 選擇與機會成本",
    title: "機會成本計算全攻略（外顯成本＋隱藏成本）與非成本項目辨析",
    concept: "機會成本＝外顯成本（金錢支出）＋隱藏成本（放棄的收入/代價）；贈品利益絕非成本！",
    coreConcepts: [
      "**計算公式**：**機會成本 ＝ 外顯成本（實際支付之金錢）＋ 隱藏成本（因選擇而少賺的時間薪資）**。",
      "**贈品利益非成本**：商家附贈的禮品屬於「利益」，**絕不能計入機會成本，亦不可當作折扣扣除**！",
      "**沉沒成本不計**：已經發生且無法收回的支出，決策時不予考慮。"
    ],
    table: {
      headers: ["項目類別", "定義與說明", "實例對照（以參加 4 萬元日本賞櫻團請假 5 天少賺 8,800 元為例）", "是否計入機會成本"],
      rows: [
        ["外顯成本", "看得見、實際支付的金錢費用", "團費支出 40,000 元（自掏腰包）", "○ 必須計入！"],
        ["隱藏成本", "看不見、因選擇而放棄的最高報酬", "請假 5 天少賺的薪資 8,800 元（因旅遊而放棄）", "○ 必須計入！"],
        ["利益 / 贈品", "店家給予的額外獎勵或附贈價值", "隨團贈送價值 4,000 元保溫杯與體驗券", "× 絕不計入！（是利益非代價）"],
        ["總機會成本", "外顯成本 ＋ 隱藏成本", "40,000 ＋ 8,800 ＝ 48,800 元", "★ 唯一標準正解！"]
      ]
    },
    mnemonic: "【機會成本秒殺金律】：「外顯花錢＋隱藏少賺＝總機會成本！贈品是好康利益莫加它！」",
    quiz: [
      {
        question: "小麥決定在週末參加兩天一夜的露營活動，繳交報名費 3,000 元，因此放棄了原本打工可賺得的 2,000 元薪資。營隊主辦單位貼心贈送價值 500 元的露營專用杯。請問小麥參加此次露營的「總機會成本」為多少？",
        options: [
          { prefix: "A", text: "5,000 元", correct: true, explanation: "太棒了！機會成本 ＝ 外顯成本 (報名費 3,000) ＋ 隱藏成本 (打工薪資 2,000) ＝ 5,000 元！贈品價值 500 元屬於利益，絕不計入成本！" },
          { prefix: "B", text: "4,500 元", correct: false, explanation: "陷阱提醒：贈品是獲得的利益，絕不可拿來扣除或折抵機會成本！" },
          { prefix: "C", text: "5,500 元", correct: false, explanation: "贈品不是付出的代價，絕不可加進機會成本中！" },
          { prefix: "D", text: "3,000 元", correct: false, explanation: "只算了外顯成本，忽略了放棄的打工薪資（隱藏成本 2,000 元）！" }
        ]
      }
    ]
  },
  {
    id: "social-3",
    stage: "review",
    volume: "第 4 冊",
    stageName: "複習筆記本",
    subject: "social",
    subjectName: "社會",
    subjectIcon: "fa-map-location-dot",
    gradeVersion: "八年級下（翰林／康軒／南一版）",
    unit: "第 1 章 東北亞（日本群島）",
    title: "日本群島地理地圖全解（島嶼、海洋、洋流、工業區與降雪）",
    concept: "四大主要島嶼、周圍海洋海峽、寒暖洋流交會漁場、三大平原工業區、冬季降雪成因",
    coreConcepts: [
      "日本西臨日本海、東臨太平洋；親潮（寒）與黑潮（暖）交會於東北外海成著名天然漁場；冬季西北季風越日本海迎風面多雪。"
    ],
    table: {
      headers: ["代號 / 項目", "地理實體名稱", "類別屬性", "核心特徵與講義註解"],
      rows: [
        ["A", "北海道", "主要島嶼", "緯度最高、地廣人稀，為「天然牧場」"],
        ["B", "本州", "主要島嶼", "面積最大、政治經濟心臟，居住「90% 的人口」"],
        ["C", "四國", "主要島嶼", "本州南側、瀨戶內海以南之島嶼"],
        ["D", "九州", "主要島嶼", "日本西南端島嶼，鄰近對馬海峽，北部有北九州工業區"],
        ["E", "琉球群島", "附屬島嶼", "西南側呈弧狀延伸"],
        ["甲", "日本海", "海洋海峽", "西側邊緣海，「冬季寒冷」，西北季風掠過海面帶來豐沛水氣"],
        ["乙", "太平洋", "海洋海峽", "東側大洋，夏秋季受「季風、颱風」影響，為「國際主要航線」"],
        ["丙", "瀨戶內海", "海洋海峽", "三大島環抱之內海，沿岸有瀨戶內工業區"],
        ["丁", "對馬海峽", "海洋海峽", "位於九州與朝鮮半島之間，為「前往亞洲大陸的跳板」"],
        ["ㄅ", "親潮 (寒流)", "洋流系統", "高緯向南流經北海道外海，「帶來寒帶魚群」"],
        ["ㄆ", "黑潮 (暖流)", "洋流系統", "低緯向北流經太平洋側；寒暖交會湧升流形成世界著名漁場"]
      ]
    },
    image: "images/social/japan_geography_map.png",
    imageCaption: "日本群島主要島嶼、海洋海峽、洋流與工業區地圖",
    mnemonic: "【日本地理口訣】：北海牧場本州心，寒暖洋流漁場興；冬迎西北海側雪，太平洋側夏雨淋！",
    quiz: [
      {
        question: "日本本州面向日本海的地區（如新潟、北陸），冬季降雪量居世界前列。請問造成此氣候現象的最主要原因為何？",
        options: [
          { prefix: "A", text: "冬季西北季風掠過日本海吸收豐沛水氣，在迎風面的山地抬升致雪", correct: true, explanation: "答對了！冬季源自西伯利亞的乾燥西北季風越過溫暖的日本海吸收大量水氣，迎風面日本海側受山脈阻擋強烈降雪！" },
          { prefix: "B", text: "夏季東南季風帶來的對流雨在低溫下凝結成雪", correct: false, explanation: "這是冬季季風的影響，非夏季季風！" },
          { prefix: "C", text: "黑潮暖流直接流入日本海造成強烈蒸發降雪", correct: false, explanation: "黑潮主要流經太平洋側，日本海側主要受對馬暖流分支影響，關鍵是西北季風迎風面！" },
          { prefix: "D", text: "終年受西風帶與副熱帶高壓交替籠罩", correct: false, explanation: "主要成因是季風迎風面地形雨（雪）！" }
        ]
      }
    ]
  },
  {
    id: "social-4",
    stage: "review",
    volume: "第 4 冊",
    stageName: "複習筆記本",
    subject: "social",
    subjectName: "社會",
    subjectIcon: "fa-earth-asia",
    gradeVersion: "八年級下（翰林／康軒／南一版）",
    unit: "第 1 章 東北亞（朝鮮半島）",
    title: "朝鮮半島地理地圖全解（南北韓、太白山脈、蓋馬高原與三大河流）",
    concept: "北韓 vs. 南韓政權、三大河流流向、蓋馬高原礦產、太白山脈脊梁、東陡西緩地形",
    coreConcepts: [
      "半島東北高西南低，太白山脈東陡西緩；河流西流注入黃海；北韓多山林礦水力，南韓多平原人口工商發達。"
    ],
    table: {
      headers: ["代號 / 標籤", "名稱 / 地理實體", "類別屬性", "核心特徵與講義註解"],
      rows: [
        ["甲", "北韓 (朝鮮民主主義人民共和國)", "國家政權", "首都「平壤」，境內蓋馬高原蘊藏豐富「礦產」"],
        ["乙", "南韓 (大韓民國)", "國家政權", "首都「首爾」，農業平原開闊、經濟發達"],
        ["ㄅ", "太白山脈", "地形脊梁", "偏東側縱貫半島之脊梁山脈，東陡西緩"],
        ["ㄆ", "蓋馬高原", "地形高原", "北韓境內主要高原，氣候嚴寒，富含「林礦與水力」"],
        ["A", "漢江", "主要河流", "流經首爾，自東向西注入「黃海」"],
        ["B", "洛東江", "主要河流", "流經東南部釜山，注入「朝鮮海峽」"],
        ["C", "錦江", "主要河流", "流經西南部，注入「黃海」"]
      ]
    },
    image: "images/social/korea_geography_map.png",
    imageCaption: "朝鮮半島南北韓、太白山脈、蓋馬高原與三大河流地圖",
    mnemonic: "【朝鮮半島口訣】：東北山嶺西南平，東陡西緩河流西；北韓礦水南平商，太白縱貫脊梁立！",
    quiz: [
      {
        question: "有關朝鮮半島的地形與水系特徵，下列敘述何者完全正確？",
        options: [
          { prefix: "A", text: "地勢「東北高、西南低」，太白山脈偏東縱貫，漢江、錦江等主要河流多自東向西注入黃海", correct: true, explanation: "完全正確！太白山脈偏東縱貫形成「東陡西緩」脊梁，西南部地勢平坦為主要農業平原與水系出口！" },
          { prefix: "B", text: "地勢「西高東低」，主要河流皆向東流入日本海", correct: false, explanation: "朝鮮半島地勢東高西低，主要河流大多向西注入黃海！" },
          { prefix: "C", text: "南韓境內蓋馬高原蘊藏豐富礦產與水力資源", correct: false, explanation: "蓋馬高原位於「北韓」境內，非南韓！" },
          { prefix: "D", text: "漢江流經平壤，洛東江流經首爾", correct: false, explanation: "漢江流經首爾（南韓首都），大同江流經平壤（北韓首都）！" }
        ]
      }
    ]
  },
  {
    id: "social-5",
    stage: "review",
    volume: "第 4 冊",
    stageName: "複習筆記本",
    subject: "social",
    subjectName: "社會",
    subjectIcon: "fa-industry",
    gradeVersion: "八年級下（翰林／康軒／南一版）",
    unit: "第 1 章 東北亞（產業與經濟）",
    title: "東北亞三國產業全比較（日本、韓國、朝鮮：農業、製造業、商貿發展）",
    concept: "日本、韓國、朝鮮三國農業特色、製造業定位、商貿模式與跨國合作完整比較",
    coreConcepts: [
      "**農業**：日本精緻科技農業；南韓平原米倉、泡菜自給；北韓嚴寒糧食不足。",
      "**製造與商貿**：日韓外向型貿易大國，原料仰賴進口、工業品銷全球；日本高科技汽車精密領先；南韓半導體財閥主導；北韓重工軍工閉關自守。"
    ],
    table: {
      headers: ["項目 / 國家", "第一級產業", "製造業", "商貿與區域合作"],
      rows: [
        ["日本", "耕地狹小＋勞力老化（科技化農業）", "技術領先＋資金充沛，生產成本過高（產業有外移現象）", "跨國投資東南亞，建立海外生產基地"],
        ["韓國", "冬季嚴寒＋缺少蔬果，製造泡菜（辛奇），供應冬季飲食所需", "原料缺乏＋市場狹小（以出口為導向，大財閥主導）", "積極簽署自由貿易協定 (FTA)，拓展海外市場"],
        ["朝鮮 (北韓)", "多山區、氣候寒冷，糧食產量不足（依賴國際援助）", "礦產豐富，發展重工業與軍工武器", "實行鎖國政策，主要貿易夥伴為中國"]
      ]
    },
    image: "images/social/northeast_asia_economy.png",
    imageCaption: "日本、韓國、朝鮮三國農業、製造業與商貿比較圖表",
    mnemonic: "【東北亞產業口訣】：日韓外向原料進口產品銷全球；日本精密科技，南韓財閥半導體，北韓軍工缺糧食！",
    quiz: [
      {
        question: "日本與南韓兩國在工業與經貿發展型態上，具有下列哪一項最顯著的「共同特徵」？",
        options: [
          { prefix: "A", text: "國內礦產資源匱乏，均採「進口原料、加工出口」的外向型貿易經濟", correct: true, explanation: "答對了！日韓兩國國內能源與金屬礦產皆嚴重缺乏，高度依賴海外原料進口，並將高階工業產品（汽車、半導體）行銷全球！" },
          { prefix: "B", text: "國內勞動力充足低廉，以低成本組裝成衣與鞋類製造為主", correct: false, explanation: "日韓兩國工資高昂且面臨高齡化，產業已全面升級為高科技與資本密集！" },
          { prefix: "C", text: "糧食作物完全自給自足，不需仰賴國外農產進口", correct: false, explanation: "日韓耕地狹小，小麥、黃豆、牛肉等大量依賴海外進口！" },
          { prefix: "D", text: "實行嚴格鎖國保護政策，極少進行對外投資", correct: false, explanation: "日韓皆積極拓展海外市場並跨國投資！" }
        ]
      }
    ]
  },

  // ==========================================
  // 🔤 英文科 (English) - 進度手帳 (第 5 冊)
  // ==========================================
  {
    id: "english-1",
    stage: "progress",
    volume: "第 5 冊",
    stageName: "進度筆記本",
    subject: "english",
    subjectName: "英文",
    subjectIcon: "fa-language",
    gradeVersion: "九年級上（南一／翰林／康軒版）",
    unit: "現在完成式核心文法",
    title: "現在完成式 been 後面三種接法大對決（狀態 vs. 被動 vs. 進行）",
    concept: "been 後接形容詞/名詞表一直以來的狀態；接 V-p.p. 表完成被動；接 V-ing 表完成進行",
    coreConcepts: [
      "**接形容詞 / 名詞（表一直以來的狀態）**：been 後無動詞，接形容詞（如 sick, busy）或名詞（如 student），表示某狀態從過去一直維持到現在。",
      "**接 V-p.p.（表完成被動：已經被...）**：主詞通常為「物品」（物品無法自主做動作只能被做），表示某事情已經「被」完成了。",
      "**接 V-ing（表完成進行：一直在做而且還在做）**：主詞通常為「人或動物」（主動作動作），強調動作從過去持續進行到現在沒有停下來。"
    ],
    table: {
      headers: ["接法結構", "文法意義", "判斷關鍵 (怎麼看)", "核心概念", "代表例句與說明"],
      rows: [
        ["been ＋ 形容詞 / 名詞", "一直以來的狀態", "無動詞，接 Adj (sick) 或 N (student)", "狀態從過去「一直」維持到現在", "I have been sick for two days.<br>(我這兩天一直生病，形容狀態)"],
        ["been ＋ V-p.p.", "完成被動 (已經被...)", "接動作 p.p.，主詞通常為「物品」只能被動", "某件事情「已經被」完成了", "The cake has been eaten.<br>(蛋糕已經被吃掉了，被吃)"],
        ["been ＋ V-ing", "完成進行 (一直在做)", "接 V-ing，主詞通常為「人/動物」主動作動作", "動作從過去持續「動」到現在沒停", "I have been studying English for three hours.<br>(我一直在讀英文讀了三小時，還在讀)"]
      ]
    },
    image: "images/english/have_been_three_usages.png",
    imageCaption: "現在完成式 been 後接形容詞/名詞、V-p.p. 與 V-ing 三大結構精解",
    mnemonic: "【been 接法秒殺口訣】：接形名是「狀態」，物加被動「被幹掉 (p.p.)」，人動進行「ing 還在衝」！",
    quiz: [
      {
        question: "請選出下列現在完成式句子中，文法結構與語意完全正確的選項：『這間教室已經被學生們打掃乾淨了。』",
        options: [
          { prefix: "A", text: "The classroom has been cleaned by the students.", correct: true, explanation: "答對了！主詞 The classroom 為物品（無法自己做動作），故使用「been ＋ V-p.p. (cleaned)」表達完成被動語態！" },
          { prefix: "B", text: "The classroom has been cleaning by the students.", correct: false, explanation: "教室是物品無法自主動作，若用 cleaning（V-ing）變成教室自己在打掃，語意錯誤！" },
          { prefix: "C", text: "The classroom have been cleaned by the students.", correct: false, explanation: "主詞 The classroom 為單數第三人稱，助動詞應用 has 而非 have！" },
          { prefix: "D", text: "The classroom has cleaned by the students.", correct: false, explanation: "缺少 been！has cleaned 變成主動式，教室無法主動打掃！" }
        ]
      }
    ]
  },
  {
    id: "english-2",
    stage: "review",
    volume: "第 4 冊",
    stageName: "複習筆記本",
    subject: "english",
    subjectName: "英文",
    subjectIcon: "fa-language",
    gradeVersion: "八年級下（南一／翰林／康軒版）",
    unit: "形容詞與副詞比較級",
    title: "比較級特殊片語句型：越來越……（三大經典句型全解析）",
    concept: "表示「越來越……」的三種比較級特殊片語結構：get/become 比較級 and 比較級、more and more ＋ 原級、less and less ＋ 原級",
    coreConcepts: [
      "**① get / become ＋ 比較級 ＋ and ＋ 比較級**：適用於單音節或雙音節加 -er 的形容詞，表示「越來越……」。例如：The sky is getting brighter and brighter.（天空變得越來越亮了。）",
      "**② more and more ＋ 原級**：適用於多音節或字前加 more 的形容詞，表示「越來越……」。例如：Ivan becomes more and more handsome.（Ivan 變得越來越帥了。）【重點：後方必接原級】",
      "**③ less and less ＋ 原級**：表示程度遞減「越來越不……」。例如：The old man is less and less happy.（這位老先生變得越來越不快樂了。）【重點：後方必接原級】"
    ],
    table: {
      headers: ["片語類型", "句型結構", "代表例句與中譯 (點擊翻牌揭曉)"],
      rows: [
        ["單音節 / 雙音節形容詞", "get / become ＋ 比較級 ＋ and ＋ 比較級", "The sky is getting brighter and brighter.<br><small style=\"color: #64748b;\">（天空變得越來越亮了。）</small>"],
        ["多音節形容詞", "more and more ＋ 原級", "Ivan becomes more and more handsome.<br><small style=\"color: #64748b;\">（Ivan 變得越來越帥了。）</small>"],
        ["程度遞減（越來越不……）", "less and less ＋ 原級", "The old man is less and less happy.<br><small style=\"color: #64748b;\">（老先生變得越來越不快樂了。）</small>"]
      ]
    },
    image: "",
    imageCaption: "",
    mnemonic: "【比較級特殊片語秒殺口訣】：<br>① 短字疊加：er and er（越來越亮：brighter and brighter）<br>② 長字前置：more and more ＋ 原級（越來越帥：more and more handsome）<br>③ 程度減少：less and less ＋ 原級（越來越不快樂：less and less happy）<br>⚠️ 避坑提醒：more and more 與 less and less 後方**絕對接原級**，千萬別重複變形！",
    quiz: [
      {
        question: "依據句型規則選出最適當的填空：The sky is getting ________ as morning comes.",
        options: [
          { prefix: "A", text: "brighter and brighter", correct: true, explanation: "太厲害了！完全正確！bright 為單音節形容詞，比較級為 brighter，搭配「get ＋ 比較級 ＋ and ＋ 比較級」結構，故選 brighter and brighter！" },
          { prefix: "B", text: "more and more bright", correct: false, explanation: "bright 為單音節形容詞，比較級應加 -er，不適合使用 more and more 句型。" },
          { prefix: "C", text: "bright and brighter", correct: false, explanation: "必須兩者皆為比較級（brighter and brighter），不可一原級一比較級。" },
          { prefix: "D", text: "less and less brighter", correct: false, explanation: "less and less 後方必須接「原級形容詞（bright）」，不可接比較級 brighter。" }
        ]
      },
      {
        question: "依據句型規則選出最適當的填空：Ivan becomes ________ handsome year after year.",
        options: [
          { prefix: "A", text: "handsomer and handsomer", correct: false, explanation: "handsome 為多音節形容詞，通常不使用 -er 疊加形式。" },
          { prefix: "B", text: "more and more handsome", correct: true, explanation: "答對了！handsome 為多音節形容詞，應用「more and more ＋ 原級」表示「越來越英俊」！" },
          { prefix: "C", text: "more handsome and handsome", correct: false, explanation: "標準句型為固定片語「more and more ＋ 原級」，不可寫成 more handsome and handsome。" },
          { prefix: "D", text: "more and more handsomer", correct: false, explanation: "重大陷阱！more and more 後方固定接「原級」，千萬不可再加 -er 變成 handsomer！" }
        ]
      }
    ]
  },
  {
    id: "english-3",
    stage: "review",
    volume: "第 4 冊",
    stageName: "複習筆記本",
    subject: "english",
    subjectName: "英文",
    subjectIcon: "fa-language",
    gradeVersion: "八年級下（南一／翰林／康軒版）",
    unit: "形容詞與副詞比較級與最高級",
    title: "最高級與比較級互換句型：用比較級表達最高級（排除自己與跨界比較全攻略）",
    concept: "同範圍比較排除自己（any other＋單數、all the other＋複數、anyone else）、否定句型（No other）、跨範圍比較（不加 other/else）",
    coreConcepts: [
      "**① 最高級標準句型**：S ＋ be 動詞 ＋ the ＋ 最高級形容詞 ＋ in ＋ 地點/範圍（例如：Tom is the tallest in the class.）。",
      "**② 同範圍比較必「排除自己」**：同一群體比較時自己不能與自己比，必須排除主詞自身：any other ＋ 單數名詞、all the other ＋ 複數名詞、anyone else / everyone else。",
      "**③ 否定詞 No other 互換句型**：No other ＋ 名詞 ＋ be 動詞 ＋ 比較級 ＋ than ＋ A；或 No other ＋ 名詞 ＋ be 動詞 ＋ as ＋ 原級 ＋ as ＋ A。",
      "**④ 跨範圍比較必考陷阱**：若與不同範圍物件做比較（主詞不在該範圍內），**絕對不加 other 和 else**！例如：Mt. Jade is taller than any mountain in Japan.（玉山不在日本，不能加 other）。"
    ],
    table: {
      headers: ["句型角度 / 種類", "句型結構", "經典例句與重點解析 (點擊翻牌揭曉)"],
      rows: [
        ["① 標準最高級", "S ＋ be 動詞 ＋ the ＋ 最高級 ＋ in ＋ 地點/範圍", "Tom is the tallest in the class.<br><small style=\"color: #64748b;\">（Tom 是班上最高的。）</small>"],
        ["② 比較級 (any other)", "S ＋ be 動詞 ＋ 比較級 ＋ than any other ＋ 單數名詞 ＋ 範圍", "Tom is taller than any other boy in the class.<br><small style=\"color: #64748b;\">⚠️ any other 後方固定接「單數名詞」（排除自己）</small>"],
        ["③ 比較級 (all the other)", "S ＋ be 動詞 ＋ 比較級 ＋ than all the other ＋ 複數名詞 ＋ 範圍", "Tom is taller than all the other boys in the class.<br><small style=\"color: #64748b;\">⚠️ all the other 後方固定接「複數名詞」（排除自己）</small>"],
        ["④ 比較級 (代名詞 else)", "S ＋ be 動詞 ＋ 比較級 ＋ than anyone else / everyone else ＋ 範圍", "Tom is taller than anyone else in the class.<br><small style=\"color: #64748b;\">⚠️ else 放在代名詞後面（排除自己）</small>"],
        ["⑤ 否定比較級 (No other)", "No other ＋ 名詞 ＋ be 動詞 ＋ 比較級 ＋ than ＋ A", "No other boy is taller than Tom.<br><small style=\"color: #64748b;\">（沒有其他男生比 Tom 更高。）</small>"],
        ["⑥ 否定原級 (No other)", "No other ＋ 名詞 ＋ be 動詞 ＋ as ＋ 原級 ＋ as ＋ A", "No other boy is as tall as Tom.<br><small style=\"color: #64748b;\">（沒有其他男生像 Tom 一樣高。）</small>"],
        ["⚡ 跨範圍比較 (會考陷阱)", "S ＋ be 動詞 ＋ 比較級 ＋ than any ＋ 名詞（不加 other / else）", "Mt. Jade is taller than any mountain in Japan.<br><small style=\"color: #64748b;\">⚠️ 玉山不在日本境內，屬於不同範圍比較，絕不可加 other！</small>"]
      ]
    },
    image: "",
    imageCaption: "",
    mnemonic: "【最高級與比較級互換黃金口訣】：<br>① any other 配單數；all the other 領複數！<br>② anyone/everyone else，else 站後面排除自己！<br>③ No other 否定立大功，than 用比較、as...as 用原級！<br>④ 跨界避坑金律：同一國的要排除（加 other）；不同國的直接比（不加 other）！",
    quiz: [
      {
        question: "選出文法正確的句子表達「Leo 是班上最高的男生」：",
        options: [
          { prefix: "A", text: "Leo is taller than any other boys in his class.", correct: false, explanation: "錯誤！any other 後方必須接「單數名詞 boy」，不可接複數 boys。" },
          { prefix: "B", text: "Leo is taller than any other boy in his class.", correct: true, explanation: "太厲害了！完全正確！在同班同學範圍內比較，必須排除 Leo 本人，使用「any other ＋ 單數名詞（boy）」，結構完全正確！" },
          { prefix: "C", text: "Leo is taller than all the other boy in his class.", correct: false, explanation: "錯誤！all the other 後方必須接「複數名詞 boys」。" },
          { prefix: "D", text: "Leo is taller than any boy in his class.", correct: false, explanation: "嚴重邏輯錯誤！若不加 other 排除自己，會變成「Leo 比班上任何一個男生（包括 Leo 自己）都高」，自己不能比自己高！" }
        ]
      },
      {
        question: "已知玉山（Mt. Jade）位於台灣，富士山位於日本。選出表達「玉山比日本所有的山都高」完全正確的句子：",
        options: [
          { prefix: "A", text: "Mt. Jade is taller than any other mountain in Japan.", correct: false, explanation: "陷阱！玉山根本不在日本境內，屬於跨範圍比較，主詞不在該群體中，絕對不能加 other！" },
          { prefix: "B", text: "Mt. Jade is taller than any mountain in Japan.", correct: true, explanation: "太強了！完全正確！這正是會考最愛考的「不同範圍物件比較」：玉山不在日本，因此不需要排除自己，直接用「than any ＋ 單數名詞」即可，絕不加 other！" },
          { prefix: "C", text: "Mt. Jade is taller than anyone else in Japan.", correct: false, explanation: "mountain 是事物不是人，不可使用 anyone else。" },
          { prefix: "D", text: "No other mountain in Japan is taller than Mt. Jade.", correct: false, explanation: "玉山不是日本的山，不能說「日本境內沒有其他山」包含玉山。" }
        ]
      }
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { NOTES_DATA };
}

