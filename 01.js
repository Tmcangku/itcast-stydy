( function ( global ){
    var document = global.document,
        arr = [],
        push = arr.push,
        slice = arr.slice;

    function itcast ( selector ){
        return new itcast.fn.init( selector );
    }

    itcast.fn = itcast.prototype = {
        constructor: itcast,
        length: 0,   // ����itcast������α�������Ĭ��length����ֵΪ 0
        toArray: function (){
            return slice.call( this );
        },
        get: function ( index ){
            if ( index == null ){
                return this.toArray();
            }

            return this[ index < 0 ? this.length + index : index ];
        },
        eq: function ( index ){
            return itcast( this[ index < 0 ? this.length + index : index ] );
        },
        first: function () {
            return this.eq( 0 );
        },
        last: function () {
            return this.eq( -1 );
        },
        each: function ( callback ){
            itcast.each( this, callback );
            return this;
        },
        splice: arr.splice
    };

    var init = itcast.fn.init = function ( selector ){
        if ( !selector ){
            return this;
        } else if ( itcast.isString( selector ) ){
            if ( itcast.isHTML( selector ) ){
                push.apply( this, itcast.parseHTML( selector ) );
            } else {
                push.apply( this, document.querySelectorAll( selector ) );
            }
        } else if ( itcast.isDOM( selector ) ) {
            this[ 0 ] = selector;
            this.length = 1;
        } else if ( itcast.isArrayLike( selector ) ){
            push.apply( this, selector );
        } else if ( itcast.isFunction( selector ) ){
            document.addEventListener( 'DOMContentLoaded', function (){
                selector();
            } );
        }
    };

    init.prototype = itcast.fn;

    itcast.extend = itcast.fn.extend = function (){
        var args = arguments,
            i = 0,
            l = args.length,
            obj,
            k;

        for ( ; i < l; i++ ){
            obj = args[ i ];
            for ( k in obj ){
                if ( obj.hasOwnProperty( k ) ){
                    this[ k ] = obj[ k ];
                }
            }
        }

        return this;
    };

    itcast.extend( {
        each: function ( obj, callback ){
            var i = 0,
                l;
            // 1 ���objΪ�����α����
            if ( itcast.isArrayLike( obj ) ){
                l = obj.length;
                // ʹ��forѭ�����������α����
                for ( ; i < l; i++ ){
                    // ִ��ָ���Ļص�����callback���ı���thisֵΪ ��ǰ��������Ԫ�أ�ͬʱ���� i �� obj[ i ]
                    // �жϻص�����callback�ķ���ֵ�����Ϊfalse����ѭ��
                    if ( callback.call(obj[ i ], i, obj[ i ] ) === false ){
                        break;
                    }
                }
                // 2 ���obj����ͨ����
            } else {
                for ( i in obj ){
                    if ( callback.call(obj[ i ], i, obj[ i ] ) === false ){
                        break;
                    }
                }
            }

            return obj;
        },
        type: function ( obj ){
            if ( obj == null ){
                return obj + '';
            }

            return typeof obj !== 'object' ? typeof obj :
                Object.prototype.toString.call( obj ).slice( 8, -1 ).toLowerCase();
        },
        parseHTML: function ( html ){
            var div = document.createElement( 'div' ),
                node,
                ret = [];

            div.innerHTML = html;

            for( node = div.firstChild; node; node = node.nextSibling ){
                if ( node.nodeType === 1 ){
                    ret.push( node );
                }
            }

            return ret;
        },
        unique: function ( arr ) {
            // ȥ�غ��������
            var ret = [];
            // ����ԭ����arr
            itcast.each( arr, function () {
                // ���indexOf����ֵ Ϊ -1����ʾret�����е�ǰԪ��
                if ( ret.indexOf( this ) === -1 ) {
                    // ��ô����ӵ�ret��
                    ret.push( this );
                }
            } );
            // ���ؽ��
            return ret;
        }
    } );

    itcast.extend( {
        isString: function ( obj ){
            return typeof obj === 'string';
        },
        isHTML: function ( obj ){
            obj = obj + '';
            return obj[ 0 ] === '<' && obj[ obj.length - 1 ] === '>' && obj.length >= 3;
        },
        isDOM: function ( obj ){
            return !!obj && !!obj.nodeType;
        },
        isArrayLike: function ( obj ){
            var length = !!obj && 'length' in obj && obj.length,
                type = itcast.type( obj );

            if ( type === 'function' || itcast.isWindow( obj ) ){
                return false;
            }

            return type === 'array' || length === 0 ||
                typeof length === 'number' && length > 0 && ( length - 1 ) in obj;
        },
        isFunction: function ( obj ){
            return typeof obj === 'function';
        },
        isWindow: function ( obj ){
            return !!obj && obj.window === obj;
        }
    } );

    // DOM����ģ��
    itcast.fn.extend( {
        appendTo: function ( target ) {
            var that = this; // ����this���õĶ���
            var ret = [],    // �洢���з����ȥ�Ľڵ�
                node;        // ��ʱ�洢Ҫ������Ľڵ�
            // 1: ͳһtarget���͡�Ϊitcast����
            target = itcast( target );
            // 2: ����target
            target.each( function (i, elem ){
                // 3: ����itcast����-appendTo�����ĵ�����
                that.each( function (){
                    // ������������ǵ�һĿ��DOMԪ�أ�����Ҫ����nodeԴ�ڵ㣻���򣬾���Ҫ����node
                    // ͬʱҪ���������ڵ㣬���Ҫʹ������ķ�ʽ
                    // Ȼ���Ŀ��Ԫ��׷�������õ��½ڵ�
                    // this -> ����that �õ��ĵ�ǰԪ��
                    node = i === 0 ? this : this.cloneNode( true );
                    ret.push( node );
                    elem.appendChild( node );
                } );
            } );
            // 4��ʵ����ʽ���
            return itcast( ret );
        },
        append: function ( source ) {
            source = itcast( source );
            source.appendTo( this );
            return this;
        },
        prependTo: function ( target ){
            var ret = [],
                that = this,
                node,
                firstChild; // �洢Ŀ��Ԫ�صĵ�һ���ӽڵ�

            target = itcast( target );
            target.each( function ( i, elem ) {
                // ��ȡ��ǰĿ��Ԫ�ص�һ���ӽڵ�
                firstChild = elem.firstChild;
                that.each( function (){
                    node = i === 0 ? this : this.cloneNode( true );
                    ret.push( node );
                    // ���õ����½ڵ㣬��firstChildǰ�߸�elem����ӽڵ�
                    elem.insertBefore( node, firstChild );
                } );
            } );

            return itcast( ret );
        },
        prepend: function ( source ) {
            source = itcast( source );
            source.prependTo( this );
            return this;
        },
        next: function () {
            var ret = [];
            this.each( function ( i, elem ) {
                // var node = elem.nextSibling;
                // while ( node ) {
                //   if( node.nodeType === 1 ){
                //     ret.push( node );
                //     break;
                //   }
                //   node = node.nextSibling;
                // }
                while ( ( elem = elem.nextSibling ) && elem.nodeType !== 1 ){}
                if ( elem != null ) {
                    ret.push( elem );
                }
            } );
            return itcast( ret );
        },
        nextAll: function () {
            var ret = [];
            this.each( function ( i, elem ) {
                var node = elem.nextSibling;
                while ( node ) {
                    if( node.nodeType === 1 ){
                        ret.push( node );
                    }
                    node = node.nextSibling;
                }
            } );
            return itcast( itcast.unique( ret ) );
        },
        remove: function () {
            return this.each( function () {
                this.parentNode.removeChild( this );
            } );
        },
        empty: function () {
            return this.each( function () {
                this.innerHTML = '';
            } );
        },
        before: function ( node ) {
            return this.each( function ( i, elem ) {
                // ������ַ������ͣ��ʹ���һ���ı��ڵ�
                node = itcast( itcast.isString( node ) ? document.createTextNode( node ) : node );
                // if ( itcast.isString( node) ) {
                //   node = itcast( document.createTextNode( node ) );
                // } else {
                //   node = itcast( node );
                // }
                node.each( function ( j, cur ) {
                    elem.parentNode.insertBefore( i === 0 ? cur : cur.cloneNode( true ), elem );
                } );
            } );
        },
        after: function ( node ) {
            return this.each( function ( i, elem ) {
                var nextSibling = elem.nextSibling;
                node = itcast( itcast.isString( node ) ? document.createTextNode( node ) : node );
                node.each( function ( j, cur ) {
                    elem.parentNode.insertBefore( i === 0 ? cur : cur.cloneNode( true ), nextSibling );
                } );
            } );
        }
    } );

    if ( typeof define === 'function' ){
        define( function (){
            return itcast;
        } );
    } else if ( typeof exports !== 'undefined' ) {
        module.exports = itcast;
    } else {
        global.$ = itcast;
    }
}( window ) );