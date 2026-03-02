# 2023 AMC 12B Problem 6

> This problem is the same as [2023 AMC 10B #12](https://artofproblemsolving.com/wiki/index.php/2023_AMC_10B_Problems/Problem_12) and [2023 AMC 12B #6](https://artofproblemsolving.com/wiki/index.php/2023_AMC_12B_Problems/Problem_6).
## Problem
When the roots of the polynomial

$$P(x) = (x-1)^1 (x-2)^2 (x-3)^3 \cdot \cdot \cdot \cdot (x-10)^{10}$$

are removed from the number line, what remains is the union of 11 disjoint open intervals. On how many of these intervals is P(x) positive?

$\textbf{(A)}~3\qquad\textbf{(B)}~7\qquad\textbf{(C)}~6\qquad\textbf{(D)}~4\qquad\textbf{(E)}~5$
## Solution 1
The expressions to the power of even powers are always positive, so we don't need to care about those. We only need to care about ($x-1)^1(x-3)^3(x-5)^5(x-7)^7(x-9)^9$. We need 0, 2, or 4 of the expressions to be negative. The 9 through 10 interval and 10 plus interval make all of the expressions positive. The 5 through 6 and 6 through 7 intervals make two of the expressions negative. The 1 through 2 and 2 through 3 intervals make four of the expressions negative. There are $\boxed{\textbf{(C) 6}}$ intervals.

*~Aopsthedude*
## Solution 2
The roots of the factorized polynomial are intervals from numbers 1 to 10. We take each interval as being defined as the number behind it. To make the function positive, we need to have an even number of negative expressions. Real numbers raised to even powers are always positive, so we only focus on $x-1, x-3, x-5, x-7$, and $x-9$. The intervals 1 and 2 leave 4 negative expressions, so they are counted. The same goes for intervals 5, 6, 9, and 10. Intervals 3 and 4 leave 3 negative expressions and intervals 7 and 8 leave 1 negative expression. The solution is the number of intervals which is $\boxed{\textbf{(C) 6}}.$

*~darrenn.cp*
*~DarkPheonix*
## Solution 3
We can use the turning point behavior at the roots of a polynomial graph to find out the amount of intervals that are positive.

First, we evaluate any value on the interval ($-\infty, 1).$ Since the degree of P(x) is 1+2+...+$9+10 =\frac{10\times11}{2} = 55,$ and every term in P(x) is negative, multiplying 55 negatives gives a negative value. So ($-\infty, 0)$ is a negative interval.

We know that the roots of P(x) are at 1,2,...,10. When the degree of the term of each root is odd, the graph of P(x) will pass through the graph and change signs, and vice versa. So at $x=1$, the graph will change signs; at $x=2$, the graph will not, and so on.

This tells us that the interval (1,2) is positive, (2,3) is also positive, (3,4) is negative, (4,5) is also negative, and so on, with the pattern being +,+,-,-,+,+,-,-,... .

The positive intervals are therefore (1,2), (2,3), (5,6), (6,7), (9,10), and (10,$\infty),$ for a total of $\boxed{\textbf{(C) 6}}.$

*~nm1728 ~ESAOPS (minor edits)*
## Solution 4
Denote by $I_k$ the interval $\left($ k - 1 , k $\right)$ for k $\in \left\{ 2, 3, \cdots , 10 \right\}$ and $I_1$ the interval $\left( - \infty, 1 \right).$

Therefore, the number of intervals that P(x) is positive is

$$
\begin{align*} 1 + \sum_{i=1}^{10} \Bbb I \left\{ \sum_{j=i}^{10} j \mbox{ is even} \right\} & = 1 + \sum_{i=1}^{10} \Bbb I \left\{ \frac{\left( i + 10 \right) \left( 11 - i \right)}{2} \mbox{ is even} \right\} \\ & = 1 + \sum_{i=1}^{10} \Bbb I \left\{ \frac{- i^2 + i + 110}{2} \mbox{ is even} \right\} \\ & = 1 + \sum_{i=1}^{10} \Bbb I \left\{ \frac{i^2 - i}{2} \mbox{ is odd} \right\} \\ & = \boxed{\textbf{(C) 6}} . \end{align*}
$$


*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Solution 5: Graphing
Recall two key facts about the roots of a polynomial:
- If a root has an odd multiplicity (e.g. the root appears an odd number of times), then the graph will cross the x-axis.
- If a root has an even multiplicity (e.g. the root appears an even number of times), then the graph will bounce off the x-axis.

Sketching the graph and noting the multiplicity of the roots, we see that there are $\boxed{C) 6}$ positive intervals.
## Solution 6: Solution 3 with powers
When the range of $P(x)$ is from $\infty$ to $1$, the sign is negative because in

$$(x - 1)^1 (x - 2)^2 (x - 3)^3 \cdots (x - 10)^{10},$$
the terms corresponding to $x = 1, 3, 5, 7,$ and $9$ are all negative, and since they have odd exponents, they contribute a negative sign.
The other terms with even exponents (like $(x - 2)^2, (x - 4)^4$$$, etc.) are positive regardless of the sign inside, so they don't affect the overall sign. However, in the range$\ 1 to \ 2$, the power of 1 flips, causing this range to be positive. For the range 2 - 3, the sign of any even inside the exponent doesn't matter, so this range stays positive. Continueing this pattern, We see the pattern is +, +, -, -, and so on. there are 3 complete cycles, so 3 * 2 =  $\boxed{\textbf{(C) 6}}$
*~BlueKite*
## Video Solution 1 by OmegaLearn.org
https://youtu.be/taNU5dQ5-sA
## Video Solution
https://youtu.be/j8z8rup7KHc

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution by Interstigation
https://youtu.be/2C5MVT_LID8

*~Interstigation*
## See Also
