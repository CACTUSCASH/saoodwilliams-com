/*! (c) 2026 Sa'ood Williams. All rights reserved. Proprietary: copying, modification, redistribution, or use to train, prompt or feed AI systems is prohibited. Licence: https://cactuscash.github.io/saoodwilliams-com/LICENSE.txt ID:SW-a7ff779c3f29 */(()=>{const i=self.location&&self.location.hostname||"";if(!(/^(cactuscash\.github\.io|localhost|127\.0\.0\.1|\[::1\])$/.test(i)||i.endsWith(".localhost"))){try{document.documentElement.innerHTML='<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e9e9e6;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:24px"><p>This work belongs to Sa’ood Williams and is not licensed for use here.<br><a style="color:#9fd3ff" href="https://cactuscash.github.io/saoodwilliams-com/">View the original</a></p></body>'}catch{}throw new Error("Unlicensed copy")}})();const r=[{id:"mandelbrot",name:"Mandelbrot",detail:"f64 maths, nested loops, putc",source:`// The Mandelbrot set, drawn one character at a time.
extern fn putc(c: i32);

fn escape(cr: f64, ci: f64, limit: i32) -> i32 {
  var zr = 0.0;
  var zi = 0.0;
  var i = 0;
  while i < limit {
    let zr2 = zr * zr;
    let zi2 = zi * zi;
    if zr2 + zi2 > 4.0 {
      return i;
    }
    zi = 2.0 * zr * zi + ci;
    zr = zr2 - zi2 + cr;
    i += 1;
  }
  return limit;
}

fn shade(n: i32, limit: i32) -> i32 {
  if n >= limit { return '@'; }
  if n > 20 { return '%'; }
  if n > 12 { return '#'; }
  if n > 8 { return '*'; }
  if n > 6 { return '+'; }
  if n > 4 { return '='; }
  if n > 3 { return '-'; }
  if n > 2 { return ':'; }
  if n > 1 { return '.'; }
  return ' ';
}

export fn main() {
  let width = 64;
  let height = 28;
  let limit = 120;
  var y = 0;
  while y < height {
    var x = 0;
    while x < width {
      let cr = ((x as f64) + 0.5) / (width as f64) * 3.0 - 2.2;
      let ci = ((y as f64) + 0.5) / (height as f64) * 2.5 - 1.25;
      putc(shade(escape(cr, ci, limit), limit));
      x += 1;
    }
    putc('\\n');
    y += 1;
  }
}
`},{id:"fib",name:"Fibonacci",detail:"recursion, real call instructions",source:`// Recursive Fibonacci. Every fib call is a WebAssembly call.
extern fn print(x: i32);

fn fib(n: i32) -> i32 {
  if n < 2 {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

export fn main() -> i32 {
  var i = 0;
  while i <= 20 {
    print(fib(i));
    i += 1;
  }
  return fib(30);
}
`},{id:"primes",name:"Prime sieve",detail:"linear memory, load_u8 and store_u8",source:`// Sieve of Eratosthenes over linear memory, one byte per number.
extern fn print(x: i32);

fn sieve(limit: i32) -> i32 {
  var i = 2;
  while i * i <= limit {
    if load_u8(i) == 0 {
      var j = i * i;
      while j <= limit {
        store_u8(j, 1);
        j += i;
      }
    }
    i += 1;
  }
  var count = 0;
  var n = 2;
  while n <= limit {
    if load_u8(n) == 0 {
      count += 1;
    }
    n += 1;
  }
  return count;
}

export fn main() -> i32 {
  let total = sieve(60000);
  // Read the first twenty primes straight back out of memory.
  var n = 2;
  var shown = 0;
  while shown < 20 {
    if load_u8(n) == 0 {
      print(n);
      shown += 1;
    }
    n += 1;
  }
  return total;
}
`},{id:"gcd",name:"GCD and LCM",detail:"var parameters, i64 results",source:`// Euclid's algorithm with mutable parameters, and an i64 LCM.
extern fn print(x: i32);
extern fn print_i64(x: i64);

fn gcd(var a: i32, var b: i32) -> i32 {
  while b != 0 {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

fn lcm(a: i32, b: i32) -> i64 {
  return (a as i64) / (gcd(a, b) as i64) * (b as i64);
}

export fn main() -> i32 {
  print(gcd(1071, 462));
  print(gcd(270, 192));
  print_i64(lcm(1_000_003, 999_983));
  var g = 0;
  var k = 1;
  while k <= 12 {
    g = gcd(g, k * 84);
    k += 1;
  }
  return g;
}
`},{id:"collatz",name:"Collatz",detail:"i64 arithmetic, a hot loop",source:`// Longest Collatz chain below 300,000. i64 keeps 3n + 1 from overflowing.
extern fn print(x: i32);

fn steps(start: i64) -> i32 {
  var n = start;
  var count = 0;
  while n != 1 {
    if n % 2 == 0 {
      n = n / 2;
    } else {
      n = 3 * n + 1;
    }
    count += 1;
  }
  return count;
}

export fn main() -> i32 {
  var best = 0;
  var best_start = 1;
  var i = 1;
  while i < 300000 {
    let s = steps(i as i64);
    if s > best {
      best = s;
      best_start = i;
    }
    i += 1;
  }
  print(best);
  return best_start;
}
`},{id:"ackermann",name:"Ackermann",detail:"deep, non-primitive recursion",source:`// Ackermann's function: tiny source, explosive recursion.
extern fn print(x: i32);

fn ack(m: i32, n: i32) -> i32 {
  if m == 0 {
    return n + 1;
  }
  if n == 0 {
    return ack(m - 1, 1);
  }
  return ack(m - 1, ack(m, n - 1));
}

export fn main() -> i32 {
  var m = 0;
  while m <= 3 {
    var n = 0;
    while n <= 4 {
      print(ack(m, n));
      n += 1;
    }
    m += 1;
  }
  return ack(2, 3);
}
`}],n={id:"showcase",name:"mandelbrot.cactus",source:`extern fn putc(c: i32);

fn escape(cr: f64, ci: f64) -> i32 {
  var zr = 0.0; var zi = 0.0; var i = 0;
  while i < 120 {
    let zr2 = zr * zr; let zi2 = zi * zi;
    if zr2 + zi2 > 4.0 { return i; }
    zi = 2.0 * zr * zi + ci;
    zr = zr2 - zi2 + cr;
    i += 1;
  }
  return 120;
}

fn shade(n: i32) -> i32 {
  if n >= 120 { return '@'; } if n > 20 { return '%'; }
  if n > 12 { return '#'; } if n > 8 { return '*'; }
  if n > 6 { return '+'; } if n > 4 { return '='; }
  if n > 3 { return '-'; } if n > 2 { return ':'; }
  if n > 1 { return '.'; } return ' ';
}

export fn main() {
  var y = 0;
  while y < 28 {
    var x = 0;
    while x < 64 {
      let cr = (x as f64 + 0.5) / 64.0 * 3.0 - 2.2;
      let ci = (y as f64 + 0.5) / 28.0 * 2.5 - 1.25;
      putc(shade(escape(cr, ci)));
      x += 1;
    }
    putc('\\n');
    y += 1;
  }
}
`};export{r as PRESETS,n as SHOWCASE};
