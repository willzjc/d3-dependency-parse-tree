var labelDict, levelHeight, maximum, parseConll, tagDict, under, wordHeight, wordWidth;

wordWidth = 60;

wordHeight = 20;

levelHeight = function(level) {
  return level * level * 10;
};

window.drawTree = function(svgElement, conllData) {
  var arrows, data, e, edge, edges, item, labels, svg, tags, treeHeight, treeWidth, triangle, words, _i, _j, _k, _len, _len1, _len2;
  svg = d3.select(svgElement);
  data = parseConll(conllData);
  edges = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      item = data[_i];
      if (item.id) {
        _results.push(item);
      }
    }
    return _results;
  })();
  for (_i = 0, _len = edges.length; _i < _len; _i++) {
    edge = edges[_i];
    for (_j = 0, _len1 = edges.length; _j < _len1; _j++) {
      edge = edges[_j];
      edge.level = 1 + maximum((function() {
        var _k, _len2, _results;
        _results = [];
        for (_k = 0, _len2 = edges.length; _k < _len2; _k++) {
          e = edges[_k];
          if (under(edge, e)) {
            _results.push(e.level);
          }
        }
        return _results;
      })());
    }
  }
  treeWidth = wordWidth * data.length;
  treeHeight = levelHeight(maximum((function() {
    var _k, _len2, _results;
    _results = [];
    for (_k = 0, _len2 = data.length; _k < _len2; _k++) {
      edge = data[_k];
      _results.push(edge.level);
    }
    return _results;
  })())) + 2 * wordHeight;
  for (_k = 0, _len2 = data.length; _k < _len2; _k++) {
    item = data[_k];
    item.bottom = treeHeight - 1.8 * wordHeight;
    item.top = item.bottom - levelHeight(item.level);
    item.left = treeWidth - item.id * wordWidth;
    item.right = treeWidth - item.parent * wordWidth;
    item.mid = (item.right + item.left) / 2;
    item.diff = (item.right - item.left) / 3;
    item.arrow = item.top + (item.bottom - item.top) * .25;
  }
  svg.selectAll('text, path').remove();
  svg.attr('width', treeWidth + wordWidth).attr('height', treeHeight + wordHeight / 2);
  words = svg.selectAll('.word').data(data).enter().append('text').text(function(d) {
    return d.word;
  }).attr('class', function(d) {
    return "word w" + d.id;
  }).attr('x', function(d) {
    return treeWidth - wordWidth * d.id + 1;
  }).attr('y', treeHeight - wordHeight).on('mouseover', function(d) {
    d3.selectAll('.word, .label, .edge, .arrow').classed('active', false);
    d3.selectAll('.tag').attr('opacity', 0);
    d3.selectAll(".w" + d.id).classed('active', true);
    return d3.select(".tag.w" + d.id).attr('opacity', 1);
  }).on('mouseout', function(d) {
    d3.selectAll('.word, .label, .edge, .arrow').classed('active', false);
    return d3.selectAll('.tag').attr('opacity', 0);
  });
  tags = svg.selectAll('.tag').data(data).enter().append('text').text(function(d) {
    return d.tag;
  }).attr('class', function(d) {
    return "tag w" + d.id;
  }).attr('x', function(d) {
    return treeWidth - wordWidth * d.id;
  }).attr('y', treeHeight).attr('opacity', 0);
  edges = svg.selectAll('.edge').data(data).enter().append('path').filter(function(d) {
    return d.id;
  }).attr('class', function(d) {
    return "edge w" + d.id + " w" + d.parent;
  }).attr('d', function(d) {
    return "M" + d.left + "," + d.bottom + " C" + (d.mid - d.diff) + "," + d.top + " " + (d.mid + d.diff) + "," + d.top + " " + d.right + "," + d.bottom;
  });
  labels = svg.selectAll('.label').data(data).enter().append('text').filter(function(d) {
    return d.id;
  }).text(function(d) {
    return d.label;
  }).attr('class', function(d) {
    return "label w" + d.id + " w" + d.parent;
  }).attr('x', function(d) {
    return d.mid;
  }).attr('y', function(d) {
    return d.arrow - 7;
  });
  triangle = d3.svg.symbol().type('triangle-up').size(5);
  return arrows = svg.selectAll('.arrow').data(data).enter().append('path').filter(function(d) {
    return d.id;
  }).attr('class', function(d) {
    return "arrow w" + d.id + " w" + d.parent;
  }).attr('d', triangle).attr('transform', function(d) {
    return "translate(" + d.mid + ", " + d.arrow + ") rotate(" + (d.id < d.parent ? '' : '-') + "90)";
  });
};

maximum = function(array) {
  return Math.max(0, Math.max.apply(null, array));
};

under = function(edge1, edge2) {
  var ma, mi, _ref;
  _ref = edge1.id < edge1.parent ? [edge1.id, edge1.parent] : [edge1.parent, edge1.id], mi = _ref[0], ma = _ref[1];
  return edge1.id !== edge2.id && edge2.id >= mi && edge2.parent >= mi && edge2.id <= ma && edge2.parent <= ma;
};

parseConll = function(conllData) {
  var cpos, data, fpos, id, label, line, parent, tag, word, _, _i, _len, _ref, _ref1;
  data = [];
  data.push({
    id: 0,
    word: 'ریشه',
    tag: tagDict['ROOT'],
    level: 0
  });
  _ref = conllData.split('\n');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    if (!(line)) {
      continue;
    }
    _ref1 = line.split('\t'), id = _ref1[0], word = _ref1[1], _ = _ref1[2], cpos = _ref1[3], fpos = _ref1[4], _ = _ref1[5], parent = _ref1[6], label = _ref1[7];
    tag = cpos !== fpos ? tagDict[cpos] + ' ' + tagDict[fpos] : tagDict[cpos];
    data.push({
      id: Number(id),
      word: word,
      tag: tag,
      parent: Number(parent),
      label: labelDict[label],
      level: 1
    });
  }
  return data;
};

labelDict = {
  '': '',
  'NE': 'اسم‌یار',
  'PART': 'افزودۀ پرسشی فعل',
  'APP': 'بدل',
  'NCL': 'بند اسم',
  'AJUCL': 'بند افزودۀ فعل',
  'PARCL': 'بند فعل وصفی',
  'TAM': 'تمییز',
  'NPRT': 'جزء اسمی',
  'LVP': 'جزء همکرد',
  'NPP': 'حرف اضافه اسم',
  'VPRT': 'حرف اضافه فعلی',
  'COMPPP': 'حرف اضافۀ تفضیلی',
  'ROOT': 'ریشه جمله',
  'NPOSTMOD': 'صفت پسین اسم',
  'NPREMOD': 'صفت پیشین اسم',
  'PUNC': 'علائم نگارشی',
  'SBJ': 'فاعل',
  'NVE': 'فعل‌یار',
  'ENC': 'فعل‏یار پی‏بستی',
  'ADV': 'قید',
  'NADV': 'قید اسم',
  'PRD': 'گزاره',
  'ACL': 'متمم بندی صفت',
  'VCL': 'متمم بندی فعل',
  'AJPP': 'متمم حرف اضافه‌ای صفت',
  'ADVC': 'متمم قیدی فعل',
  'NEZ': 'متمم نشانۀ اضافه‌ای صفت',
  'PROG': 'مستمرساز',
  'MOS': 'مسند',
  'MOZ': 'مضافٌ‌الیه',
  'OBJ': 'مفعول',
  'VPP': 'مفعول حرف اضافه‌ای',
  'OBJ2': 'مفعول دوم',
  'MESU': 'ممیز',
  'AJCONJ': 'هم‌پایه صفت',
  'PCONJ': 'هم‌پایۀ حرف اضافه',
  'NCONJ': 'هم‏پایه اسم',
  'VCONJ': 'هم‏پایه فعل',
  'AVCONJ': 'هم‏پایه قید',
  'POSDEP': 'وابسته پسین',
  'PREDEP': 'وابسته پیشین',
  'APOSTMOD': 'وابستۀ پسین صفت',
  'APREMOD': 'وابستۀ پیشین صفت'
};

tagDict = {
  '': '',
  '1': 'اول',
  '2': 'دوم',
  '3': 'سوم',
  'ACT': 'معلوم',
  'ADJ': 'صفت',
  'ADR': 'نقش نمای ندا',
  'ADV': 'قید',
  'AJCM': 'تفضیلی',
  'AJP': 'مطلق',
  'AJSUP': 'عالی',
  'AMBAJ': 'صفت مبهم',
  'ANM': 'جاندار',
  'AVCM': 'تفضیلی',
  'AVP': 'مطلق',
  'AY': 'آینده اخباری',
  'CL': 'سببی',
  'COM': 'تفضیلی',
  'CONJ': 'نقش نمای همپایگی',
  'CREFX': 'بازتابی مشترک',
  'DEMAJ': 'صفت اشاره',
  'DEMON': 'اشاره',
  'DET': 'حرف تعریف',
  'EXAJ': 'صفت تعجبی',
  'GB': 'گذشته بعید اخباری',
  'GBEL': 'گذشته بعید التزامی',
  'GBES': 'گذشته بعید استمراری اخباری',
  'GBESE': 'گذشته بعید استمراری التزامی',
  'GEL': 'گذشته التزامی',
  'GES': 'گذشته استمراری اخباری',
  'GESEL': 'گذشته استمراری التزامی',
  'GN': 'گذشته نقلی اخباری',
  'GNES': 'گذشته نقلی استمراری اخباری',
  'GS': 'گذشته ساده اخباری',
  'H': 'حال اخباری',
  'HA': 'حال امری',
  'HEL': 'حال التزامی',
  'IANM': 'بی جان',
  'IDEN': 'شاخص',
  'INTG': 'پرسشی',
  'ISO': 'واژه تنها',
  'JOPER': 'شخصی پیوسته',
  'MODE': 'وجه',
  'MODL': 'وجهی',
  'N': 'اسم',
  'NUM': 'شمار',
  'NXT': 'چسبیدگی از چپ',
  'PART': 'جزء دستوری',
  'PASS': 'مجهول',
  'PERS': 'شخص',
  'PLUR': 'جمع',
  'POSADR': 'پسین',
  'POSNUM': 'صفت شمارشی پسین',
  'POST': 'مطلق',
  'POSTP': 'حرف اضافه پسین',
  'PR': 'ضمیر',
  'PRADR': 'پیشین',
  'PREM': 'پیش توصیفگر',
  'PRENUM': 'صفت شمارشی پیشین',
  'PREP': 'حرف اضافه پیشین',
  'PRV': 'چسبیدگی از راست',
  'PSUS': 'شبه جمله',
  'PUNC': 'علامت نگارشی',
  'QUAJ': 'صفت پرسشی',
  'RECPR': 'متقابل',
  'SADV': 'مختص',
  'SEPER': 'شخصی جدا',
  'SING': 'مفرد',
  'SUBR': 'نقش نمای وابستگی',
  'SUP': 'عالی',
  'UCREFX': 'بازتابی غیرمشترک',
  'V': 'فعل',
  'ROOT': ''
};
