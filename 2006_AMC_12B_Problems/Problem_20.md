# 2006 AMC 12B Problem 20

## Problem
Let x be chosen at random from the interval (0,1). What is the probability that
$$\lfloor\log_{10}4x\rfloor - \lfloor\log_{10}x\rfloor = 0?$$
Here $\lfloorx\rfloor$ denotes the greatest integer that is less than or equal to x.


$$\mathrm{(A)}\ \frac 18 \qquad \mathrm{(B)}\ \frac 3{20} \qquad \mathrm{(C)}\ \frac 16 \qquad \mathrm{(D)}\ \frac 15 \qquad \mathrm{(E)}\ \frac 14$$

## Solution
Let k be an arbitrary integer. For which x do we have $\lfloor\log_{10}4x\rfloor = \lfloor\log_{10}x\rfloor =$ k?

The equation $\lfloor\log_{10}x\rfloor =$ k can be rewritten as $10^k\leq$ x < $10^{k+1}$. The second one gives us $10^k\leq 4x < 10^{k+1}$. Combining these, we get that both hold at the same time if and only if $10^k\leq$ x < $\frac{10^{k+1}}4.$

Hence for each integer k we get an interval of values for which $\lfloor\log_{10}4x\rfloor - \lfloor\log_{10}x\rfloor = 0.$ These intervals are obviously pairwise disjoint.

For any $k\geq 0$ the corresponding interval is disjoint with (0,1), so it does not contribute to our answer. On the other hand, for any k<0 the entire interval is inside (0,1). Hence our answer is the sum of the lengths of the intervals for k<0.

For a fixed k the length of the interval $\left$[ 10^k, $\frac{10^{k+1}}4 \right)$ is $\frac 32\cdot 10^k.$

This means that our result is $\frac 32 \left( 10^{-1} + 10^{-2} + \cdots \right) = \frac 32 \cdot \frac 19 = \boxed{\frac 16}.$
## Solution 2
The largest value for x is $10^{0}$. If x > $10^{-1}$, then $\lfloor\log_{10}4x\rfloor$ doesn't fulfill the condition unless $10^{-2}\leq$ x < 0.25 * $10^{-1}$. The same holds when you get smaller, because $x = 0.25*10^{n}$ for n $\leq 0$ is the lowest value such that $4x$ becomes a higher power of 10.

Recognize that this is a geometric sequence. The probability of choosing x such that  $\lfloor\log_{10}4x\rfloor$ and $\lfloor\log_{10}x\rfloor$ both equal -1 is (9/10)* (15/90) =15/100, because there is a 90 percent chance of choosing x > $10^{-1}$, and only values of x between $10^{-1}$ and 0.25*$10^{0}$ work in this case. Then, for x such that $\lfloor\log_{10}4x\rfloor$ and $\lfloor\log_{10}x\rfloor$ both equal -2, you have (1/10) * ((9/10) *(15/90)). This is a geometric series with ratio 1/10. Using a/(1-r) for the sum of an infinite geometric sequence, we get (15/100)/(1-(1/10)) = $\boxed{\frac 16}.$

Solution by Halt_CatchFire
## See also
