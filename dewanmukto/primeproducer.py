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
