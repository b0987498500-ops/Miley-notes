import json

science_16 = '''  {
    id: "science-16",
    stage: "progress",
    volume: "第 5 冊",
    stageName: "進度筆記本",
    subject: "science",
    subjectName: "自然",
    subjectIcon: "fa-atom",
    gradeVersion: "九年級上（康軒／翰林／南一版）",
    unit: "力與運動／功與能（動能的物理意義、功能轉換與決定因素）",
    title: "動能的定義與物理意義（功與能的轉換、決定動能大小的兩大因素）",
    concept: "施力對靜止物體作功產生運動變化使物體獲得動能，動能數值大小與物體末速率平方及質量成正比（Ek = 1/2 mv²）",
    coreConcepts: [
      "**動能的本質**：物體因「運動」而具有的能量稱為**動能（Kinetic Energy，$E_k$）**。外力對靜止物體作功（$W = F \\\\times S$），外力作功轉換為物體運動的能量，使物體獲得動能。",
      "**功能定理**：外力對物體所作的淨功，等於該物體動能的增加量（$W = \\\\Delta E_k$）。",
      "**決定動能大小的兩大變因**：",
      "1. **物體的質量（$m$）**：當末速率相同時，質量愈大，動能愈大；動能與質量成**正比**（$E_k \\\\propto m$）。",
      "2. **物體的末速率（$v$）**：當質量相同時，末速率愈大，動能愈大；動能與速率的**平方成正比**（$E_k \\\\propto v^2$）。",
      "**公式關係式**：$E_k = \\\\frac{1}{2}mv^2$。速率對動能影響極大，速度增為 2 倍，動能增為 4 倍！"
    ],
    table: {
      headers: ["控制變因", "操作變因 (改變條件)", "應變變因 (動能大小指標)", "實驗結論與物理規律 (點擊翻牌)", "會考與模考秒殺密碼"],
      rows: [
        [
          "末速率相同<br>(同高度釋放)",
          "物體質量 m<br>(不同質量鐵球)",
          "木塊被推移距離 S",
          "鐵球質量愈大，推動木塊距離愈遠 ⇒ 動能與質量成正比",
          "同速比質量，質量大動能大"
        ],
        [
          "物體質量相同<br>(同一顆鐵球)",
          "物體末速率 v<br>(不同高度釋放)",
          "木塊被推移距離 S",
          "釋放高度愈高末速愈大，推動木塊愈遠 ⇒ 動能與速率平方成正比",
          "同重比車速，速度平方影響大"
        ]
      ]
    },
    mnemonic: "【動能由來與本質】：施力作功變動能，靜止受力跑起來！<br>【決定變因口訣】：動能大小看質量與速率，質量成正比、速率看平方！",
    quiz: [
      {
        question: "施力對靜止物體作功，使其產生的運動變化，此數值大小與物體末速率及物體質量均有關。下列關於此物理量的敘述，何者完全正確？",
        options: [
          { prefix: "A", text: "此物理量稱為重力位能，僅與物體所在的高度位置有關", correct: false, explanation: "重力位能由物體的位置高度決定；因運動而具有的能量稱為動能！" },
          { prefix: "B", text: "此物理量稱為動能，當物體質量相同時，速率增為 2 倍，動能增為 4 倍", correct: true, explanation: "正解！動能數值大小與物體質量成正比、與末速率平方成正比（Ek = 1/2 mv²），速率增為 2 倍，動能增為 4 倍！" },
          { prefix: "C", text: "物體只要受力就必定具有動能，與物體是否產生運動及末速率無關", correct: false, explanation: "物體必須產生運動且具有速率才具有動能！" },
          { prefix: "D", text: "若兩輛不同質量的卡車以相同速率行駛，質量較小者具有較大的動能", correct: false, explanation: "速率相同時，質量愈大者動能愈大！" }
        ]
      }
    ]
  },'''

with open('/Users/bennychen/pCloud Drive/bennychen/0AI_共用資料夾/07_Miley/麥麥筆記/notes_data.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'id: "science-15"'
pos = text.find(target)
next_brace = text.find('\n  },', pos)

insert_pos = next_brace + 5
text = text[:insert_pos] + '\n' + science_16 + '\n' + text[insert_pos:]

with open('/Users/bennychen/pCloud Drive/bennychen/0AI_共用資料夾/07_Miley/麥麥筆記/notes_data.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Successfully added science-16 to notes_data.js!')
