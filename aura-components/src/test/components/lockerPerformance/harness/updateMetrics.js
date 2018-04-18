/* global _ */
/* exported updateMetrics */

var PENDING = "pending...";
var INVALID = "No significant difference";

var METRIC = {
  "18": "E",
  "15": "P",
  "12": "T",
  "9": "G",
  "6": "M",
  "3": "k",
  "0": "",
  "-3": "m",
  "-6": "µ",
  "-9": "n",
  "-12": "p",
  "-15": "f",
  "-18": "a"
};

function formatSI(num) {
  if (num === 0) {
    return "0";
  }
  var sign = num < 0 ? "-" : "+";
  num = Math.abs(num);
  var scale = 0;
  while (num >= 1000 && scale < 18) {
    num /= 1000;
    scale += 3;
  }
  while (num < 1 && scale > -18) {
    num *= 1000;
    scale -= 3;
  }
  return sign + parseFloat(num.toFixed(num > 1000 ? 0 : 3)) + METRIC[scale];
}

function speed(bench) {
  if (bench.aborted) {
    return bench.error && bench.error.stack;
  }
  if (!bench.hz > 0) {
    return PENDING;
  }
  if (bench.hz === Infinity) {
    return Infinity;
  }

  var hz = bench.hz;
  var time = 1 / hz;
  var stats = bench.stats;
  var rme = stats.rme;
  var moe = 1 / stats.moe;
  var sample = stats.sample;
  var size = sample.length;

  return "{hz} ops/s ±{rme}%\n{time}s ±{rme}%\n({size} samples)"
    .replace("{hz}", hz.toFixed(hz < 100 ? 2 : 0))
    .replace("{rme}", rme.toFixed(1))
    .replace("{time}", formatSI(time))
    .replace("{rme}", rme.toFixed(1))
    .replace("{size}", size);
}

function getScore(xA, sampleB) {
  return _.reduce(
    sampleB,
    function(total, xB) {
      return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
    },
    0
  );
}

function getU(sampleA, sampleB) {
  return _.reduce(
    sampleA,
    function(total, xA) {
      return total + getScore(xA, sampleB);
    },
    0
  );
}

function getZ(U, sizeA, sizeB) {
  return (
    (U - sizeA * sizeB / 2) /
    Math.sqrt(sizeA * sizeB * (sizeA + sizeB + 1) / 12)
  );
}

/**
 * Critical Mann-Whitney U-values for 95% confidence.
 * For more info see http://www.saburchill.com/IBbiology/stats/003.html.
 */
var UTable = {
  "5": [0, 1, 2],
  "6": [1, 2, 3, 5],
  "7": [1, 3, 5, 6, 8],
  "8": [2, 4, 6, 8, 10, 13],
  "9": [2, 4, 7, 10, 12, 15, 17],
  "10": [3, 5, 8, 11, 14, 17, 20, 23],
  "11": [3, 6, 9, 13, 16, 19, 23, 26, 30],
  "12": [4, 7, 11, 14, 18, 22, 26, 29, 33, 37],
  "13": [4, 8, 12, 16, 20, 24, 28, 33, 37, 41, 45],
  "14": [5, 9, 13, 17, 22, 26, 31, 36, 40, 45, 50, 55],
  "15": [5, 10, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64],
  "16": [6, 11, 15, 21, 26, 31, 37, 42, 47, 53, 59, 64, 70, 75],
  "17": [6, 11, 17, 22, 28, 34, 39, 45, 51, 57, 63, 67, 75, 81, 87],
  "18": [7, 12, 18, 24, 30, 36, 42, 48, 55, 61, 67, 74, 80, 86, 93, 99],
  "19": [7, 13, 19, 25, 32, 38, 45, 52, 58, 65, 72, 78, 85, 92, 99, 106, 113],
  "20": [
    8,
    14,
    20,
    27,
    34,
    41,
    48,
    55,
    62,
    69,
    76,
    83,
    90,
    98,
    105,
    112,
    119,
    127
  ],
  "21": [
    8,
    15,
    22,
    29,
    36,
    43,
    50,
    58,
    65,
    73,
    80,
    88,
    96,
    103,
    111,
    119,
    126,
    134,
    142
  ],
  "22": [
    9,
    16,
    23,
    30,
    38,
    45,
    53,
    61,
    69,
    77,
    85,
    93,
    101,
    109,
    117,
    125,
    133,
    141,
    150,
    158
  ],
  "23": [
    9,
    17,
    24,
    32,
    40,
    48,
    56,
    64,
    73,
    81,
    89,
    98,
    106,
    115,
    123,
    132,
    140,
    149,
    157,
    166,
    175
  ],
  "24": [
    10,
    17,
    25,
    33,
    42,
    50,
    59,
    67,
    76,
    85,
    94,
    102,
    111,
    120,
    129,
    138,
    147,
    156,
    165,
    174,
    183,
    192
  ],
  "25": [
    10,
    18,
    27,
    35,
    44,
    53,
    62,
    71,
    80,
    89,
    98,
    107,
    117,
    126,
    135,
    145,
    154,
    163,
    173,
    182,
    192,
    201,
    211
  ],
  "26": [
    11,
    19,
    28,
    37,
    46,
    55,
    64,
    74,
    83,
    93,
    102,
    112,
    122,
    132,
    141,
    151,
    161,
    171,
    181,
    191,
    200,
    210,
    220,
    230
  ],
  "27": [
    11,
    20,
    29,
    38,
    48,
    57,
    67,
    77,
    87,
    97,
    107,
    118,
    125,
    138,
    147,
    158,
    168,
    178,
    188,
    199,
    209,
    219,
    230,
    240,
    250
  ],
  "28": [
    12,
    21,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    101,
    111,
    122,
    132,
    143,
    154,
    164,
    175,
    186,
    196,
    207,
    218,
    228,
    239,
    250,
    261,
    272
  ],
  "29": [
    13,
    22,
    32,
    42,
    52,
    62,
    73,
    83,
    94,
    105,
    116,
    127,
    138,
    149,
    160,
    171,
    182,
    193,
    204,
    215,
    226,
    238,
    249,
    260,
    271,
    282,
    294
  ],
  "30": [
    13,
    23,
    33,
    43,
    54,
    65,
    76,
    87,
    98,
    109,
    120,
    131,
    143,
    154,
    166,
    177,
    189,
    200,
    212,
    223,
    235,
    247,
    258,
    270,
    282,
    293,
    305,
    317
  ]
};

function getUCritical(maxSize, minSize) {
  return maxSize < 5 || minSize < 3 ? 0 : UTable[maxSize][minSize - 3];
}

function compare(suite) {
  var bench0 = suite[0];
  var bench1 = suite[1];

  if (!bench0.hz > 0 || !bench1.hz > 0) {
    return PENDING;
  }

  var stats0 = bench0.stats;
  var stats1 = bench1.stats;
  var U0 = stats0.U;
  var U1 = stats1.U;
  var sample0 = stats0.sample;
  var sample1 = stats1.sample;
  var size0 = sample0.length;
  var size1 = sample1.length;

  if (!U0) {
    stats0.U = U0 = getU(sample0, sample1);
  }
  if (!U1) {
    stats1.U = U1 = getU(sample1, sample0);
  }

  var U = Math.min(U0, U1);
  var maxSize = Math.max(size0, size1);
  var minSize = Math.min(size0, size1);

  // The Mann-Whitney U-Test
  // https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test

  // Null hypothesis (Ho): there is no difference between the two
  // sample sets, they come from the same population.
  var reason;
  if (size0 + size1 > 30) {
    // When the sample size is greater than approximately 30,
    // the Mann-Whitney U statistic follows the z distribution.
    // - Reject Ho when the z-stat is greater than 1.96 or less than -1.96.
    // - Reject the test otherwise.
    var zStat = getZ(U, size0, size1);
    reason = "(require |z| > 1.96, got z = {zStat})".replace(
      "{zStat}",
      zStat.toFixed(2)
    );
    if (!(Math.abs(zStat) > 1.96)) {
      return "{message}\n{reason}"
        .replace("{message}", INVALID)
        .replace("{reason}", reason);
    }
  } else {
    // When the sample size is small, use the table of critical values.
    // - Reject Ho when the U value is less than or equal to the critical U value.
    // - Reject the test otherwise.
    var UCritical = getUCritical(maxSize, minSize);
    reason = "(require U <= Uc, got U = {U} and Uc = {critical})"
      .replace("{U}", U.toFixed(2))
      .replace("{UCritical}", UCritical.toFixed(2));
    if (!(U <= UCritical)) {
      return "{message}\n{reason}"
        .replace("{message}", INVALID)
        .replace("{reason}", reason);
    }
  }

  var fast = U === U0 ? 0 : 1;
  var name = suite[fast].name;
  var ratio = suite[fast].hz / suite[1 - fast].hz;
  var rme = suite[0].stats.rme + suite[1].stats.rme;
  var time = 1 / suite[1 - fast].hz - 1 / suite[fast].hz;

  return "{name} {ratio}x ±{rme}%\n{time}s ±{rme}%\n{reason}"
    .replace("{name}", name)
    .replace("{ratio}", ratio.toFixed(2))
    .replace("{rme}", rme.toFixed(1))
    .replace("{time}", formatSI(time))
    .replace("{rme}", rme.toFixed(1))
    .replace("{reason}", reason);
}

function updateMetrics(test) {
  var suite = test.suite;
  test.bench0 = speed(suite[0]);
  test.bench1 = speed(suite[1]);
  test.compare = compare(suite);
}
