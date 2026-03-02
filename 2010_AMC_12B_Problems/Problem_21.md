# 2010 AMC 12B Problem 21

## Problem
Let a > 0, and let P(x) be a polynomial with integer coefficients such that

P(1) = P(3) = P(5) = P(7) = a, and

$$P(2) = P(4) = P(6) = P(8) = -a.$$

What is the smallest possible value of a?

$\textbf{(A)}\ 105 \qquad \textbf{(B)}\ 315 \qquad \textbf{(C)}\ 945 \qquad \textbf{(D)}\ 7! \qquad \textbf{(E)}\ 8!$
## Solution 1
We observe that because P(1) = P(3) = P(5) = P(7) = a, if we define a new polynomial R(x) such that R(x) = P(x) - a, R(x) has roots when $P(x) = a$; namely, when $x=1$,3,5,7.

Thus since R(x) has roots when $x=1$,3,5,7, we can factor the product $(x-1)(x-3)(x-5)(x-7)$ out of R(x) to obtain a new polynomial Q(x) such that $(x-1)(x-3)(x-5)(x-7)$(Q(x)) = R(x) = P(x) - a.

Then, noting that P(2)-a=-a-a=-$2a$ etc., and plugging in values of 2,4,6,8, we get


$$
P(2)-a=(2-1)(2-3)(2-5)(2-7)Q(2) = -15Q(2) = -2a
P(4)-a=(4-1)(4-3)(4-5)(4-7)Q(4) = 9Q(4) = -2a
P(6)-a=(6-1)(6-3)(6-5)(6-7)Q(6) = -15Q(6) = -2a
P(8)-a=(8-1)(8-3)(8-5)(8-7)Q(8) = 105Q(8) = -2a
$$


$$-2a=-15Q(2)=9Q(4)=-15Q(6)=105Q(8).$$
Thus, the least value of a must be the $\text{lcm}(15,9,15,105).$
Solving, we receive 315, so our answer is  $\boxed{\textbf{(B)}\ 315}$ .

To complete the solution, we can let $a = 315$, and then try to find Q(x). We know from the above calculation that Q(2)=42, Q(4)=-70, Q(6)=42, and Q(8)=-6. Then we can let Q(x) = T(x)$(x-2)(x-6)+42$, getting T(4)=28, T(8)=-4. Let T(x)=L(x)$(x-8)-4$, then L(4)=-8. Therefore, it is possible to choose $T(x) = -8(x-8)-$4 = -$8x + 60$, so the goal is accomplished. As a reference, the polynomial we get is


$$
P(x) = (x-1)(x-3)(x-5)(x-7)((-8x + 60)(x-2)(x-6)+42) + 315
= -8 x^7+252 x^6-3248 x^5+22050 x^4-84392 x^3+179928 x^2-194592 x+80325
$$

## Solution 2
The evenly-spaced data suggests using [discrete derivatives](https://artofproblemsolving.com/wiki/index.php/discrete_derivative) to tackle this problem.  First, note that any polynomial of degree n

$$P(x) = a_0 + a_1 x + a_2 x^2 + \ldots + a_n x^n$$

can also be written as

$$P(x) = b_0 + b_1 (x-1) + b_2 (x-1)(x-2) + \ldots + b_n (x-1)(x-1) \cdots (x-n).$$

Moreover, the coefficients $a_i$ are integers for $i=1, 2, \ldots$ n iff the coefficients $b_i$ are integers for $i=1, 2, \ldots$ n.  This latter form is convenient for calculating discrete derivatives of P(x).

The discrete derivative of a function f(x) is the related function $\Delta$ f(x) defined as

$$\delta f(x) = f(x+1) - f(x).$$

With this definition, it's easy to see that for any positive integer k we have

$$\Delta [(x-1)(x-2)\cdots(x-k)] = k(x-1)(x-2)\cdots(x-[k-1]).$$

This in turn allows us to use successive discrete derivatives evaluated at $x=1$ to calculate all of the coefficients $b_i$ using


$$P(1) = b_0, \Delta P(1) = b_1, \Delta^2 P(1) = 2 b_2, \ldots, \Delta^7 P(1) = 7! b_7.$$


We can also calculate the following table of discrete derivatives based on the data points given in the problem statement:


 |  | x |
| --- | --- |
|  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| P(x) | a | -a | a | -a | a | -a | a | -a |

$$
| \Delta P(x) | -2a | 2a | -2a | 2a | -2a | 2a | -2a |  |
| \Delta^2 P(x) | 4a | -4a | 4a | -4a | 4a | -4a |  |  |
| \vdots |
| \Delta^7 P(x) | -2^7 a |  |  |  |  |  |  |  |
$$



Thus we can read down the column for $x=1$ to find that k! $b_k= (-2)^k a$ for $k = 0, 1, \ldots, 7.$  Interestingly, even if we choose P(x) to have degree greater than 7, the 8 coefficients of lowest order always satisfy these conditions.  Moreover, it's straightforward to show that the P(x) of degree 7 with $b_k$ satisfying these conditions will fit the data given in the problem statement.  Thus, to find minimal necessary and sufficient conditions on the value of a, we need only consider these 8 equations.  As a result, P(x) with integer coefficients fitting the given data exists iff k! divides $2^k a$ for $k = 0, 1, \ldots, 7.$  In other words, it's necessary and sufficient that

0! | a,

1! | $2a$,

2! | $2^2 a,$

3! | $2^3 a,$

4! | $2^4 a,$

5! | $2^5 a,$

6! | $2^6 a,\text{and}$

7! | $2^7 a.$

The last condition holds if 7 $\cdot 3 \cdot 5 \cdot 3 = 315$ divides evenly into a.  Since such a will also satisfy the first 7 conditions, our answer is  $\boxed{\textbf{(B)}\ 315}$ .
## See Also
