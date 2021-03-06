module.exports =
  class Template
    Function::property = (p)-> Object.defineProperty @::, n, d for n, d of p
    Function::staticProperty = (p)=> Object.defineProperty @::, n, d for n, d of p
    constructor: ->@_constructor.apply @, arguments

    # Create the tamplate for "Immediate Function Invocation", i.e :
    #   Declare a Function, given its codeBody, and invoke it with given param + value pairs
    #
    # @param {String} codeBody the code to invoke with IFI
    # @param {String...} paramValuePairs pairs of param + value with which to invoke
    # @example
    #   _functionIFI "var a = root;", "root", "window"
    #     ---> (function (root) {
    #            var a = root;;
    #           })()
    _functionIFI: (codeBody, paramValuePairs...)-> """
      (function (#{(param for param, i in paramValuePairs when i%2 is 0).join(',')}) {
        #{codeBody}
      })(#{(value for value, i in paramValuePairs when i%2 isnt 0).join(',')})
    """

    # Declare a Function
    #
    # @param {String} codeBody the code to invoke with IFI
    # @param {String...} params of param + value with which to invoke
    # @example
    #   _function "var a = root;", "root", "factory"
    #     ---> function (root, factory) {
    #            var a = root;
    #           }
    _function: (codeBody, params...)-> """
      function (#{(param for param, i in params).join(',')}) {
        #{codeBody}
      }
    """

    runTimeDiscovery: """
      var __isAMD = (typeof define === 'function' && define.amd),
          __isNode = (typeof exports === 'object'),
          __isWeb = !__isNode;

    """