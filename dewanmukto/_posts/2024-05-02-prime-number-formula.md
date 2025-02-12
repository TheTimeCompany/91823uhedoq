---
layout: post
title:  "A Formula That Is Guaranteed To Produce Primes!"
description: "Random Discovery While Studying"
author: dmimukto
categories: [ research, mathematics, discovery ]
published: true
---

Today I was playing around with recurrence relationships. One famous example, of course, is the Fibonacci sequence, i.e. `1,1,2,3,5,8,13,21,...` and so on.

So I decided to try to see if there is any 'pattern' for the way the prime numbers are ordered. If the prime numbers could be ordered as a sequence just like the Fibonacci, then obviously it would look something like this:
```
2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,...
```
Next, I listed them down again, but vertically, with a way of adding and subtracting some other numbers, as follows:

- **2** = 1 + 1 - 0
- **3** = 2 + 1 - 0
- **5** = 3 + 2 - 0
- **7** = 5 + 3 - 1
- **11** = 7 + 5 - 1

The overall shape of the sequence began to form right after the 5th prime:

- **13** = 11 + 7 - 5
- **17** = 13 + 11 - 7
- **19** = 17 + 13 - 11
- **23** = 19 + 17 - 13

Clearly, there is a pattern! And a recurring one, too! Something that is as vitally simple as this:

# $X_n = X_{n-1} + X_{n-2} - X_{n-3}$

Dependent only upon the initial values for the first 5 primes.

## Note
> However, there is just __one__ flaw about this. But that, too, has a cure!

Notice that if the equations are rewritten in an alternative manner and continued:

- 11 + 7 - 5 = **13**
- 13 + 11 - 7 = **17**
- 17 + 13 - 11 = **19**
- 19 + 17 - 13 = **23**
- 23 + 19 - 17 = *25*
- *25* + 23 - 19 = **29**
- 29 + *25* - 23 = **31**
- 31 + 29 - *25* = *35*
- *35* + 31 - 29 = **37**
- 37 + *35* - 31 = **41**
- 41 + 37 - *35* = **43**
- 43 + 41 - 37 = **47**
- 47 + 43 - 41 = *49*
- *49* + 47 - 43 = **53**
...

For the values *not bolded*, they are certainly NOT prime. But, they are multiples of prime factors, i.e. `25` = 5x5, `35` = 5x7, `49` = 7x7, etc. They are still included and carried forward in the formulae since the successive primes rely on the values to be input into the recurrence equation. It can be easily mitigated by mentioning if any of the 'generated primes' are divisible by any of the preceding values, or the first 5 primes for the least case.

Following this recurrence formula by hand may appear a bit tricky for larger primes, but for modern computers it is a simple walk in the park, since they are highly obedient machines who will follow through any objective if presented in the form of an algorithm.

To taste the power of this algorithm, simply copy-paste this sample Python script written by me for prototyping my hypothesis in a very simple way:

```python
# Prime number generator
# @author Dewan Mukto
# @version 0.5.2.2024
def generate_primes(nmax):
    x = [2, 3, 5, 7, 11] # initial values
    n = 1 # counter of the current nth prime

    # just spit out the preset values for n < 5
    if nmax <= 5:
        while n <= nmax:
            print(x[n-1], end=", ")
            n += 1
        print()
    # apply the "recurrence relationship" otherwise
    else:
        while n <= 5:
            print(x[n-1], end=", ")
            n += 1
        while n <= nmax:
            # apply the formula
            xn = x[-1] + x[-2] - x[-3]
            if not any(xn % xi == 0 for xi in x):
                # if the Xn is not divisible by any of its previous "values"
                # (see Note on my website https://diztil.github.io/research/mathematics/discovery/2024/05/02/prime-number-formula)
                print(xn, end=", ")
                x.append(xn)
                n += 1
            else:
                x.append(xn)
                n += 1
        print()
# The "recurrence relationship": Xn = Xn-1 + Xn-2 - Xn-3
print("Welcome to Dewan Mukto's Prime Number Generator!")
nmax = int(input("Upto which prime to generate?: "))
generate_primes(nmax)
```

I am not sure if this formula can fully live up to its name, but if it does, I hope it carries mine! 😉️

Thanks for reading this! (Spread the word! This might be the beginning of the end of encryption based on the RSA cryptographic system!)
