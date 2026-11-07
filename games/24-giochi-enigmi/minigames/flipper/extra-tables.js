/* Copie indipendenti della tavola base, disponibili anche offline con file://. */
window.EsposizioneFlipperExtraTables=[
  {
    "id": 2,
    "name": "Tavola Test 2",
    "objects": [
      {
        "id": "B1",
        "type": "bumper",
        "label": "Bumper alto sinistra",
        "x": 125,
        "y": 205,
        "r": 26,
        "score": 100
      },
      {
        "id": "B2",
        "type": "bumper",
        "label": "Bumper alto destra",
        "x": 299,
        "y": 210,
        "r": 26,
        "score": 100
      },
      {
        "id": "B3",
        "type": "bumper",
        "label": "Bumper centrale",
        "x": 211.9,
        "y": 335.1,
        "r": 29,
        "score": 150
      },
      {
        "id": "T1",
        "type": "target",
        "label": "Target sinistro",
        "x": 76,
        "y": 335,
        "w": 17,
        "h": 64,
        "score": 50
      },
      {
        "id": "T2",
        "type": "target",
        "label": "Target destro",
        "x": 348,
        "y": 335,
        "w": 17,
        "h": 64,
        "score": 50
      },
      {
        "id": "P1",
        "type": "post",
        "label": "Piolo sinistro",
        "x": 83,
        "y": 660,
        "r": 12
      },
      {
        "id": "P2",
        "type": "post",
        "label": "Piolo destro",
        "x": 356,
        "y": 660,
        "r": 12
      },
      {
        "id": "R1",
        "type": "rail",
        "label": "Tavola 1",
        "x": 78,
        "y": 129.6,
        "x2": 175.7,
        "y2": 163.4
      },
      {
        "id": "R2",
        "type": "rail",
        "label": "Guida superiore destra",
        "x": 401.7,
        "y": 147.9,
        "x2": 363,
        "y2": 98
      },
      {
        "id": "S1",
        "type": "slingshot",
        "label": "Slingshot sinistro",
        "x": 8,
        "y": 680,
        "x2": 112,
        "y2": 766
      },
      {
        "id": "S2",
        "type": "slingshot",
        "label": "Slingshot destro",
        "x": 399.9,
        "y": 681,
        "x2": 328,
        "y2": 766
      },
      {
        "id": "F1",
        "type": "flipper",
        "label": "Paletta sinistra",
        "x": 112,
        "y": 765,
        "length": 80,
        "angle": 0.3141592653589793,
        "side": "left"
      },
      {
        "id": "F2",
        "type": "flipper",
        "label": "Paletta destra",
        "x": 328,
        "y": 765,
        "length": 80,
        "angle": 2.827433388230814,
        "side": "right"
      },
      {
        "id": "L1",
        "type": "launcher",
        "label": "Canale di lancio",
        "x": 401,
        "y": 165,
        "x2": 401,
        "y2": 810
      },
      {
        "id": "R2_copia",
        "type": "rail",
        "label": "Guida superiore destra copia",
        "x": 401.7,
        "y": 814.3,
        "x2": 401.7,
        "y2": 146.1
      },
      {
        "id": "B3_copia",
        "type": "bumper",
        "label": "Bumper centrale copia",
        "x": 214.6,
        "y": 497.5,
        "r": 29,
        "score": 150
      }
    ],
    "playfield": {
      "left": 8,
      "right": 432,
      "top": 8,
      "bottom": 832
    },
    "manifest": {
      "format": "colombiadi-flipper-assets",
      "version": 1,
      "table": 2,
      "theme": "test-2",
      "board": {
        "width": 440,
        "height": 840
      },
      "assets": {
        "ball": "assets/tavola-02-test/common/ball/cannonball.svg",
        "B1": "assets/tavola-02-test/bumpers/bumper_ship_large_01.svg",
        "B2": "assets/tavola-02-test/bumpers/bumper_ship_large_02.svg",
        "B3": "assets/tavola-02-test/bumpers/bumper_ship_large_03.svg",
        "B3_copia": "assets/tavola-02-test/bumpers/bumper_ship_large_04.svg",
        "T1": "assets/tavola-02-test/targets/target_ship_small_left.svg",
        "T2": "assets/tavola-02-test/targets/target_ship_small_right.svg",
        "P1": "assets/tavola-02-test/posts/post_rock_left.svg",
        "P2": "assets/tavola-02-test/posts/post_rock_right.svg",
        "R1": "assets/tavola-02-test/rails/rail_rock_upper_left.svg",
        "R2": "assets/tavola-02-test/rails/rail_rock_upper_right.svg",
        "R2_copia": "assets/tavola-02-test/rails/rail_rock_vertical_right.svg",
        "S1": "assets/tavola-02-test/slingshots/slingshot_wall_left.svg",
        "S2": "assets/tavola-02-test/slingshots/slingshot_wall_right.svg",
        "F1": "assets/tavola-02-test/flippers/flipper_left_wood.svg",
        "F2": "assets/tavola-02-test/flippers/flipper_right_wood.svg",
        "L1": "assets/tavola-02-test/shooter-lane/shooter_lane_wood_right.svg",
        "background": "assets/tavola-02-test/background/table_background.svg",
        "inlane_left": "assets/tavola-02-test/inlanes/inlane_left_wood.svg",
        "inlane_right": "assets/tavola-02-test/inlanes/inlane_right_wood.svg",
        "outlane_left": "assets/tavola-02-test/outlanes/outlane_left_wood.svg",
        "outlane_right": "assets/tavola-02-test/outlanes/outlane_right_wood.svg",
        "launcherCannon": "assets/tavola-02-test/shooter-lane/launcher_cannon.png"
      },
      "notes": "Indica i file .svg provvisori: il gioco cerca automaticamente prima il .png omonimo nella stessa cartella, poi ripiega sul .svg. Funziona anche offline con file://. Geometria e collisioni non cambiano."
    },
    "manifestPath": "manifest/tavola-02-assets.json",
    "audio": {
      "music": "audio/tavola-02/music/battaglia_1684.mp3",
      "launch": "audio/tavola-02/sfx/lancio.mp3",
      "bumper": "audio/tavola-02/sfx/bumper.mp3",
      "target": "audio/tavola-02/sfx/target.mp3"
    },
    "physics": {
      "gravity": 620,
      "restitution": 0.87,
      "wall": 17,
      "ballRadius": 8
    },
    "flipperPhysics": {
      "stroke": 0.63,
      "liftSpeed": 8,
      "returnSpeed": 5,
      "radius": 11,
      "restitution": 0.28,
      "restSpeed": 45,
      "friction": 0.08
    }
  },
  {
    "id": 3,
    "name": "Tavola Test 3",
    "objects": [
      {
        "id": "B1",
        "type": "bumper",
        "label": "Bumper alto sinistra",
        "x": 125,
        "y": 205,
        "r": 26,
        "score": 100
      },
      {
        "id": "B2",
        "type": "bumper",
        "label": "Bumper alto destra",
        "x": 299,
        "y": 210,
        "r": 26,
        "score": 100
      },
      {
        "id": "B3",
        "type": "bumper",
        "label": "Bumper centrale",
        "x": 211.9,
        "y": 335.1,
        "r": 29,
        "score": 150
      },
      {
        "id": "T1",
        "type": "target",
        "label": "Target sinistro",
        "x": 76,
        "y": 335,
        "w": 17,
        "h": 64,
        "score": 50
      },
      {
        "id": "T2",
        "type": "target",
        "label": "Target destro",
        "x": 348,
        "y": 335,
        "w": 17,
        "h": 64,
        "score": 50
      },
      {
        "id": "P1",
        "type": "post",
        "label": "Piolo sinistro",
        "x": 83,
        "y": 660,
        "r": 12
      },
      {
        "id": "P2",
        "type": "post",
        "label": "Piolo destro",
        "x": 356,
        "y": 660,
        "r": 12
      },
      {
        "id": "R1",
        "type": "rail",
        "label": "Tavola 1",
        "x": 78,
        "y": 129.6,
        "x2": 175.7,
        "y2": 163.4
      },
      {
        "id": "R2",
        "type": "rail",
        "label": "Guida superiore destra",
        "x": 401.7,
        "y": 147.9,
        "x2": 363,
        "y2": 98
      },
      {
        "id": "S1",
        "type": "slingshot",
        "label": "Slingshot sinistro",
        "x": 8,
        "y": 680,
        "x2": 112,
        "y2": 766
      },
      {
        "id": "S2",
        "type": "slingshot",
        "label": "Slingshot destro",
        "x": 399.9,
        "y": 681,
        "x2": 328,
        "y2": 766
      },
      {
        "id": "F1",
        "type": "flipper",
        "label": "Paletta sinistra",
        "x": 112,
        "y": 765,
        "length": 80,
        "angle": 0.3141592653589793,
        "side": "left"
      },
      {
        "id": "F2",
        "type": "flipper",
        "label": "Paletta destra",
        "x": 328,
        "y": 765,
        "length": 80,
        "angle": 2.827433388230814,
        "side": "right"
      },
      {
        "id": "L1",
        "type": "launcher",
        "label": "Canale di lancio",
        "x": 401,
        "y": 165,
        "x2": 401,
        "y2": 810
      },
      {
        "id": "R2_copia",
        "type": "rail",
        "label": "Guida superiore destra copia",
        "x": 401.7,
        "y": 814.3,
        "x2": 401.7,
        "y2": 146.1
      },
      {
        "id": "B3_copia",
        "type": "bumper",
        "label": "Bumper centrale copia",
        "x": 214.6,
        "y": 497.5,
        "r": 29,
        "score": 150
      }
    ],
    "playfield": {
      "left": 8,
      "right": 432,
      "top": 8,
      "bottom": 832
    },
    "manifest": {
      "format": "colombiadi-flipper-assets",
      "version": 1,
      "table": 3,
      "theme": "test-3",
      "board": {
        "width": 440,
        "height": 840
      },
      "assets": {
        "ball": "assets/tavola-03-test/common/ball/cannonball.svg",
        "B1": "assets/tavola-03-test/bumpers/bumper_ship_large_01.svg",
        "B2": "assets/tavola-03-test/bumpers/bumper_ship_large_02.svg",
        "B3": "assets/tavola-03-test/bumpers/bumper_ship_large_03.svg",
        "B3_copia": "assets/tavola-03-test/bumpers/bumper_ship_large_04.svg",
        "T1": "assets/tavola-03-test/targets/target_ship_small_left.svg",
        "T2": "assets/tavola-03-test/targets/target_ship_small_right.svg",
        "P1": "assets/tavola-03-test/posts/post_rock_left.svg",
        "P2": "assets/tavola-03-test/posts/post_rock_right.svg",
        "R1": "assets/tavola-03-test/rails/rail_rock_upper_left.svg",
        "R2": "assets/tavola-03-test/rails/rail_rock_upper_right.svg",
        "R2_copia": "assets/tavola-03-test/rails/rail_rock_vertical_right.svg",
        "S1": "assets/tavola-03-test/slingshots/slingshot_wall_left.svg",
        "S2": "assets/tavola-03-test/slingshots/slingshot_wall_right.svg",
        "F1": "assets/tavola-03-test/flippers/flipper_left_wood.svg",
        "F2": "assets/tavola-03-test/flippers/flipper_right_wood.svg",
        "L1": "assets/tavola-03-test/shooter-lane/shooter_lane_wood_right.svg",
        "background": "assets/tavola-03-test/background/table_background.svg",
        "inlane_left": "assets/tavola-03-test/inlanes/inlane_left_wood.svg",
        "inlane_right": "assets/tavola-03-test/inlanes/inlane_right_wood.svg",
        "outlane_left": "assets/tavola-03-test/outlanes/outlane_left_wood.svg",
        "outlane_right": "assets/tavola-03-test/outlanes/outlane_right_wood.svg",
        "launcherCannon": "assets/tavola-03-test/shooter-lane/launcher_cannon.png"
      },
      "notes": "Indica i file .svg provvisori: il gioco cerca automaticamente prima il .png omonimo nella stessa cartella, poi ripiega sul .svg. Funziona anche offline con file://. Geometria e collisioni non cambiano."
    },
    "manifestPath": "manifest/tavola-03-assets.json",
    "audio": {
      "music": "audio/tavola-03/music/battaglia_1684.mp3",
      "launch": "audio/tavola-03/sfx/lancio.mp3",
      "bumper": "audio/tavola-03/sfx/bumper.mp3",
      "target": "audio/tavola-03/sfx/target.mp3"
    },
    "physics": {
      "gravity": 620,
      "restitution": 0.87,
      "wall": 17,
      "ballRadius": 8
    },
    "flipperPhysics": {
      "stroke": 0.63,
      "liftSpeed": 8,
      "returnSpeed": 5,
      "radius": 11,
      "restitution": 0.28,
      "restSpeed": 45,
      "friction": 0.08
    }
  }
];
