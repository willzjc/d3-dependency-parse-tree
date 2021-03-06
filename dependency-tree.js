// Generated by CoffeeScript 1.8.0
(function() {
  var levelHeight, maximum, parseConll, parseConll2009, under, wordHeight, wordWidth;

  wordWidth = 90;

  wordHeight = 20;

  levelHeight = function(level) {
    return 2 + Math.pow(level, 1.8) * 10;
  };

  window.drawTree = function(svgElement, conllData) {
    var arrows, data, dependencies, e, edge, edges, item, leftOffset, svg, tags, treeHeight, treeWidth, triangle, words, _i, _j, _k, _len, _len1, _len2;
    svg = d3.select(svgElement);
    data = parseConll2009(conllData);
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
    treeWidth = wordWidth * data.length - wordWidth / 3;
    leftOffset = treeWidth / 40;
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
      item.left = leftOffset + item.id * wordWidth;
      item.right = leftOffset + item.parent * wordWidth;
      item.mid = (item.right + item.left) / 2;
      item.diff = (item.right - item.left) / 4;
      item.arrow = item.top + (item.bottom - item.top) * .25;
    }
    svg.selectAll('text, path').remove();
    svg.attr('width', treeWidth + 2 * wordWidth / 3).attr('height', treeHeight + wordHeight / 2);
    words = svg.selectAll('.word').data(data).enter().append('text').text(function(d) {
      return d.word;
    }).attr('class', function(d) {
      return "word w" + d.id;
    }).attr('x', function(d) {
      return leftOffset + wordWidth * d.id;
    }).attr('y', treeHeight - wordHeight).on('mouseover', function(d) {
      svg.selectAll('.word, .dependency, .edge, .arrow').classed('active', false);
      svg.selectAll('.tag').attr('opacity', 0);
      svg.selectAll(".w" + d.id).classed('active', true);
      return svg.select(".tag.w" + d.id).attr('opacity', 1);
    }).on('mouseout', function(d) {
      svg.selectAll('.word, .dependency, .edge, .arrow').classed('active', false);
      return svg.selectAll('.tag').attr('opacity', 0);
    });
    tags = svg.selectAll('.tag').data(data).enter().append('text').text(function(d) {
      return d.tag;
    }).attr('class', function(d) {
      return "tag w" + d.id;
    }).attr('x', function(d) {
      return leftOffset + wordWidth * d.id;
    }).attr('y', treeHeight).attr('opacity', 0);
    edges = svg.selectAll('.edge').data(data).enter().append('path').filter(function(d) {
      return d.id;
    }).attr('class', function(d) {
      return "edge w" + d.id + " w" + d.parent;
    }).attr('d', function(d) {
      return "M" + d.left + "," + d.bottom + " C" + (d.mid - d.diff) + "," + d.top + " " + (d.mid + d.diff) + "," + d.top + " " + d.right + "," + d.bottom;
    });
    dependencies = svg.selectAll('.dependency').data(data).enter().append('text').filter(function(d) {
      return d.id;
    }).text(function(d) {
      return d.dependency;
    }).attr('class', function(d) {
      return "dependency w" + d.id + " w" + d.parent;
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
    var cpos, data, dependency, fpos, id, line, parent, tag, word, _, _i, _len, _ref, _ref1;
    data = [];
    data.push({
      id: 0,
      word: 'ROOT',
      tag: 'ROOT',
      level: 0
    });
    _ref = conllData.split('\n');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      if (!(line)) {
        continue;
      }
      _ref1 = line.split('\t'), id = _ref1[0], word = _ref1[1], _ = _ref1[2], cpos = _ref1[3], fpos = _ref1[4], _ = _ref1[5], parent = _ref1[6], dependency = _ref1[7];
      tag = cpos !== fpos ? cpos + ' ' + fpos : cpos;
      data.push({
        id: Number(id),
        word: word,
        tag: tag,
        parent: Number(parent),
        dependency: dependency,
        level: 1
      });
    }
    return data;
  };

  parseConll2009 = function(conllData) {
    var data, deprel, head, id, line, pdeprel, phead, pos, ppos, tag, word, _, _i, _len, _ref, _ref1;
    data = [];
    data.push({
      id: 0,
      word: 'ROOT',
      tag: 'ROOT',
      level: 0
    });
    _ref = conllData.split('\n');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      if (!(line)) {
        continue;
      }
      _ref1 = line.split('\t'), id = _ref1[0], word = _ref1[1], _ = _ref1[2], _ = _ref1[3], pos = _ref1[4], ppos = _ref1[5], _ = _ref1[6], _ = _ref1[7], head = _ref1[8], phead = _ref1[9], deprel = _ref1[10], pdeprel = _ref1[11], _ = _ref1[12], _ = _ref1[13];
      tag = ppos;
      data.push({
        id: Number(id),
        word: word,
        tag: tag,
        parent: Number(phead),
        dependency: pdeprel,
        level: 1
      });
    }
    return data;
  };

}).call(this);
