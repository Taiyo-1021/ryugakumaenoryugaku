'use strict';

// ============================
// DATA
// ============================

const CATEGORY_LABELS = {
  'short': '短母音',
  'long': '長母音',
  'diphthong': '二重母音',
  'consonant-voiceless': '子音（無声）',
  'consonant-voiced': '子音（有声）',
  'nasal': '鼻音・接近音',
};

const phonemes = [
  // SHORT VOWELS (7)
  { symbol:'ɪ', display:'/ɪ/', category:'short', description:'口を軽く横に開き、短く「イ」', tip:'日本語の「イ」より口を少し開ける', examples:[{word:'bit',kana:'ビット'},{word:'sit',kana:'スィット'},{word:'fish',kana:'フィッシュ'}], mouth:{lipOpenness:0.28,lipWidth:0.72,tongueHeight:0.75,tongueBackness:0.25,rounded:false,animated:false} },
  { symbol:'e', display:'/e/', category:'short', description:'口を横に開き、短く「エ」', tip:'日本語の「エ」に近い', examples:[{word:'bed',kana:'ベッド'},{word:'red',kana:'レッド'},{word:'set',kana:'セット'}], mouth:{lipOpenness:0.40,lipWidth:0.70,tongueHeight:0.55,tongueBackness:0.25,rounded:false,animated:false} },
  { symbol:'æ', display:'/æ/', category:'short', description:'口を大きく横に開き「ア」と「エ」の間', tip:'日本語にない音。口をぐっと横に広げる', examples:[{word:'cat',kana:'キャット'},{word:'bad',kana:'バッド'},{word:'map',kana:'マップ'}], mouth:{lipOpenness:0.62,lipWidth:0.82,tongueHeight:0.25,tongueBackness:0.2,rounded:false,animated:false} },
  { symbol:'ʌ', display:'/ʌ/', category:'short', description:'口を自然に少し開き「ア」', tip:'力を抜いた「ア」。舌は口の中央', examples:[{word:'cup',kana:'カップ'},{word:'run',kana:'ラン'},{word:'but',kana:'バット'}], mouth:{lipOpenness:0.50,lipWidth:0.55,tongueHeight:0.35,tongueBackness:0.45,rounded:false,animated:false} },
  { symbol:'ɒ', display:'/ɒ/', category:'short', description:'口を大きく丸く開き「オ」', tip:'唇を丸めて、口を大きく開ける', examples:[{word:'hot',kana:'ホット'},{word:'dog',kana:'ドッグ'},{word:'top',kana:'トップ'}], mouth:{lipOpenness:0.72,lipWidth:0.42,tongueHeight:0.15,tongueBackness:0.7,rounded:true,animated:false} },
  { symbol:'ʊ', display:'/ʊ/', category:'short', description:'唇を軽く丸めて短く「ウ」', tip:'日本語の「ウ」より唇を丸める', examples:[{word:'book',kana:'ブック'},{word:'put',kana:'プット'},{word:'good',kana:'グッド'}], mouth:{lipOpenness:0.25,lipWidth:0.32,tongueHeight:0.70,tongueBackness:0.75,rounded:true,animated:false} },
  { symbol:'ə', display:'/ə/', category:'short', description:'力を抜いてあいまいに「ア」（シュワ）', tip:'最も多い英語の音。強勢のない音節に現れる', examples:[{word:'about',kana:'アバウト'},{word:'sofa',kana:'ソーファ'},{word:'again',kana:'アゲン'}], mouth:{lipOpenness:0.38,lipWidth:0.52,tongueHeight:0.45,tongueBackness:0.50,rounded:false,animated:false} },

  // LONG VOWELS (5)
  { symbol:'iː', display:'/iː/', category:'long', description:'口を横に大きく開き「イー」と伸ばす', tip:'笑顔の口。舌を前上に押し上げる', examples:[{word:'see',kana:'スィー'},{word:'feet',kana:'フィート'},{word:'tree',kana:'トゥリー'}], mouth:{lipOpenness:0.18,lipWidth:0.88,tongueHeight:0.90,tongueBackness:0.20,rounded:false,animated:false} },
  { symbol:'ɑː', display:'/ɑː/', category:'long', description:'口を大きく縦に開き「アー」と伸ばす', tip:'医者に「あー」と言うときの口', examples:[{word:'car',kana:'カー'},{word:'far',kana:'ファー'},{word:'star',kana:'スター'}], mouth:{lipOpenness:0.88,lipWidth:0.60,tongueHeight:0.08,tongueBackness:0.80,rounded:false,animated:false} },
  { symbol:'ɔː', display:'/ɔː/', category:'long', description:'唇を丸めて「オー」と伸ばす', tip:'丸い口で「オー」。口をすぼめる', examples:[{word:'law',kana:'ロー'},{word:'four',kana:'フォー'},{word:'more',kana:'モー'}], mouth:{lipOpenness:0.50,lipWidth:0.38,tongueHeight:0.55,tongueBackness:0.75,rounded:true,animated:false} },
  { symbol:'uː', display:'/uː/', category:'long', description:'唇をしっかり丸めて「ウー」と伸ばす', tip:'「ウ」と口笛を吹くときの口', examples:[{word:'too',kana:'トゥー'},{word:'food',kana:'フード'},{word:'blue',kana:'ブルー'}], mouth:{lipOpenness:0.18,lipWidth:0.22,tongueHeight:0.88,tongueBackness:0.85,rounded:true,animated:false} },
  { symbol:'ɜː', display:'/ɜː/', category:'long', description:'口を少し開き「アー」と「ウー」の中間', tip:'唇を丸めず、口の中央で舌を浮かせる', examples:[{word:'bird',kana:'バード'},{word:'turn',kana:'ターン'},{word:'word',kana:'ワード'}], mouth:{lipOpenness:0.45,lipWidth:0.52,tongueHeight:0.55,tongueBackness:0.50,rounded:false,animated:false} },

  // DIPHTHONGS (8)
  { symbol:'eɪ', display:'/eɪ/', category:'diphthong', description:'「エ」から「イ」へ口を動かす', tip:'2つの音が滑らかにつながる二重母音', examples:[{word:'say',kana:'セイ'},{word:'day',kana:'デイ'},{word:'make',kana:'メイク'}], mouth:{lipOpenness:0.40,lipWidth:0.70,tongueHeight:0.55,tongueBackness:0.25,rounded:false,animated:true}, mouth2:{lipOpenness:0.22,lipWidth:0.82,tongueHeight:0.80,tongueBackness:0.2,rounded:false} },
  { symbol:'aɪ', display:'/aɪ/', category:'diphthong', description:'「ア」から「イ」へ口を動かす', tip:'口を大きく開けてから、にっこり笑顔へ', examples:[{word:'my',kana:'マイ'},{word:'fly',kana:'フライ'},{word:'time',kana:'タイム'}], mouth:{lipOpenness:0.80,lipWidth:0.65,tongueHeight:0.15,tongueBackness:0.40,rounded:false,animated:true}, mouth2:{lipOpenness:0.20,lipWidth:0.85,tongueHeight:0.85,tongueBackness:0.2,rounded:false} },
  { symbol:'ɔɪ', display:'/ɔɪ/', category:'diphthong', description:'「オ」から「イ」へ口を動かす', tip:'丸い口から笑顔へ変化する', examples:[{word:'boy',kana:'ボイ'},{word:'oil',kana:'オイル'},{word:'coin',kana:'コイン'}], mouth:{lipOpenness:0.50,lipWidth:0.38,tongueHeight:0.55,tongueBackness:0.75,rounded:true,animated:true}, mouth2:{lipOpenness:0.20,lipWidth:0.85,tongueHeight:0.85,tongueBackness:0.2,rounded:false} },
  { symbol:'aʊ', display:'/aʊ/', category:'diphthong', description:'「ア」から「ウ」へ口を動かす', tip:'口を大きく開けてから丸い口へ', examples:[{word:'now',kana:'ナウ'},{word:'how',kana:'ハウ'},{word:'out',kana:'アウト'}], mouth:{lipOpenness:0.80,lipWidth:0.65,tongueHeight:0.15,tongueBackness:0.40,rounded:false,animated:true}, mouth2:{lipOpenness:0.22,lipWidth:0.28,tongueHeight:0.75,tongueBackness:0.8,rounded:true} },
  { symbol:'əʊ', display:'/əʊ/', category:'diphthong', description:'「ア」から「ウ」へ（口をすぼめる）', tip:'中間の「ア」から唇を丸めながら移行', examples:[{word:'go',kana:'ゴウ'},{word:'home',kana:'ホウム'},{word:'know',kana:'ノウ'}], mouth:{lipOpenness:0.38,lipWidth:0.52,tongueHeight:0.45,tongueBackness:0.50,rounded:false,animated:true}, mouth2:{lipOpenness:0.20,lipWidth:0.24,tongueHeight:0.78,tongueBackness:0.82,rounded:true} },
  { symbol:'ɪə', display:'/ɪə/', category:'diphthong', description:'「イ」から「ア」へ口を動かす', tip:'口を狭くしてから広げる', examples:[{word:'near',kana:'ニア'},{word:'ear',kana:'イア'},{word:'here',kana:'ヒア'}], mouth:{lipOpenness:0.28,lipWidth:0.72,tongueHeight:0.75,tongueBackness:0.25,rounded:false,animated:true}, mouth2:{lipOpenness:0.38,lipWidth:0.52,tongueHeight:0.45,tongueBackness:0.5,rounded:false} },
  { symbol:'eə', display:'/eə/', category:'diphthong', description:'「エ」から「ア」へ口を動かす', tip:'横広の口から力を抜いてあいまいに', examples:[{word:'air',kana:'エア'},{word:'care',kana:'ケア'},{word:'there',kana:'ゼア'}], mouth:{lipOpenness:0.40,lipWidth:0.70,tongueHeight:0.55,tongueBackness:0.25,rounded:false,animated:true}, mouth2:{lipOpenness:0.38,lipWidth:0.52,tongueHeight:0.45,tongueBackness:0.5,rounded:false} },
  { symbol:'ʊə', display:'/ʊə/', category:'diphthong', description:'「ウ」から「ア」へ口を動かす', tip:'丸い口から力を抜いてあいまいに', examples:[{word:'tour',kana:'トゥア'},{word:'pure',kana:'ピュア'},{word:'sure',kana:'シュア'}], mouth:{lipOpenness:0.25,lipWidth:0.32,tongueHeight:0.70,tongueBackness:0.75,rounded:true,animated:true}, mouth2:{lipOpenness:0.38,lipWidth:0.52,tongueHeight:0.45,tongueBackness:0.5,rounded:false} },

  // CONSONANTS VOICELESS (9)
  { symbol:'p', display:'/p/', category:'consonant-voiceless', description:'唇をしっかり閉じて「パ」と破裂させる', tip:'声帯を振動させない。息を強く出す', examples:[{word:'pen',kana:'ペン'},{word:'cup',kana:'カップ'},{word:'stop',kana:'ストップ'}], mouth:{lipOpenness:0.0,lipWidth:0.55,tongueHeight:0.40,tongueBackness:0.40,rounded:false,animated:false} },
  { symbol:'t', display:'/t/', category:'consonant-voiceless', description:'舌先を上の歯茎につけて「タ」', tip:'舌先をはじいて息を出す。声帯振動なし', examples:[{word:'top',kana:'トップ'},{word:'get',kana:'ゲット'},{word:'hat',kana:'ハット'}], mouth:{lipOpenness:0.15,lipWidth:0.58,tongueHeight:0.90,tongueBackness:0.15,rounded:false,animated:false} },
  { symbol:'k', display:'/k/', category:'consonant-voiceless', description:'舌の奥を上顎に押しつけて「カ」', tip:'喉の奥で作る音。声帯振動なし', examples:[{word:'cat',kana:'キャット'},{word:'back',kana:'バック'},{word:'key',kana:'キー'}], mouth:{lipOpenness:0.18,lipWidth:0.58,tongueHeight:0.70,tongueBackness:0.88,rounded:false,animated:false} },
  { symbol:'f', display:'/f/', category:'consonant-voiceless', description:'上の歯を下唇に当てて「フ」', tip:'上の歯と下唇の隙間から息を出す', examples:[{word:'fat',kana:'ファット'},{word:'off',kana:'オフ'},{word:'phone',kana:'フォン'}], mouth:{lipOpenness:0.22,lipWidth:0.58,tongueHeight:0.35,tongueBackness:0.30,rounded:false,animated:false,teethOnLip:true} },
  { symbol:'θ', display:'/θ/', category:'consonant-voiceless', description:'舌先を軽く歯の間に挟んで「ス」', tip:'舌先を上下の歯の間に軽くはさむ', examples:[{word:'think',kana:'スィンク'},{word:'tooth',kana:'トゥース'},{word:'bath',kana:'バース'}], mouth:{lipOpenness:0.28,lipWidth:0.62,tongueHeight:0.45,tongueBackness:0.10,rounded:false,animated:false,tongueTip:true} },
  { symbol:'s', display:'/s/', category:'consonant-voiceless', description:'歯を軽く閉じて「ス」', tip:'上下の歯をほぼ閉じて息を流す', examples:[{word:'sun',kana:'サン'},{word:'kiss',kana:'キス'},{word:'rice',kana:'ライス'}], mouth:{lipOpenness:0.15,lipWidth:0.65,tongueHeight:0.68,tongueBackness:0.20,rounded:false,animated:false} },
  { symbol:'ʃ', display:'/ʃ/', category:'consonant-voiceless', description:'唇を少し丸めて「シュ」', tip:'「シー」という静かにするときの音', examples:[{word:'she',kana:'シー'},{word:'fish',kana:'フィッシュ'},{word:'rush',kana:'ラッシュ'}], mouth:{lipOpenness:0.20,lipWidth:0.42,tongueHeight:0.72,tongueBackness:0.35,rounded:true,animated:false} },
  { symbol:'tʃ', display:'/tʃ/', category:'consonant-voiceless', description:'舌を上顎に当ててから「チュ」', tip:'日本語の「チ」に似ている', examples:[{word:'chip',kana:'チップ'},{word:'match',kana:'マッチ'},{word:'beach',kana:'ビーチ'}], mouth:{lipOpenness:0.20,lipWidth:0.40,tongueHeight:0.78,tongueBackness:0.28,rounded:true,animated:false} },
  { symbol:'h', display:'/h/', category:'consonant-voiceless', description:'喉から息を吐いて「ハ」', tip:'息を出すだけ。日本語の「ハ行」に近い', examples:[{word:'hat',kana:'ハット'},{word:'ahead',kana:'アヘッド'},{word:'hill',kana:'ヒル'}], mouth:{lipOpenness:0.52,lipWidth:0.58,tongueHeight:0.35,tongueBackness:0.50,rounded:false,animated:false} },

  // CONSONANTS VOICED (8)
  { symbol:'b', display:'/b/', category:'consonant-voiced', description:'唇を閉じて「バ」と声を出す', tip:'/p/と同じ口の形だが、声帯を振動させる', examples:[{word:'bat',kana:'バット'},{word:'job',kana:'ジョブ'},{word:'rub',kana:'ラブ'}], mouth:{lipOpenness:0.0,lipWidth:0.55,tongueHeight:0.40,tongueBackness:0.40,rounded:false,animated:false} },
  { symbol:'d', display:'/d/', category:'consonant-voiced', description:'舌先を上の歯茎につけて「ダ」', tip:'/t/と同じ口だが、声帯を振動させる', examples:[{word:'dog',kana:'ドッグ'},{word:'bad',kana:'バッド'},{word:'mud',kana:'マッド'}], mouth:{lipOpenness:0.15,lipWidth:0.58,tongueHeight:0.90,tongueBackness:0.15,rounded:false,animated:false} },
  { symbol:'g', display:'/g/', category:'consonant-voiced', description:'舌の奥で「ガ」と声を出す', tip:'/k/と同じ口だが、声帯を振動させる', examples:[{word:'got',kana:'ゴット'},{word:'big',kana:'ビッグ'},{word:'egg',kana:'エッグ'}], mouth:{lipOpenness:0.18,lipWidth:0.58,tongueHeight:0.70,tongueBackness:0.88,rounded:false,animated:false} },
  { symbol:'v', display:'/v/', category:'consonant-voiced', description:'上の歯を下唇に当てて「ヴ」', tip:'/f/と同じ口だが、声帯を振動させる', examples:[{word:'van',kana:'ヴァン'},{word:'wave',kana:'ウェイヴ'},{word:'love',kana:'ラヴ'}], mouth:{lipOpenness:0.22,lipWidth:0.58,tongueHeight:0.35,tongueBackness:0.30,rounded:false,animated:false,teethOnLip:true} },
  { symbol:'ð', display:'/ð/', category:'consonant-voiced', description:'舌先を歯の間に挟んで「ズ」', tip:'/θ/と同じ口だが、声帯を振動させる', examples:[{word:'the',kana:'ザ'},{word:'this',kana:'ズィス'},{word:'mother',kana:'マザー'}], mouth:{lipOpenness:0.28,lipWidth:0.62,tongueHeight:0.45,tongueBackness:0.10,rounded:false,animated:false,tongueTip:true} },
  { symbol:'z', display:'/z/', category:'consonant-voiced', description:'歯を閉じて「ズ」と声を出す', tip:'/s/と同じ口だが、声帯を振動させる', examples:[{word:'zoo',kana:'ズー'},{word:'buzz',kana:'バズ'},{word:'rose',kana:'ローズ'}], mouth:{lipOpenness:0.15,lipWidth:0.65,tongueHeight:0.68,tongueBackness:0.20,rounded:false,animated:false} },
  { symbol:'ʒ', display:'/ʒ/', category:'consonant-voiced', description:'唇を丸めて「ジュ」と声を出す', tip:'/ʃ/と同じ口だが、声帯を振動させる', examples:[{word:'measure',kana:'メジャー'},{word:'vision',kana:'ヴィジョン'},{word:'beige',kana:'ベージュ'}], mouth:{lipOpenness:0.20,lipWidth:0.42,tongueHeight:0.72,tongueBackness:0.35,rounded:true,animated:false} },
  { symbol:'dʒ', display:'/dʒ/', category:'consonant-voiced', description:'「ヂュ」と声を出す', tip:'日本語の「ジ」に似ている', examples:[{word:'job',kana:'ジョブ'},{word:'bridge',kana:'ブリッジ'},{word:'age',kana:'エイジ'}], mouth:{lipOpenness:0.20,lipWidth:0.40,tongueHeight:0.78,tongueBackness:0.28,rounded:true,animated:false} },

  // NASALS & APPROXIMANTS (7)
  { symbol:'m', display:'/m/', category:'nasal', description:'唇を閉じて鼻から「ム」', tip:'「んー」と唇を閉じたまま声を出す', examples:[{word:'man',kana:'マン'},{word:'him',kana:'ヒム'},{word:'some',kana:'サム'}], mouth:{lipOpenness:0.0,lipWidth:0.55,tongueHeight:0.40,tongueBackness:0.40,rounded:false,animated:false} },
  { symbol:'n', display:'/n/', category:'nasal', description:'舌先を歯茎につけ鼻から「ン」', tip:'舌先を上の歯茎につけたまま鼻から声を出す', examples:[{word:'no',kana:'ノウ'},{word:'sun',kana:'サン'},{word:'can',kana:'キャン'}], mouth:{lipOpenness:0.15,lipWidth:0.58,tongueHeight:0.90,tongueBackness:0.15,rounded:false,animated:false} },
  { symbol:'ŋ', display:'/ŋ/', category:'nasal', description:'舌の奥を上顎につけ鼻から「ング」', tip:'「シング」の語尾の「ング」の音', examples:[{word:'sing',kana:'スィング'},{word:'ring',kana:'リング'},{word:'bank',kana:'バンク'}], mouth:{lipOpenness:0.18,lipWidth:0.55,tongueHeight:0.65,tongueBackness:0.88,rounded:false,animated:false} },
  { symbol:'l', display:'/l/', category:'nasal', description:'舌先を上の歯茎につけて「ル」', tip:'舌先を歯茎に当てたまま声を出す', examples:[{word:'let',kana:'レット'},{word:'full',kana:'フル'},{word:'milk',kana:'ミルク'}], mouth:{lipOpenness:0.30,lipWidth:0.60,tongueHeight:0.92,tongueBackness:0.15,rounded:false,animated:false} },
  { symbol:'r', display:'/r/', category:'nasal', description:'唇を少し丸め舌を巻いて「ル」', tip:'日本語の「ラ行」とは全く違う。舌を巻く', examples:[{word:'red',kana:'レッド'},{word:'try',kana:'トゥライ'},{word:'great',kana:'グレイト'}], mouth:{lipOpenness:0.28,lipWidth:0.38,tongueHeight:0.65,tongueBackness:0.45,rounded:true,animated:false} },
  { symbol:'w', display:'/w/', category:'nasal', description:'唇を丸めてすぼめてから「ウ」', tip:'口笛を吹く口の形から始める', examples:[{word:'wet',kana:'ウェット'},{word:'swim',kana:'スウィム'},{word:'one',kana:'ワン'}], mouth:{lipOpenness:0.18,lipWidth:0.22,tongueHeight:0.75,tongueBackness:0.80,rounded:true,animated:false} },
  { symbol:'j', display:'/j/', category:'nasal', description:'口を横に開いて「イ」から始める', tip:'日本語の「ヤ行」に似ている', examples:[{word:'yes',kana:'イェス'},{word:'you',kana:'ユー'},{word:'year',kana:'イア'}], mouth:{lipOpenness:0.18,lipWidth:0.88,tongueHeight:0.88,tongueBackness:0.20,rounded:false,animated:false} },
];

const TOTAL = phonemes.length;

// ============================
// SVG MOUTH GENERATION
// ============================

function generateMouthSVG(mouth, w = 160, h = 100) {
  const cx = w / 2;
  const faceCy = h * 0.54;
  const mouthCy = h * 0.60;

  const maxHalfW = w * 0.37;
  const minHalfW = w * 0.14;
  const halfW = minHalfW + (maxHalfW - minHalfW) * mouth.lipWidth;

  const maxOpen = h * 0.28;
  const openPx = mouth.lipOpenness * maxOpen;

  const upperY = mouthCy - openPx / 2;
  const lowerY  = mouthCy + openPx / 2;
  const lx = cx - halfW;
  const rx = cx + halfW;

  // Upper lip path
  let upperPath;
  if (mouth.rounded) {
    upperPath = `M ${lx},${upperY} Q ${cx},${upperY - halfW * 0.12} ${rx},${upperY}`;
  } else {
    const bH = halfW * 0.20;
    const dH = halfW * 0.08;
    upperPath = `M ${lx},${upperY} C ${lx+halfW*0.28},${upperY-bH} ${cx-halfW*0.14},${upperY-dH} ${cx},${upperY-dH*0.4} C ${cx+halfW*0.14},${upperY-dH} ${rx-halfW*0.28},${upperY-bH} ${rx},${upperY}`;
  }

  // Lower lip
  const lowerCurve = halfW * 0.24;
  const lowerPath = `M ${lx},${lowerY} Q ${cx},${lowerY + lowerCurve} ${rx},${lowerY}`;
  const fillPath  = `${upperPath} L ${rx},${lowerY} Q ${cx},${lowerY+lowerCurve} ${lx},${lowerY} Z`;

  const LC = '#C05060';

  // Teeth
  let teeth = '';
  if (mouth.lipOpenness >= 0.13) {
    const th = openPx * 0.85;
    teeth = `<rect x="${lx+2}" y="${upperY+1}" width="${halfW*2-4}" height="${th}" rx="3" fill="white" opacity="0.95"/>
      <line x1="${lx+2}" y1="${upperY+th*0.45}" x2="${rx-2}" y2="${upperY+th*0.45}" stroke="#ddd" stroke-width="0.5"/>`;
  }

  // Tongue
  let tongue = '';
  if (mouth.lipOpenness > 0.28) {
    const tW = Math.min(halfW * 1.4, halfW * 2 - 6);
    const tY = lowerY - openPx * (0.18 + mouth.tongueHeight * 0.18);
    const tRy = openPx * 0.26;
    tongue = `<ellipse cx="${cx}" cy="${tY}" rx="${tW/2}" ry="${tRy}" fill="#E08080" opacity="0.85"/>`;
  }

  // Special: teeth-on-lip (f, v)
  let teethOnLip = '';
  if (mouth.teethOnLip) {
    teethOnLip = `<rect x="${lx+4}" y="${upperY-3}" width="${halfW*2-8}" height="5" rx="2" fill="white" stroke="#ddd" stroke-width="0.5" opacity="0.9"/>`;
  }

  // Special: tongue tip (θ, ð)
  let tongueTipSvg = '';
  if (mouth.tongueTip) {
    tongueTipSvg = `<ellipse cx="${cx}" cy="${mouthCy}" rx="${halfW*0.55}" ry="${openPx*0.35+3}" fill="#E08080" opacity="0.80"/>`;
  }

  // Nose
  const noseCy = mouthCy - h * 0.24;
  const nose = `<ellipse cx="${cx-5}" cy="${noseCy}" rx="3" ry="2" fill="#E0AA80" opacity="0.65"/>
    <ellipse cx="${cx+5}" cy="${noseCy}" rx="3" ry="2" fill="#E0AA80" opacity="0.65"/>
    <path d="M ${cx-5},${noseCy-1} Q ${cx},${noseCy-5} ${cx+5},${noseCy-1}" fill="none" stroke="#E0AA80" stroke-width="1.2" opacity="0.45"/>`;

  const corners = mouth.lipOpenness > 0.02
    ? `<line x1="${lx}" y1="${upperY}" x2="${lx}" y2="${lowerY}" stroke="${LC}" stroke-width="1.5" stroke-linecap="round"/>
       <line x1="${rx}" y1="${upperY}" x2="${rx}" y2="${lowerY}" stroke="${LC}" stroke-width="1.5" stroke-linecap="round"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <ellipse cx="${cx}" cy="${faceCy}" rx="${w*0.44}" ry="${h*0.43}" fill="#FFE4C4" stroke="#F4C89E" stroke-width="1.5"/>
    ${nose}
    ${teeth}
    ${tongue}
    ${teethOnLip}
    ${tongueTipSvg}
    <path d="${fillPath}" fill="${LC}" opacity="${mouth.lipOpenness < 0.05 ? 0.35 : 0.18}"/>
    ${corners}
    <path d="${upperPath}" fill="none" stroke="${LC}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${lowerPath}" fill="none" stroke="${LC}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// Two-frame animated SVG for diphthongs
function generateDiphthongSVG(p) {
  const s1 = generateMouthSVG(p.mouth, 130, 82);
  const s2 = generateMouthSVG(p.mouth2, 130, 82);
  return `<div style="display:flex;align-items:center;gap:10px;justify-content:center">
    <div style="border-radius:10px;overflow:hidden;border:2px solid #e2e8f0">${s1}</div>
    <div style="font-size:22px;color:#aaa">→</div>
    <div style="border-radius:10px;overflow:hidden;border:2px solid #e2e8f0">${s2}</div>
  </div>`;
}

// ============================
// STATE
// ============================

let currentFilter = 'all';
let currentSearch = '';
let mastered = new Set(JSON.parse(localStorage.getItem('mastered') || '[]'));
let currentMode = 'grid';

// Flash card state
let flashList = [...phonemes];
let flashIndex = 0;
let flashFlipped = false;

// Quiz state
let quizList = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

// ============================
// HELPERS
// ============================

function getCatColor(cat) {
  const map = { short:'#FF8C69', long:'#5CA75C', diphthong:'#9B59B6', 'consonant-voiceless':'#E67E22', 'consonant-voiced':'#E74C3C', nasal:'#1ABC9C' };
  return map[cat] || '#4A90D9';
}

function speak(word) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'en-US';
  u.rate = 0.82;
  speechSynthesis.speak(u);
}

function saveMastered() {
  localStorage.setItem('mastered', JSON.stringify([...mastered]));
  updateProgress();
}

function updateProgress() {
  const count = mastered.size;
  document.getElementById('progressBar').style.width = `${(count/TOTAL)*100}%`;
  document.getElementById('progressCount').textContent = `${count} / ${TOTAL}`;
}

function filteredPhonemes() {
  let list = phonemes;
  if (currentFilter === 'mastered') {
    list = list.filter(p => mastered.has(p.symbol));
  } else if (currentFilter !== 'all') {
    list = list.filter(p => p.category === currentFilter);
  }
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(p =>
      p.symbol.toLowerCase().includes(q) ||
      p.display.toLowerCase().includes(q) ||
      p.examples.some(e => e.word.toLowerCase().includes(q) || e.kana.includes(q))
    );
  }
  return list;
}

// ============================
// GRID MODE
// ============================

function renderCards() {
  const list = filteredPhonemes();
  const grid = document.getElementById('cardsGrid');
  const empty = document.getElementById('emptyState');
  if (list.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = list.map((p, i) => {
    const color = getCatColor(p.category);
    const isMastered = mastered.has(p.symbol);
    return `<div class="phoneme-card cat-${p.category} ${isMastered ? 'mastered' : ''}"
        style="animation-delay:${i*0.03}s"
        onclick="openModal('${p.symbol}')">
      <div class="card-top" style="background:linear-gradient(135deg,${color},${color}bb)">
        <div class="card-symbol">${p.display}</div>
        <div class="card-badge">${CATEGORY_LABELS[p.category]}</div>
      </div>
      <div class="card-body">
        <div class="card-tip">${p.tip}</div>
        <div class="card-examples">
          ${p.examples.map(e=>`<div class="card-example"><strong>${e.word}</strong> ${e.kana}</div>`).join('')}
        </div>
      </div>
      <div class="card-hint">タップして詳細を見る 👆</div>
    </div>`;
  }).join('');
}

// ============================
// MODAL
// ============================

let currentModal = null;

function openModal(symbol) {
  const p = phonemes.find(x => x.symbol === symbol);
  if (!p) return;
  currentModal = p;
  const color = getCatColor(p.category);
  const isMastered = mastered.has(p.symbol);

  const mouthHTML = p.mouth.animated && p.mouth2
    ? generateDiphthongSVG(p)
    : `<div style="border-radius:12px;overflow:hidden;border:2px solid #e2e8f0">${generateMouthSVG(p.mouth, 160, 100)}</div>`;

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-header" style="background:linear-gradient(135deg,${color},${color}bb)">
      <div class="modal-symbol">${p.display}</div>
      <div class="modal-badge">${CATEGORY_LABELS[p.category]}</div>
    </div>
    <div class="modal-body">
      <div class="modal-mouth">${mouthHTML}</div>
      <div class="modal-desc">${p.description}</div>
      <div class="modal-tip">💡 ${p.tip}</div>
      <div class="modal-examples-title">例単語</div>
      <div class="modal-examples">
        ${p.examples.map(e => `
          <div class="modal-example-row">
            <span class="ex-word">${e.word}</span>
            <span class="ex-kana">${e.kana}</span>
            <button class="ex-play" onclick="speak('${e.word}')" title="発音を聞く">▶</button>
          </div>`).join('')}
      </div>
      <div class="modal-actions">
        <button class="action-btn primary" onclick="speak('${p.examples[0].word}')">🔊 発音を聞く</button>
        <button class="action-btn ${isMastered ? 'success' : 'secondary'}" id="masterBtn" onclick="toggleMasteredModal('${p.symbol}')">
          ${isMastered ? '✅ 習得済み' : '⭐ 習得済みにする'}
        </button>
      </div>
    </div>`;

  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  currentModal = null;
}

function toggleMasteredModal(symbol) {
  if (mastered.has(symbol)) {
    mastered.delete(symbol);
  } else {
    mastered.add(symbol);
  }
  saveMastered();
  // Update modal button
  const btn = document.getElementById('masterBtn');
  const isMastered = mastered.has(symbol);
  if (btn) {
    btn.className = `action-btn ${isMastered ? 'success' : 'secondary'}`;
    btn.textContent = isMastered ? '✅ 習得済み' : '⭐ 習得済みにする';
  }
  // Update grid card if visible
  renderCards();
}

// ============================
// MODE SWITCHING
// ============================

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(mode === 'grid' ? 'gridMode' : mode === 'flash' ? 'flashMode' : 'quizMode').classList.add('active');
  document.getElementById(mode === 'grid' ? 'btnGrid' : mode === 'flash' ? 'btnFlash' : 'btnQuiz').classList.add('active');
  document.getElementById('filterBar').style.display = mode === 'grid' ? '' : 'none';

  if (mode === 'flash') initFlash();
  if (mode === 'quiz')  startQuiz();
}

// ============================
// FLASH CARD MODE
// ============================

function initFlash() {
  flashList = [...phonemes];
  flashIndex = 0;
  flashFlipped = false;
  renderFlash();
}

function renderFlash() {
  const p = flashList[flashIndex];
  if (!p) return;
  const color = getCatColor(p.category);
  flashFlipped = false;
  const card = document.getElementById('flashCard');
  card.classList.remove('flipped');

  document.getElementById('flashFront').innerHTML = `
    <div class="flash-symbol">${p.display}</div>
    <div class="flash-category">${CATEGORY_LABELS[p.category]}</div>
    <div class="flash-tap-hint">タップしてめくる</div>`;

  const mouthHTML = p.mouth.animated && p.mouth2
    ? generateDiphthongSVG(p)
    : `<div style="border-radius:10px;overflow:hidden;border:2px solid #e2e8f0">${generateMouthSVG(p.mouth, 140, 88)}</div>`;

  document.getElementById('flashBack').innerHTML = `
    <div class="flash-back-symbol" style="color:${color}">${p.display}</div>
    ${mouthHTML}
    <div class="flash-desc">${p.description}</div>
    <div class="flash-tip">💡 ${p.tip}</div>
    <div class="flash-examples-mini">
      ${p.examples.map(e => `<span class="flash-ex-tag" onclick="speak('${e.word}');event.stopPropagation()">${e.word}</span>`).join('')}
    </div>`;

  document.getElementById('flashCounter').textContent = `${flashIndex + 1} / ${flashList.length}`;

  const isMastered = mastered.has(p.symbol);
  const mb = document.getElementById('flashMasterBtn');
  mb.textContent = isMastered ? '✅ 習得済み' : '⭐ 習得済みにする';
  mb.className = `action-btn ${isMastered ? 'success' : 'secondary'}`;
}

function flipFlashCard() {
  flashFlipped = !flashFlipped;
  document.getElementById('flashCard').classList.toggle('flipped', flashFlipped);
}

function flashNav(dir) {
  flashIndex = (flashIndex + dir + flashList.length) % flashList.length;
  renderFlash();
}

function shuffleFlash() {
  for (let i = flashList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashList[i], flashList[j]] = [flashList[j], flashList[i]];
  }
  flashIndex = 0;
  renderFlash();
}

function toggleFlashMaster() {
  const p = flashList[flashIndex];
  if (!p) return;
  if (mastered.has(p.symbol)) mastered.delete(p.symbol);
  else mastered.add(p.symbol);
  saveMastered();
  const isMastered = mastered.has(p.symbol);
  const mb = document.getElementById('flashMasterBtn');
  mb.textContent = isMastered ? '✅ 習得済み' : '⭐ 習得済みにする';
  mb.className = `action-btn ${isMastered ? 'success' : 'secondary'}`;
}

// ============================
// QUIZ MODE
// ============================

const QUIZ_COUNT = 10;

function startQuiz() {
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;
  // Shuffle phonemes for quiz
  quizList = [...phonemes].sort(() => Math.random() - 0.5).slice(0, QUIZ_COUNT);
  document.getElementById('quizContainer').style.display = 'block';
  document.getElementById('quizEnd').style.display = 'none';
  document.getElementById('quizTotal').textContent = QUIZ_COUNT;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (quizIndex >= QUIZ_COUNT) {
    showQuizEnd();
    return;
  }
  quizAnswered = false;
  const p = quizList[quizIndex];
  // Alternate question types
  const useSymbol = quizIndex % 2 === 0;

  document.getElementById('quizScore').textContent = quizScore;
  document.getElementById('quizCurrent').textContent = quizIndex + 1;
  document.getElementById('quizResult').style.display = 'none';

  const color = getCatColor(p.category);

  // Generate wrong answers
  const wrong = phonemes.filter(x => x.symbol !== p.symbol).sort(() => Math.random() - 0.5).slice(0, 3);
  const opts = [p, ...wrong].sort(() => Math.random() - 0.5);

  if (useSymbol) {
    // Show symbol, pick description
    document.getElementById('quizQuestion').innerHTML = `
      <div class="quiz-question-card">
        <div class="quiz-q-label">この発音記号の説明はどれ？</div>
        <div class="quiz-symbol-big" style="color:${color}">${p.display}</div>
        <div style="font-size:13px;color:#888;margin-top:8px">${CATEGORY_LABELS[p.category]}</div>
      </div>`;
    document.getElementById('quizOptions').innerHTML = opts.map(opt => `
      <button class="quiz-option" data-sym="${opt.symbol}" data-correct="${p.symbol}" onclick="checkAnswer('${p.symbol}','${opt.symbol}')">
        ${opt.description}
      </button>`).join('');
  } else {
    // Show mouth SVG, pick symbol
    const mouthHTML = generateMouthSVG(p.mouth, 140, 88);
    document.getElementById('quizQuestion').innerHTML = `
      <div class="quiz-question-card">
        <div class="quiz-q-label">この口の形はどの発音記号？</div>
        <div class="quiz-mouth-wrap">${mouthHTML}</div>
      </div>`;
    document.getElementById('quizOptions').innerHTML = opts.map(opt => `
      <button class="quiz-option" data-sym="${opt.symbol}" data-correct="${p.symbol}" onclick="checkAnswer('${p.symbol}','${opt.symbol}')"
        style="font-size:24px;font-family:'Times New Roman',serif;font-weight:900">
        ${opt.display}
      </button>`).join('');
  }
}

function checkAnswer(correct, chosen) {
  if (quizAnswered) return;
  quizAnswered = true;

  const isCorrect = correct === chosen;
  if (isCorrect) quizScore++;
  document.getElementById('quizScore').textContent = quizScore;

  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.classList.add('disabled');
    const sym = btn.dataset.sym;
    if (sym === correct) btn.classList.add('correct');
    if (sym === chosen && !isCorrect) btn.classList.add('wrong');
  });

  const resultEl = document.getElementById('quizResult');
  resultEl.style.display = 'block';
  resultEl.className = `quiz-result ${isCorrect ? 'correct' : 'wrong'}`;
  const p = phonemes.find(x => x.symbol === correct);
  resultEl.innerHTML = isCorrect
    ? `⭕ 正解！ ${p.display} — ${p.description}`
    : `❌ 不正解。正解は ${p.display} — ${p.description}`;

  // Auto-advance
  setTimeout(() => {
    quizIndex++;
    document.getElementById('quizScore').textContent = quizScore;
    renderQuizQuestion();
  }, 2000);
}

function showQuizEnd() {
  document.getElementById('quizContainer').style.display = 'none';
  document.getElementById('quizEnd').style.display = 'flex';
  const pct = Math.round((quizScore / QUIZ_COUNT) * 100);
  document.getElementById('quizEndIcon').textContent = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚';
  document.getElementById('quizEndScore').textContent = `${quizScore} / ${QUIZ_COUNT} 問正解（${pct}%）`;
}

// ============================
// FILTER & SEARCH
// ============================

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.cat;
    renderCards();
  });
});

document.getElementById('searchInput').addEventListener('input', e => {
  currentSearch = e.target.value.trim();
  renderCards();
});

// ============================
// KEYBOARD
// ============================

document.addEventListener('keydown', e => {
  if (currentMode === 'flash') {
    if (e.key === 'ArrowLeft')  flashNav(-1);
    if (e.key === 'ArrowRight') flashNav(1);
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flipFlashCard(); }
  }
  if (e.key === 'Escape') closeModal();
});

// ============================
// INIT
// ============================

updateProgress();
renderCards();
