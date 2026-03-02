# 2002 AMC 12B Problem 15

## Problem
How many four-digit numbers N have the property that the three-digit number obtained by removing the leftmost digit is one ninth of N?


$$\mathrm{(A)}\ 4 \qquad\mathrm{(B)}\ 5 \qquad\mathrm{(C)}\ 6 \qquad\mathrm{(D)}\ 7 \qquad\mathrm{(E)}\ 8$$

## Solution
Let N = $\overline{abcd} = $1000a + $\overline{bcd},$ such that $\frac{N}{9} = \overline{bcd}.$ Then $1$000a + $\overline{bcd} = 9\overline{bcd} \Longrightarrow $125a = $\overline{bcd}.$ Since 100 $\le \overline{bcd} < 1000,$ from $a = 1, \ldots, 7$ we have 7 three-digit solutions, and the answer is  $\mathrm{(D)}.$
## Solution 1
Since N is a four digit number, assume WLOG that N = $1000a+100b + 10c$ + d, where a is the thousands digit, b is the hundreds digit, c is the tens digit, and d is the ones digit.
Then, $\frac{1}{9}N = 100b + 10c$ + d, so N = $900b+90c + 9d$
Set these equal to each other:

$$
1000a + 100b + 10c + d = 900b + 90c + 9d
1000a = 800b + 80c + 8d
1000a = 8(100b + 10c + d)
$$

Notice that $100b+$10c + d = N - $1000a$, thus:

$$
1000a = 8(N - 1000a)
1000a = 8N - 8000a
9000a = 8N
N = 1125a
$$


Go back to our first equation, in which we set N = $1000a+100b + 10c$ + d,
Then:

$$
1125a = 1000a + 100b + 10c + d
125a = 100b + 10c + d
$$

The upper limit for the right hand side (RHS) is 999 (when $b = 9, c = 9$, and $d = 9$).
It's easy to prove that for an a there is only one combination of b, c, and d that can make the equation equal. Just think about the RHS as a three digit number bcd. There's one and only one way to create every three digit number with a certain combination of digits.
Thus, we test for how many as are in the domain set by the RHS. Since $125\cdot7 = 875$ which is the largest a value, then a can be 1 through 7, giving us the answer of $\boxed$ {D) 7}

IronicNinja~
## Solution 2
Let Let a denote the leftmost digit of N and let x denote the three-digit number obtained by removing a. Then N=$1000a+x=9x$ and it follows that $1000a=8x$. Dividing both sides by 8 yields $125a$=x. All the values of a in the range 1 to 7 result in three-digit numbers, hence there are $\boxed{D)7}$ values for N.

∼Glowworm
## Solution 3 (cases)
Let a, b, c, d denote the number $\overline{abcd}.$ If $a = $1, $\overline{abcd} - 1000 = \frac{\overline{abcd}}{9}.$ Clearly, $\overline{abcd} = 1125.$ Doing the same for 2 yields 2250, and 3 gives 3375. Clearly there is a pattern of adding 125, which works up until 7, after which we get 9000 which clearly doesn't work. Therefore, there are $\boxed$ {D) 7} valid solutions, those being:
1125, 2250, 3375, 4500, 5625, 6750, 7875.

*~Stress-couture*
## See also
