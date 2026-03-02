# 2009 AMC 12A Problem 15

## Problem
For what value of n is i + $2i^2+3i^3 + \cdots +ni^n = 48+49i$?

Note: here i = $\sqrt$ { - 1}.

$\textbf{(A)}\ 24 \qquad \textbf{(B)}\ 48 \qquad \textbf{(C)}\ 49 \qquad \textbf{(D)}\ 97 \qquad \textbf{(E)}\ 98$
## Solution 1
We know that $i^x$ cycles every 4 powers so we group the sum in $4s$.

$$
i+2i^2+3i^3+4i^4=2-2i
5i^5+6i^6+7i^7+8i^8=2-2i
$$


We can postulate that every group of 4 is equal to 2-$2i$.
For 24 groups we thus, get 48-$48i$ as our sum.
We know the solution must lie near
The next term is the 24*$4+1=97$th term. This term is equal to $97i$ (first in a group of 4 so $i^{97}$=i) and our sum is now 48+$49i$ so $n=97\Rightarrow\boxed{\mathbf{D}}$ is our answer
## Solution 2
Obviously, even powers of i are real and odd powers of i are imaginary.
Hence the real part of the sum is $2i^2+4i^4 + 6i^6+\ldots,$ and
the imaginary part is i + $3i^3+5i^5 + \cdots.$

Let's take a look at the real part first. We have $i^2=-1,$ hence the real part simplifies to $-2+4-6+8-10+\cdots.$
If there were an odd number of terms, we could pair them as follows: -2 + (4-6) + (8-10) + $\cdots,$ hence the result would be negative. As we need the real part to be 48, we must have an even number of terms. If we have an even number of terms, we can pair them as (-2+4) + (-6+8) + $\cdots.$ Each parenthesis is equal to 2, thus there are 24 of them, and the last value used is 96. This happens for $n=96$ and $n=97. As n=96$ is not present as an option, we may conclude that the answer is $\boxed{97}.$

In a complete solution, we should now verify which of $n=96$ and $n=97$ will give us the correct imaginary part.

We can rewrite the imaginary part as follows: i + $3i^3+5i^5 + \$cdots = i(1 + $3i^2+5i^4 + \cdots) =$ i(1 - 3 + 5 - $\cdots).$ We need to obtain (1 - 3 + 5 - $\cdots) = 49.$ Once again we can repeat the same reasoning: If the number of terms were even, the left hand side would be negative, thus the number of terms is odd. The left hand side can then be rewritten as 1 + (-3+5) + (-7+9) + $\cdots.$ We need 24 parentheses, therefore the last value used is 97. This happens when $n=97$ or $n=98$, and we are done.
## Solution 3 (Fast)
Some may know the equation:

$$\sum_{k=1}^{n}kr^{k-1}=\frac{1-(n+1)r^n+nr^{n+1}}{(1-r)^2}$$

(For those curious, this comes from differentiating the equation for finite geometric sums)

Using this equation, we have


$$
48+49i=i\frac{1-(n+1)i^n+ni^{n+1}}{(1-i)^2}
=\frac{1-(n+1)i^n+ni^{n+1}}{-2}
=-\frac{1}{2}+\frac{(n+1)i^n}{2}-\frac{ni^{n+1}}{2}
$$


Since the imaginary and the real part must be positive, we know that $i^{n+1}$=-1 or $i^{n+1}$=-i. By the same line of reason, $i^{n}=1$,i. This only works for $n\equiv 1 \mod 4.$ Therefore, we have:

$$\frac{-1+n}{2}+\frac{(n+1)i}{2}=48+49i$$

Solving either the real or imaginary part gives $\boxed{\mathbf{(D) }97}$
## Video Solution
https://youtu.be/VfgUhcw112s

*~savannahsolver*
## See Also
