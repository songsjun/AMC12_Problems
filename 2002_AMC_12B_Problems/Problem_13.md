# 2002 AMC 12B Problem 13

## Problem
The sum of 18 consecutive positive integers is a [perfect square](https://artofproblemsolving.com/wiki/index.php/perfect_square). The smallest possible value of this sum is


$$\mathrm{(A)}\ 169 \qquad\mathrm{(B)}\ 225 \qquad\mathrm{(C)}\ 289 \qquad\mathrm{(D)}\ 361 \qquad\mathrm{(E)}\ 441$$

## Solution 1
Let a, $a+1, \ldots,$ a + 17 be the consecutive positive integers. Their sum, $18a+\frac{17(18)}{2} = 9(2a+17),$ is a perfect square. Since 9 is a perfect square, it follows that $2a + 17$ is a perfect square. The smallest possible such perfect square is 25 when $a = 4$, and the sum is 225 $\Rightarrow \mathrm{(B)}.$
### Solution 2
Notice that all five choices given are perfect squares.

Let a be the smallest number, we have a+$(a+1)+(a+2)+...+(a+17)=18a+\sum_{k=1}^{17}$k=$18a+153$

Subtract 153 from each of the choices and then check its divisibility by 18, we have 225 as the smallest possible sum. $\mathrm$ {(B)}

*~Nafer*
## Solution 1.1
the normal sequence can be described as $N^2+N$ divided by 2.

Since have 18 terms adding $18n$ will increase the consective sequence startering number by 1

$$\frac{(N^2+N)}{2} +18n$$

now subsitute 18 as N

we get $\frac{(18^2+18)}{2} = 171$

put $I^2$ which is integer square and plug in all our results
$$171 + 18n = I^2$$

$$18n = I^2-171 I^2-171 = 0 \pmod{18}$$

subsitute the answer choices starting with B because 169 is less than 171 and results in a neagtive number


$$
225-177 = \pmod{18}
54 = \pmod{18}
$$


54 is divisble by 18 and is therefore the smallest number possible.
## See also
