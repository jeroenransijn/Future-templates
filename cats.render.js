;(function (root, undefined) {

  var defaultRenderKinds = {
    'string': function (val) {
      this.sourceValue = val;
      this.shell = this.node.cloneNode(false);
      this.shell.innerHTML = val;
      if (this.node.parentNode) {
        this.node.parentNode.replaceChild(this.shell, this.node);
      }
      this.node = this.shell;
    }

    ,'array': function (val) {
      val.forEach(function (itemVal, index) {
        var clone = this.ghost.cloneNode(true);
        clone.setAttribute('data-render', (this.key + '.' + index));

        var subView = new View(clone, (this.key + '.' + index)).render(itemVal);

        if (index === 0) {
          subView.insertAfter(this.node);
          this.node.parentNode.removeChild(this.node);
        } else {
          subView.insertAfter( this.renderList[index -1].node );
        }
        
        this.renderList.push( subView );
      }, this); // thisArg uses cb.call(this, ...)
    }

    // object...
  };

  function View (node, renderKey) {
    this.node = node;
    this.ghost = node.cloneNode(true);
    this.key = renderKey;
    this.sourceValue = null;
    this.renderList = [];
  }

  View.prototype.render = function (val) {
    var kind;
    if (typeof val === 'string') {
      kind = 'string';
    } else if ( Array.isArray(val) ) {
      kind = 'array';
    } else if ( val && val.kind ) {
      kind = val.kind;
    } else {
      throw new TypeError('(Cats)(render): value passed is not supported');
    }

    if (defaultRenderKinds[kind]) {
      this.kind = kind;
      defaultRenderKinds[kind].call(this, val);
    } else {
      throw new Error('(Cats)(render): no render method for kind of ' + kind);
    }

    return this;
  };

  // http://www.netlobo.com/javascript-insertafter.html
  View.prototype.insertAfter = function (refNode) {
    refNode.parentNode.insertBefore(this.node, refNode.nextSibling);
    return this;
  };

  function Cats (src, opts) {
    var attrRender, renderNodeList, renderNodeListLength, i, renderList, updateListener;
    opts = opts || {};
    attrRender = 'data-render';

    if (({}).toString.call(src) !== '[object Object]') {
      throw new TypeError('(Cats): src argument passed is not an object');
    }

    renderNodeList = document.querySelectorAll('[' + attrRender + ']');
    renderNodeListLength = renderNodeList.length;
    renderList = {};

    for (i = 0; i < renderNodeListLength; i++) {
      var renderItem = renderNodeList[i];
      var renderKey = renderItem.getAttribute(attrRender);
      var view = new View(renderItem, renderKey, renderList);

      if (renderList[renderKey]) {
        renderList[renderKey].push( view );
      } else {
        renderList[renderKey] = [ view ];
      }
    }

    this.source = src;
    this.renderList = renderList;
  }

  Cats.prototype.get = function (key) {
    var path = key.split('.'), pathLength = path.length;

    if (pathLength === 1) {
      if (this.source.hasOwnProperty(key)) {
        return this.source[key];
      } else {
        return null;
      }
    } else {
      var sourceLevelDown = this.source;

      path.forEach(function (nextKey) {
        if (sourceLevelDown && sourceLevelDown[nextKey]) {
          sourceLevelDown = sourceLevelDown[nextKey];
        } else {
          sourceLevelDown = null;
        }
      });

      return sourceLevelDown;
    }
  };

  Cats.prototype.set = function (key, val) {
    var source = this.get(key);

    if (source !== null) {
      return (source = val);
    } else {
      return null;
    }
  };

  Cats.prototype.render = function (key, val) {

    if (!key) {
      // render all
      for (var renderKey in this.renderList) {
        var val = this.get(renderKey);

        if (val !== null) {
          this.renderList[renderKey].forEach(function (view) {
            view.render( val );
          });
        }
      }
    } else {
      var val = val = (val === undefined ?
          this.get(key) : // get value from source
          this.set(key, val)); // update the value and return the value (null != exists)

      if (val !== null) {
        this.renderList[key].forEach(function (view) {
          view.render( val );
        });
      }
    }

    return this;
  };

  root.Cats = Cats;
})(window);