(function(){
  'use strict';
  // v0.3.2: Area Sud aggiornata con collisioni rifinite.
  window.EsposizioneAreas={
  "nord": {
    "id": "nord",
    "title": "AREA NORD",
    "subtitle": "Area Nord + Area Centrale",
    "map": "images/maps/area_nord.jpg",
    "ready": true,
    "width": 3348,
    "height": 2565,
    "spawn": {
      "x": 2556,
      "y": 1728
    },
    "walkable": [
      [
        [
          331,
          236
        ],
        [
          819,
          404
        ],
        [
          894,
          220
        ],
        [
          1500,
          413
        ],
        [
          1875,
          482
        ],
        [
          2307,
          486
        ],
        [
          2341,
          367
        ],
        [
          2515,
          367
        ],
        [
          2544,
          499
        ],
        [
          2688,
          497
        ],
        [
          2686,
          671
        ],
        [
          2693,
          2128
        ],
        [
          1276,
          2138
        ],
        [
          620,
          2054
        ],
        [
          337,
          1911
        ],
        [
          8,
          1666
        ],
        [
          48,
          1331
        ],
        [
          245,
          574
        ]
      ]
    ],
    "obstacles": [
      {
        "type": "poly",
        "label": "24",
        "points": [
          [
            378,
            284
          ],
          [
            766,
            435
          ],
          [
            714,
            604
          ],
          [
            320,
            463
          ]
        ]
      },
      {
        "type": "poly",
        "label": "14",
        "points": [
          [
            928,
            458
          ],
          [
            1396,
            607
          ],
          [
            1362,
            796
          ],
          [
            864,
            640
          ]
        ]
      },
      {
        "type": "poly",
        "label": "16",
        "points": [
          [
            1500,
            635
          ],
          [
            2061,
            770
          ],
          [
            2013,
            957
          ],
          [
            1436,
            827
          ]
        ]
      },
      {
        "type": "poly",
        "label": "4",
        "points": [
          [
            895,
            789
          ],
          [
            1137,
            887
          ],
          [
            1093,
            1060
          ],
          [
            838,
            977
          ]
        ]
      },
      {
        "type": "poly",
        "label": "5-3",
        "points": [
          [
            1240,
            1138
          ],
          [
            1426,
            1184
          ],
          [
            1268,
            1605
          ],
          [
            1084,
            1548
          ]
        ]
      },
      {
        "type": "circle",
        "label": "40",
        "x": 1736,
        "y": 1219,
        "r": 130
      },
      {
        "type": "circle",
        "label": "38",
        "x": 1640,
        "y": 1574,
        "r": 119
      },
      {
        "type": "poly",
        "label": "2",
        "points": [
          [
            934,
            1678
          ],
          [
            1054,
            1688
          ],
          [
            1055,
            1835
          ],
          [
            935,
            1837
          ]
        ]
      },
      {
        "type": "circle",
        "label": "22",
        "x": 577,
        "y": 1793,
        "r": 122
      },
      {
        "type": "poly",
        "label": "8",
        "points": [
          [
            148,
            1564
          ],
          [
            283,
            1620
          ],
          [
            217,
            1791
          ],
          [
            71,
            1696
          ]
        ]
      },
      {
        "type": "poly",
        "label": "36",
        "points": [
          [
            890,
            1901
          ],
          [
            1195,
            1916
          ],
          [
            1202,
            2036
          ],
          [
            885,
            2026
          ]
        ]
      },
      {
        "type": "poly",
        "label": "1",
        "points": [
          [
            1263,
            1816
          ],
          [
            2013,
            1819
          ],
          [
            2013,
            2044
          ],
          [
            1266,
            2041
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            1766,
            1431
          ],
          [
            1878,
            1668
          ],
          [
            2019,
            1539
          ],
          [
            1881,
            1391
          ],
          [
            1828,
            1417
          ],
          [
            1773,
            1429
          ],
          [
            1766,
            1433
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            1919,
            1357
          ],
          [
            1956,
            1312
          ],
          [
            1984,
            1239
          ],
          [
            2067,
            1242
          ],
          [
            2067,
            1481
          ],
          [
            2056,
            1506
          ],
          [
            1922,
            1361
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            1916,
            1713
          ],
          [
            2052,
            1580
          ],
          [
            2061,
            1598
          ],
          [
            2058,
            1770
          ],
          [
            1922,
            1771
          ],
          [
            1917,
            1741
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2123,
            1639
          ],
          [
            2196,
            1634
          ],
          [
            2200,
            1768
          ],
          [
            2123,
            1767
          ],
          [
            2119,
            1638
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2068,
            2061
          ],
          [
            2067,
            1829
          ],
          [
            2203,
            1828
          ],
          [
            2206,
            1891
          ],
          [
            2180,
            1899
          ],
          [
            2180,
            1944
          ],
          [
            2189,
            1987
          ],
          [
            2163,
            2011
          ],
          [
            2138,
            2045
          ],
          [
            2118,
            2068
          ],
          [
            2062,
            2066
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2113,
            1190
          ],
          [
            2178,
            1189
          ],
          [
            2178,
            1102
          ],
          [
            2143,
            1094
          ],
          [
            2130,
            1079
          ],
          [
            2116,
            1077
          ],
          [
            2114,
            1190
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2250,
            1707
          ],
          [
            2249,
            1428
          ],
          [
            2293,
            1426
          ],
          [
            2294,
            1712
          ],
          [
            2254,
            1709
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2247,
            1376
          ],
          [
            2247,
            1241
          ],
          [
            2294,
            1241
          ],
          [
            2296,
            1379
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2248,
            983
          ],
          [
            2249,
            1187
          ],
          [
            2302,
            1192
          ],
          [
            2300,
            985
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2249,
            784
          ],
          [
            2249,
            931
          ],
          [
            2299,
            934
          ],
          [
            2298,
            783
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2075,
            972
          ],
          [
            2116,
            977
          ],
          [
            2126,
            941
          ],
          [
            2162,
            920
          ],
          [
            2179,
            922
          ],
          [
            2188,
            796
          ],
          [
            2123,
            781
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            1957,
            1106
          ],
          [
            2038,
            1037
          ],
          [
            2065,
            1075
          ],
          [
            2065,
            1190
          ],
          [
            1983,
            1186
          ],
          [
            1974,
            1145
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            1232,
            1759
          ],
          [
            1868,
            1766
          ],
          [
            1854,
            1740
          ],
          [
            1598,
            1746
          ],
          [
            1499,
            1735
          ],
          [
            1318,
            1672
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            1372,
            1623
          ],
          [
            1520,
            1678
          ],
          [
            1554,
            1685
          ],
          [
            1558,
            1674
          ],
          [
            1526,
            1618
          ],
          [
            1531,
            1531
          ],
          [
            1571,
            1481
          ],
          [
            1615,
            1462
          ],
          [
            1666,
            1460
          ],
          [
            1709,
            1468
          ],
          [
            1732,
            1491
          ],
          [
            1759,
            1606
          ],
          [
            1707,
            1690
          ],
          [
            1832,
            1685
          ],
          [
            1705,
            1436
          ],
          [
            1603,
            1405
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            1371,
            1556
          ],
          [
            1474,
            1246
          ],
          [
            1488,
            1249
          ],
          [
            1504,
            1293
          ],
          [
            1531,
            1344
          ],
          [
            1555,
            1365
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2540,
            787
          ],
          [
            2595,
            784
          ],
          [
            2590,
            936
          ],
          [
            2543,
            937
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2541,
            987
          ],
          [
            2589,
            991
          ],
          [
            2589,
            1190
          ],
          [
            2544,
            1190
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2541,
            1242
          ],
          [
            2592,
            1244
          ],
          [
            2587,
            1382
          ],
          [
            2543,
            1382
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2539,
            1430
          ],
          [
            2590,
            1429
          ],
          [
            2589,
            1708
          ],
          [
            2541,
            1711
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2681,
            1770
          ],
          [
            2638,
            1767
          ],
          [
            2639,
            1640
          ],
          [
            2740,
            1640
          ],
          [
            2743,
            1772
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2239,
            2022
          ],
          [
            2594,
            2032
          ],
          [
            2593,
            1781
          ],
          [
            2536,
            1781
          ],
          [
            2530,
            1858
          ],
          [
            2472,
            1857
          ],
          [
            2425,
            1795
          ],
          [
            2393,
            1791
          ],
          [
            2388,
            1829
          ],
          [
            2353,
            1859
          ],
          [
            2299,
            1862
          ],
          [
            2298,
            1781
          ],
          [
            2257,
            1755
          ],
          [
            2237,
            1785
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            720,
            721
          ],
          [
            542,
            1558
          ],
          [
            50,
            1399
          ],
          [
            60,
            1330
          ],
          [
            319,
            595
          ]
        ]
      },
      {
        "type": "poly",
        "label": "editor",
        "points": [
          [
            2634,
            1836
          ],
          [
            2637,
            1895
          ],
          [
            2659,
            1928
          ],
          [
            2643,
            1989
          ],
          [
            2675,
            2035
          ],
          [
            2684,
            2109
          ],
          [
            2778,
            2112
          ],
          [
            2777,
            1838
          ]
        ]
      }
    ],
    "hotspots": [
      {
        "id": "sport",
        "x": 627,
        "y": 1088,
        "r": 130,
        "title": "Campo sportivo",
        "text": "Qui entreranno i giochi dedicati agli sport d’epoca e ai giochi da tavolo. Per ora è un punto interattivo di prova."
      },
      {
        "id": "bellearti",
        "x": 1903,
        "y": 1213,
        "r": 122,
        "title": "Palazzo delle Belle Arti",
        "text": "Questo padiglione ospiterà quiz, curiosità artistiche ed Easter egg. Collegamento ai minigiochi in arrivo."
      },
      {
        "id": "hotspot-1790363340218",
        "x": 1732,
        "y": 1370,
        "r": 110,
        "title": "40. Palazzo delle Belle Arti",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363345918",
        "x": 1737,
        "y": 1061,
        "r": 110,
        "title": "40. Palazzo delle Belle Arti",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363352923",
        "x": 1735,
        "y": 926,
        "r": 110,
        "title": "40. Palazzo delle Belle Arti",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363358045",
        "x": 1582,
        "y": 1211,
        "r": 110,
        "title": "40. Palazzo delle Belle Arti",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363376264",
        "x": 1768,
        "y": 1569,
        "r": 110,
        "title": "38. Lanterna in miniatura",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363398217",
        "x": 1658,
        "y": 1801,
        "r": 110,
        "title": "1. Galleria dell'Industria Alimentare",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363414169",
        "x": 1044,
        "y": 1897,
        "r": 110,
        "title": "36. Montagne Russe",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363434569",
        "x": 1341,
        "y": 1503,
        "r": 110,
        "title": "3. Padiglione della città di Genova",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363448490",
        "x": 1324,
        "y": 1135,
        "r": 110,
        "title": "5. Padiglione degustazione",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363463228",
        "x": 1974,
        "y": 761,
        "r": 110,
        "title": "16. Galleria macchinari idraulici",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363485180",
        "x": 1100,
        "y": 737,
        "r": 110,
        "title": "14. Galleria dell'Agricoltura",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363509817",
        "x": 970,
        "y": 1028,
        "r": 110,
        "title": "4. Galleria delle Colonie",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363534260",
        "x": 661,
        "y": 1613,
        "r": 110,
        "title": "22. Padiglione del giornalismo",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363539720",
        "x": 707,
        "y": 1753,
        "r": 110,
        "title": "22. Padiglione del giornalismo",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363544684",
        "x": 566,
        "y": 1849,
        "r": 110,
        "title": "22. Padiglione del giornalismo",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363562467",
        "x": 214,
        "y": 1561,
        "r": 110,
        "title": "8. Pallone aerostatico",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363573580",
        "x": 273,
        "y": 1709,
        "r": 110,
        "title": "8. Pallone aerostatico",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363603763",
        "x": 1167,
        "y": 1584,
        "r": 110,
        "title": "2. Padiglione di Chimica e Farmacia",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363613146",
        "x": 1041,
        "y": 1665,
        "r": 110,
        "title": "2. Padiglione di Chimica e Farmacia",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363645096",
        "x": 514,
        "y": 539,
        "r": 110,
        "title": "24. Area fumatori",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363649161",
        "x": 761,
        "y": 524,
        "r": 110,
        "title": "24. Area fumatori",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363665594",
        "x": 490,
        "y": 642,
        "r": 110,
        "title": "25. Campo sportivo",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363673057",
        "x": 301,
        "y": 1472,
        "r": 110,
        "title": "25. Campo sportivo",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790363685605",
        "x": 203,
        "y": 906,
        "r": 110,
        "title": "25. Campo sportivo",
        "text": "Hotspot di prova creato in Modalità Test."
      },
      {
        "id": "hotspot-1790365386756",
        "x": 1582,
        "y": 1706,
        "r": 110,
        "title": "38. Lanterna in miniatura",
        "text": "Hotspot di prova creato in Modalità Test."
      }
    ],
    "gates": [
      {
        "id": "to-sud",
        "type": "area",
        "x": 2683,
        "y": 764,
        "w": 351,
        "h": 1170,
        "target": "sud",
        "targetGate": "to-nord",
        "message": "Area Sud"
      },
      {
        "id": "boat-nord",
        "type": "boat",
        "x": 2367,
        "y": 312,
        "w": 120,
        "h": 120,
        "target": "sud",
        "targetGate": "boat-sud",
        "message": "Battello · Stazione A"
      },
      {
        "id": "exit-nord",
        "type": "exit",
        "x": 2365,
        "y": 2068,
        "w": 120,
        "h": 120,
        "action": "return-to-games",
        "message": "Uscita dall'Esposizione"
      }
    ],
    "decor": []
  },
  "sud": {
    "id": "sud",
    "title": "AREA SUD",
    "subtitle": "Giardini meridionali e Battello",
    "map": "images/maps/area_sud.jpg",
    "ready": true,
    "width": 4251,
    "height": 2565,
    "spawn": {
      "x": 260,
      "y": 1500
    },
    "walkable": [
      [
        [
          0,
          700
        ],
        [
          2594,
          700
        ],
        [
          4225,
          812
        ],
        [
          4248,
          1647
        ],
        [
          3738,
          2407
        ],
        [
          2665,
          2486
        ],
        [
          1560,
          2452
        ],
        [
          0,
          2332
        ]
      ]
    ],
    "obstacles": [
      {
        "type": "poly",
        "label": "16",
        "points": [
          [
            280,
            839
          ],
          [
            1128,
            839
          ],
          [
            1127,
            947
          ],
          [
            286,
            966
          ]
        ]
      },
      {
        "type": "poly",
        "label": "15A",
        "points": [
          [
            1160,
            846
          ],
          [
            1399,
            850
          ],
          [
            1391,
            974
          ],
          [
            1169,
            969
          ]
        ]
      },
      {
        "type": "poly",
        "label": "15B",
        "points": [
          [
            1443,
            850
          ],
          [
            1706,
            850
          ],
          [
            1706,
            1087
          ],
          [
            1443,
            1087
          ]
        ]
      },
      {
        "type": "poly",
        "label": "11",
        "points": [
          [
            2308,
            846
          ],
          [
            2551,
            846
          ],
          [
            2551,
            1068
          ],
          [
            2308,
            1068
          ]
        ]
      },
      {
        "type": "circle",
        "label": "fontana grande",
        "x": 751,
        "y": 1309,
        "r": 56
      },
      {
        "type": "circle",
        "label": "fontana piccola",
        "x": 1440,
        "y": 1463,
        "r": 42
      },
      {
        "type": "circle",
        "label": "vasca 1",
        "x": 2294,
        "y": 1456,
        "r": 42
      },
      {
        "type": "poly",
        "label": "32",
        "points": [
          [
            1693,
            1181
          ],
          [
            2194,
            1181
          ],
          [
            2194,
            1433
          ],
          [
            1693,
            1433
          ]
        ]
      },
      {
        "type": "circle",
        "label": "35",
        "x": 1852,
        "y": 1448,
        "r": 84
      },
      {
        "type": "circle",
        "label": "36",
        "x": 2438,
        "y": 1576,
        "r": 84
      },
      {
        "type": "poly",
        "label": "33",
        "points": [
          [
            2528,
            1542
          ],
          [
            2821,
            1542
          ],
          [
            2821,
            1775
          ],
          [
            2528,
            1775
          ]
        ]
      },
      {
        "type": "poly",
        "label": "26",
        "points": [
          [
            3074,
            1497
          ],
          [
            3400,
            1497
          ],
          [
            3400,
            1786
          ],
          [
            3074,
            1786
          ]
        ]
      },
      {
        "type": "poly",
        "label": "27",
        "points": [
          [
            2762,
            997
          ],
          [
            2990,
            997
          ],
          [
            2990,
            1286
          ],
          [
            2762,
            1286
          ]
        ]
      },
      {
        "type": "poly",
        "label": "28",
        "points": [
          [
            3133,
            1072
          ],
          [
            3445,
            1072
          ],
          [
            3445,
            1474
          ],
          [
            3133,
            1474
          ]
        ]
      },
      {
        "type": "circle",
        "label": "29",
        "x": 3578,
        "y": 1640,
        "r": 98
      },
      {
        "type": "poly",
        "label": "34",
        "points": [
          [
            332,
            1813
          ],
          [
            1115,
            1813
          ],
          [
            1115,
            2110
          ],
          [
            332,
            2110
          ]
        ]
      },
      {
        "type": "poly",
        "label": "31",
        "points": [
          [
            1469,
            1798
          ],
          [
            2392,
            1880
          ],
          [
            2665,
            2076
          ],
          [
            2291,
            2313
          ],
          [
            1502,
            2234
          ]
        ]
      },
      {
        "type": "poly",
        "label": "25",
        "points": [
          [
            3364,
            948
          ],
          [
            3809,
            948
          ],
          [
            3809,
            1407
          ],
          [
            3364,
            1407
          ]
        ]
      },
      {
        "type": "circle",
        "label": "lanterna mini",
        "x": 3965,
        "y": 1132,
        "r": 63
      }
    ],
    "hotspots": [],
    "gates": [
      {
        "id": "to-nord",
        "type": "area",
        "x": -222,
        "y": 736,
        "w": 290,
        "h": 1230,
        "target": "nord",
        "targetGate": "to-sud",
        "message": "Area Nord"
      },
      {
        "id": "boat-sud",
        "type": "boat",
        "x": 2488,
        "y": 647,
        "w": 120,
        "h": 120,
        "target": "nord",
        "targetGate": "boat-nord",
        "message": "Battello · Stazione B"
      },
      {
        "id": "exit-sud",
        "type": "exit",
        "x": 2605,
        "y": 2276,
        "w": 120,
        "h": 120,
        "action": "return-to-games",
        "message": "Uscita dall'Esposizione"
      }
    ],
    "decor": []
  }
};
})();

/* SYNC_MAPPE_OFFLINE */
(function(){
  Object.assign(window.EsposizioneAreas['nord'], {"areaId":"nord","width":3348,"height":2565,"spawn":{"x":2556,"y":1728},"walkable":[[[331,236],[819,404],[894,220],[1500,413],[1875,482],[2307,486],[2341,367],[2515,367],[2544,499],[2688,497],[2686,671],[2693,2128],[1276,2138],[620,2054],[337,1911],[8,1666],[48,1331],[245,574]]],"obstacles":[{"type":"poly","label":"24","points":[[378,284],[766,435],[714,604],[320,463]]},{"type":"poly","label":"14","points":[[928,458],[1396,607],[1362,796],[864,640]]},{"type":"poly","label":"16","points":[[1500,635],[2061,770],[2013,957],[1436,827]]},{"type":"poly","label":"4","points":[[895,789],[1137,887],[1093,1060],[838,977]]},{"type":"poly","label":"5-3","points":[[1240,1138],[1426,1184],[1268,1605],[1084,1548]]},{"type":"circle","label":"40","x":1736,"y":1219,"r":130},{"type":"circle","label":"38","x":1640,"y":1574,"r":119},{"type":"poly","label":"2","points":[[934,1678],[1054,1688],[1055,1835],[935,1837]]},{"type":"circle","label":"22","x":577,"y":1793,"r":122},{"type":"poly","label":"8","points":[[148,1564],[283,1620],[217,1791],[71,1696]]},{"type":"poly","label":"36","points":[[890,1901],[1195,1916],[1202,2036],[885,2026]]},{"type":"poly","label":"1","points":[[1263,1816],[2013,1819],[2013,2044],[1266,2041]]},{"type":"poly","label":"editor","points":[[1766,1431],[1878,1668],[2019,1539],[1881,1391],[1828,1417],[1773,1429],[1766,1433]]},{"type":"poly","label":"editor","points":[[1919,1357],[1956,1312],[1984,1239],[2067,1242],[2067,1481],[2056,1506],[1922,1361]]},{"type":"poly","label":"editor","points":[[1916,1713],[2052,1580],[2061,1598],[2058,1770],[1922,1771],[1917,1741]]},{"type":"poly","label":"editor","points":[[2123,1639],[2196,1634],[2200,1768],[2123,1767],[2119,1638]]},{"type":"poly","label":"editor","points":[[2068,2061],[2067,1829],[2203,1828],[2206,1891],[2180,1899],[2180,1944],[2189,1987],[2163,2011],[2138,2045],[2118,2068],[2062,2066]]},{"type":"poly","label":"editor","points":[[2113,1190],[2178,1189],[2178,1102],[2143,1094],[2130,1079],[2116,1077],[2114,1190]]},{"type":"poly","label":"editor","points":[[2250,1707],[2249,1428],[2293,1426],[2294,1712],[2254,1709]]},{"type":"poly","label":"editor","points":[[2247,1376],[2247,1241],[2294,1241],[2296,1377]]},{"type":"poly","label":"editor","points":[[2248,983],[2249,1187],[2302,1192],[2300,985]]},{"type":"poly","label":"editor","points":[[2249,784],[2249,931],[2299,934],[2298,783]]},{"type":"poly","label":"editor","points":[[2075,972],[2116,977],[2126,941],[2162,920],[2179,922],[2188,796],[2123,781]]},{"type":"poly","label":"editor","points":[[1957,1106],[2038,1037],[2065,1075],[2065,1190],[1983,1186],[1974,1145]]},{"type":"poly","label":"editor","points":[[1232,1759],[1868,1766],[1854,1740],[1598,1746],[1499,1735],[1318,1672]]},{"type":"poly","label":"editor","points":[[1372,1623],[1520,1678],[1554,1685],[1558,1674],[1526,1618],[1531,1531],[1571,1481],[1615,1462],[1666,1460],[1709,1468],[1732,1491],[1759,1606],[1707,1690],[1832,1685],[1705,1436],[1603,1405]]},{"type":"poly","label":"editor","points":[[1371,1556],[1474,1246],[1488,1249],[1504,1293],[1531,1344],[1555,1365]]},{"type":"poly","label":"editor","points":[[2540,787],[2595,784],[2590,936],[2543,937]]},{"type":"poly","label":"editor","points":[[2541,987],[2589,991],[2589,1190],[2544,1190]]},{"type":"poly","label":"editor","points":[[2541,1242],[2592,1244],[2587,1382],[2543,1382]]},{"type":"poly","label":"editor","points":[[2539,1430],[2590,1429],[2593,1572],[2537,1571]]},{"type":"poly","label":"editor","points":[[2681,1770],[2638,1767],[2639,1640],[2740,1640],[2743,1772]]},{"type":"poly","label":"editor","points":[[2239,2022],[2594,2032],[2593,1781],[2536,1781],[2530,1858],[2472,1857],[2425,1795],[2393,1791],[2388,1829],[2353,1859],[2299,1862],[2298,1781],[2257,1755],[2237,1785]]},{"type":"poly","label":"editor","points":[[720,721],[542,1558],[50,1399],[60,1330],[319,595]]},{"type":"poly","label":"editor","points":[[2634,1836],[2637,1895],[2659,1928],[2643,1989],[2675,2035],[2684,2109],[2778,2112],[2777,1838]]}],"hotspots":[{"id":"sport","x":627,"y":1088,"r":130,"title":"Campo sportivo","text":"Qui entreranno i giochi dedicati agli sport d’epoca e ai giochi da tavolo. Per ora è un punto interattivo di prova."},{"id":"bellearti","x":1903,"y":1213,"r":122,"title":"Palazzo delle Belle Arti","text":"Questo padiglione ospiterà quiz, curiosità artistiche ed Easter egg. Collegamento ai minigiochi in arrivo."},{"id":"hotspot-1790363340218","x":1732,"y":1370,"r":110,"title":"40. Palazzo delle Belle Arti","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363345918","x":1737,"y":1061,"r":110,"title":"40. Palazzo delle Belle Arti","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363352923","x":1735,"y":926,"r":110,"title":"40. Palazzo delle Belle Arti","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363358045","x":1582,"y":1211,"r":110,"title":"40. Palazzo delle Belle Arti","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363376264","x":1768,"y":1569,"r":110,"title":"38. Lanterna in miniatura","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363398217","x":1658,"y":1801,"r":110,"title":"1. Galleria dell\u0027Industria Alimentare","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363414169","x":1044,"y":1897,"r":110,"title":"36. Montagne Russe","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363434569","x":1341,"y":1503,"r":110,"title":"3. Padiglione della città di Genova","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363448490","x":1324,"y":1135,"r":110,"title":"5. Padiglione degustazione","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363463228","x":1974,"y":761,"r":110,"title":"16. Galleria macchinari idraulici","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363485180","x":1100,"y":737,"r":110,"title":"14. Galleria dell\u0027Agricoltura","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363509817","x":970,"y":1028,"r":110,"title":"4. Galleria delle Colonie","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363534260","x":661,"y":1613,"r":110,"title":"22. Padiglione del giornalismo","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363539720","x":707,"y":1753,"r":110,"title":"22. Padiglione del giornalismo","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363544684","x":566,"y":1849,"r":110,"title":"22. Padiglione del giornalismo","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363562467","x":214,"y":1561,"r":110,"title":"8. Pallone aerostatico","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363573580","x":273,"y":1709,"r":110,"title":"8. Pallone aerostatico","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363603763","x":1167,"y":1584,"r":110,"title":"2. Padiglione di Chimica e Farmacia","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363613146","x":1041,"y":1665,"r":110,"title":"2. Padiglione di Chimica e Farmacia","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363645096","x":514,"y":539,"r":110,"title":"24. Area fumatori","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363649161","x":761,"y":524,"r":110,"title":"24. Area fumatori","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363665594","x":490,"y":642,"r":110,"title":"25. Campo sportivo","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363673057","x":301,"y":1472,"r":110,"title":"25. Campo sportivo","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790363685605","x":203,"y":906,"r":110,"title":"25. Campo sportivo","text":"Hotspot di prova creato in Modalità Test."},{"id":"hotspot-1790365386756","x":1582,"y":1706,"r":110,"title":"38. Lanterna in miniatura","text":"Hotspot di prova creato in Modalità Test."}],"gates":[{"id":"to-sud","type":"area","x":2683,"y":764,"w":351,"h":1170,"target":"sud","targetGate":"to-nord","message":"Area Sud"},{"id":"boat-nord","type":"boat","x":2367,"y":312,"w":120,"h":120,"target":"sud","targetGate":"boat-sud","message":"Battello · Stazione A"},{"id":"exit-nord","type":"exit","x":2365,"y":2068,"w":120,"h":120,"action":"return-to-games","message":"Uscita dall\u0027Esposizione"}]});
  window.EsposizioneAreas['nord'].decor = [{"id":"palma-1791484505655","kind":"palm","type":"ysort","asset":"images/decor/centrale/palms/palma_01_01.png","x":2565,"y":1376,"width":160,"height":218,"anchorX":0.5,"anchorY":0.95,"scale":1,"rotation":0,"collisionRadius":13,"animation":{"frames":["images/decor/centrale/palms/palma_01_01.png","images/decor/centrale/palms/palma_01_02.png","images/decor/centrale/palms/palma_01_03.png"],"fps":2}},{"id":"fontana-2-1791490647636","kind":"fountain","variant":"fontana_02","type":"fountain","asset":"images/decor/centrale/fountains/fontana_02_01.png","x":2423,"y":1591,"width":190,"height":170,"anchorX":0.5,"anchorY":1,"scale":1,"rotation":0,"collisionRadius":0,"basinRadius":73.5,"depthCut":0.3,"animation":{"frames":["images/decor/centrale/fountains/fontana_02_01.png","images/decor/centrale/fountains/fontana_02_02.png","images/decor/centrale/fountains/fontana_02_03.png"],"fps":3},"basinRadiusY":47},{"id":"fontana-2-1791492134337","kind":"fountain","variant":"fontana_02","type":"fountain","asset":"images/decor/centrale/fountains/fontana_02_01.png","x":2415,"y":1124,"width":190,"height":170,"anchorX":0.5,"anchorY":1,"scale":1,"rotation":0,"collisionRadius":0,"basinRadius":78,"basinRadiusY":57,"basinOffsetY":-70,"depthCut":0.3,"animation":{"frames":["images/decor/centrale/fountains/fontana_02_01.png","images/decor/centrale/fountains/fontana_02_02.png","images/decor/centrale/fountains/fontana_02_03.png"],"fps":3}}];
  Object.assign(window.EsposizioneAreas['sud'], {"areaId":"sud","width":4251,"height":2565,"spawn":{"x":260,"y":1500},"walkable":[[[0,700],[2594,700],[4225,812],[4248,1647],[3738,2407],[2665,2486],[1560,2452],[0,2332]]],"obstacles":[{"type":"poly","label":"16","points":[[280,839],[1128,839],[1127,947],[286,966]]},{"type":"poly","label":"15A","points":[[1160,846],[1399,850],[1391,974],[1169,969]]},{"type":"poly","label":"15B","points":[[1443,850],[1706,850],[1706,1087],[1443,1087]]},{"type":"poly","label":"11","points":[[2308,846],[2551,846],[2551,1068],[2308,1068]]},{"type":"circle","label":"fontana grande","x":751,"y":1309,"r":56},{"type":"circle","label":"fontana piccola","x":1440,"y":1463,"r":42},{"type":"circle","label":"vasca 1","x":2294,"y":1456,"r":42},{"type":"poly","label":"32","points":[[1693,1181],[2194,1181],[2194,1433],[1693,1433]]},{"type":"circle","label":"35","x":1852,"y":1448,"r":84},{"type":"circle","label":"36","x":2438,"y":1576,"r":84},{"type":"poly","label":"33","points":[[2528,1542],[2821,1542],[2821,1775],[2528,1775]]},{"type":"poly","label":"26","points":[[3074,1497],[3400,1497],[3400,1786],[3074,1786]]},{"type":"poly","label":"27","points":[[2762,997],[2990,997],[2990,1286],[2762,1286]]},{"type":"poly","label":"28","points":[[3133,1072],[3445,1072],[3445,1474],[3133,1474]]},{"type":"circle","label":"29","x":3578,"y":1640,"r":98},{"type":"poly","label":"34","points":[[332,1813],[1115,1813],[1115,2110],[332,2110]]},{"type":"poly","label":"31","points":[[1469,1798],[2392,1880],[2665,2076],[2291,2313],[1502,2234]]},{"type":"poly","label":"25","points":[[3364,948],[3809,948],[3809,1407],[3364,1407]]},{"type":"circle","label":"lanterna mini","x":3965,"y":1132,"r":63}],"hotspots":[],"gates":[{"id":"to-nord","type":"area","x":-222,"y":736,"w":290,"h":1230,"target":"nord","targetGate":"to-sud","message":"Area Nord"},{"id":"boat-sud","type":"boat","x":2488,"y":647,"w":120,"h":120,"target":"nord","targetGate":"boat-nord","message":"Battello · Stazione B"},{"id":"exit-sud","type":"exit","x":2605,"y":2276,"w":120,"h":120,"action":"return-to-games","message":"Uscita dall\u0027Esposizione"}]});
  window.EsposizioneAreas['sud'].decor = [];
})();
