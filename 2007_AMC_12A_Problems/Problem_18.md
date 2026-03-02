# 2007 AMC 12A Problem 18

## Problem
The polynomial f(x) = $x^{4}+ax^{3}+bx^{2}$ + cx + d has real coefficients, and f$(2i)$ = f(2 + i) = 0. What is a + b + c + d?


$$\mathrm{(A)}\ 0 \qquad \mathrm{(B)}\ 1 \qquad \mathrm{(C)}\ 4 \qquad \mathrm{(D)}\ 9 \qquad \mathrm{(E)}\ 16$$

## Solution 1
A fourth degree polynomial has four [root](https://artofproblemsolving.com/wiki/index.php/root)s. Since the coefficients are real(meaning that complex roots come in conjugate pairs), the remaining two roots must be the [complex conjugate](https://artofproblemsolving.com/wiki/index.php/complex_conjugate)s of the two given roots. By the factor theorem, our roots are 2-i,-$2i$. Now we work backwards for the polynomial:

$$(x-(2+i))(x-(2-i))(x-2i)(x+2i) = 0$$

$$(x^2 - 4x + 5)(x^2 + 4) = 0$$

$$x^4 - 4x^3 + 9x^2 - 16x + 20 = 0$$

Thus our answer is - $4 + 9 - 16 + 20 = $9\ $\mathrm{(D)}.$
## Solution 2
Just like in Solution 1 we realize that the roots come in conjugate pairs. Which means the roots are $2i$,$i+2,-2i$,2-i
So our polynomial is

**(1)** $f(x) = (x-2i)(x+2i)(x-i-2)(x-2$+i)

Looking at the equation of the polynomial $f(x) = x^4+ax^3+bx^2+cx+d.$ We see that a+b+c+d = f(1)-1

If we plug in 1 into equation **(1)** we get f(1) = (1-$2i)(1+2i$)(-1-i)(-1+i).

Now if we multiply a complex number by its conjugate we get the sum of the squares of its real and imaginary parts. Using this property on the above we multiply  and get f(1) = (1-$2i)(1+2i)(-1-i)(-1+i) = (1^2+2^2)(1^2+1^2) = 10$
So the answer is f(1) -$1 =10 - 1 = 9$. \framebox{D}
## Video Solution 1 by SpreadTheMatthLove
https://www.youtube.com/watch?v=WgySLk2p5VU
## See also
