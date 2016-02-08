[![Build status](https://ci.appveyor.com/api/projects/status/dufdv2sefowej3mq?svg=true)](https://ci.appveyor.com/project/gerich-home/it-depends)

# it-depends
Lightweight dependency tracking library for JavaScript

### Install

#### NodeJS

```
npm install git://github.com/gerich-home/it-depends.git
```


#### Browser

Download the latest release from https://github.com/gerich-home/it-depends/releases.
Place where it is suitable
Include into the page

```
<script src="js/ext/it-depends.js"></script>
```

or
```
<script src="js/ext/it-depends.min.js"></script>
```

#### Usage

```
var itDepends = require('it-depends').itDepends; // in NodeJS

var firstName = itDepends.value('James');
var lastName  = itDepends.value('Bond');

var fullName = itDepends.computed(function(){
	return 'Hello, ' + firstName() + ' ' + lastName();
});

console.log(fullName()); // Hello, James Bond

firstName('Jack');

console.log(fullName()); // Hello, Jack Bond
```