# 2008 AMC 12B Problem 23

## Problem
The sum of the base-10 logarithms of the divisors of $10^n$ is 792. What is n?


$$\text{(A)}\ 11\qquad \text{(B)}\ 12\qquad \text{(C)}\ 13\qquad \text{(D)}\ 14\qquad \text{(E)}\ 15$$

## Solutions
### Solution 1
Every factor of $10^n$ will be of the form $2^a\times 5^b$ , $a\leq$ n , $b\leq$ n. Not all of these base ten logarithms will be rational, but we can add them together in a certain way to make it rational. Recall the logarithmic property $\log(a \times$ b) = $\log(a)+\log(b).$ For any factor $2^a\times 5^b,$ there will be another factor $2^{n-a}\times 5^{n-b}.$ Note this is not true if $10^n$ is a perfect square. When these are multiplied, they equal $2^{a+n-a}\times 5^{b+n-b} = 10^n. \log 10^n=n$ so the number of factors divided by 2 times n equals the sum of all the factors, 792.

There are $n+1$ choices for the exponent of 5 in each factor, and for each of those choices, there are $n+1$ factors (each corresponding to a different exponent of 2), yielding $(n+1)^2$ total factors. $\frac{(n+1)^2}{2}*n = 792$. We then plug in answer choices and arrive at the answer $\boxed$ {11}
### Solution 2
We are given  $\log_{10}$d_1 + $\log_{10}$d_2 + $\ldots + \log_{10}$d_k = 792  The property $\log(ab) = \log(a)+\log(b)$ now gives  $\log_{10}(d_$1 d_$2\cdot\ldotsd_k$) = 792  The product of the divisors is (from elementary number theory) $a^{d(n)/2}$ where d(n) is the number of divisors. Note that $10^n =2^n\cdot 5^n,$ so $d(n) = (n + 1$)^2. Substituting these values with $a = 10^n$ in our equation above, we get $n(n + 1)^2 = 1584,$ from whence we immediately obtain \framebox[1.2\width]{(A)} as the correct answer.
### Solution 3
For every divisor d of $10^n, d\le \sqrt{10^n},$ we have $\log$ d + $\log \frac{10^n}{d} = \log $10^n = n. There are $\left \lfloor \frac{(n+1)^2}{2} \right \rfloor$ divisors of $10^n = 2^n\times 5^n$ that are $\le \sqrt{10^n}.$ After casework on the parity of n, we find that the answer is given by n $\times \frac{(n+1)^2}{2} = 792 \Longrightarrown = $11\ $\mathrm{(A)}.$
### Solution 4
The sum is

$$
\sum_{p=0}^{n}\sum_{q=0}^{n} \log(2^p5^q) = \sum_{p=0}^{n}\sum_{q=0}^{n}(p\log(2)+q\log(5))
= \sum_{p=0}^{n} ((n+1)p\log(2) + \frac{n(n+1)}{2}\log(5))
= \frac{n(n+1)^2}{2} \log(2) + \frac{n(n+1)^2}{2} \log(5)
= \frac{n(n+1)^2}{2}
$$

Trying for answer choices we get $n=11$
## Solution 5
Let integer d be the number of divisors $10^n$ has. Then, we set up $\frac{d}{2}$ pairs of divisors such that each pair (a,b) satisfies $ab = 10^n -- ex. (1, 10^n), (2, 5*10^{n-1}$), etc. Then the sum of the base-10 logarithms is $\sum_{j=1}^{\frac{d}{2}} \log_{10}a_j+\log_{10}b_j=\sum_{j=1}^{\frac{d}{2}} \log_{10}a_jb_j=\sum_{j=1}^{\frac{d}{2}} \log_{10} 10^n = \sum_{j=1}^{\frac{d}{2}}n =\frac{nd}{2}$
We can use the property that only perfect squares have an odd number of factors, as for perfect square $p^2,$ we have ordered pair (p,p) that works. For even n, then, $10^{\frac{n}{2}}$ can be multiplied by itself to get $10^n,$ so d is odd. But, in our summation, $\frac{d}{2}$ does not exist for even n as d is then odd, so d must be even. And, since $\frac{nd}{2} = 792,$ We want to find a d for our odd options n such that nd = 1584. For $n=11, d=144$ works, and integer d can not be found for other odd n. So, we get \framebox[1.2\width]{(A) 11}
## Alternative thinking
After arriving at the equation n$(n+1)^2 = 1584$, notice that all of the answer choices are in the form 10+k, where k is 1-5. We notice that the ones digit of n$(n+1)^2$ is 4, and it is dependent on the ones digit of the answer choices. Trying 1-5 for n, we see that only 1 yields a ones digit of 4, so our answer is 11.
## See Also
