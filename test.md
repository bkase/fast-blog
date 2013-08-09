# Example Title

An alternate API for declaring and using js-ctypes functions. I wanted a more descriptive [interface](http://www.google.com) to delcaring functions with js-ctypes because the builtin declare method is just a _flate_ function call that takes a ton of arguments (if the function is complex). Additionally, the instantiator memoizes function declarations (made with `declare`) so they can be used (with `use`) later by only refering to the name of the function call.

`declareFromType` takes a function pointer type instead of abi/args/returns

Example:

```javascript
const I = new Instantiator();

function someScope() {
  I.declare({ name: "complexFunc"
              returns: type0,
              args: [ type1, type2, type3... typeN ]
            }, libc);
}

function someOtherScope() {
  let complex = I.use("complexFunc");
  return complex(10, "str", ...);
}
```

Some C code goes here

```c
int main() {
  // native code
  int x = 10;
  char * y = "hello";
  void * derp = void * (*hello)(char *, int, struct derp);

  return helloThere();
}
```

_hello_ goodbye

