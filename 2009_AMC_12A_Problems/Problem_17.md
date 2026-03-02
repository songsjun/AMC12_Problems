# 2009 AMC 12A Problem 17

## Problem
$Let a + ar_1 + ar_1^2 + ar_1^3 +\cdots$ and $a + ar_2 + ar_2^2 + ar_2^3 +\cdots$ be two different infinite geometric series of positive numbers with the same first term.  The sum of the first series is $r_1$, and the sum of the second series is $r_2$.  What is $r_1+r_2$?

$\textbf{(A)}\ 0\qquad \textbf{(B)}\ \frac {1}{2}\qquad \textbf{(C)}\ 1\qquad \textbf{(D)}\ \frac {1 + \sqrt {5}}{2}\qquad \textbf{(E)}\ 2$
## Solution
Using the formula for the sum of a geometric series we get that the sums of the given two sequences are $\frac$ a{1-$r_1$} and $\frac$ a{1-$r_2$}.

Hence we have $\frac$ a{1-$r_1} = r_1$ and $\frac$ a{1-$r_2} = r_2$.
This can be rewritten as $r_1(1-r_1) = r_2(1-r_2$) = a.

As we are given that $r_1$ and $r_2$ are distinct, these must be precisely the two roots of the equation $x^2 - x +a = 0$.

Using [Vieta's formulas](https://artofproblemsolving.com/wiki/index.php/Vieta's_formulas) we get that the sum of these two roots is $\boxed{1}.$
## Solution 2
Using the previous solution we reach the equality $r_1(1-r_1) = r_2(1-r_2$).

Obviously, since $r_1\neqr_2$, then $r_1 = 1-r_2$ so $r_1+r_2 = 1$.

*~Vignesh Peddi*
## Solution 3
We basically have two infinite geometric series whose sum is equivalent to the common ratio. Let us have a geometric series: $b, br, br^2......$

The sum is: $\frac{b}{1-r} =$ r. Thus, b = r-r^2 and by Vieta's, the sum of the two possible values of r ($r_1$ and $r_2$) is 1.

*~conantwiz2023*
## Alternate Solution
Using the formula for the sum of a geometric series we get that the sums of the given two sequences are $\frac$ a{1-$r_1$} and $\frac$ a{1-$r_2$}.

Hence we have $\frac$ a{1-$r_1} = r_1$ and $\frac$ a{1-$r_2} = r_2$.
This can be rewritten as $r_1(1-r_1) = r_2(1-r_2$) = a.

Which can be further rewritten as $r_1-r_1^2 =r_2-r_2^2$.
Rearranging the equation we get $r_1-r_2 = r_1^2-r_2^2$.
Expressing this as a difference of squares we get  $r_1-r_$2 = (r_1-r_2)(r_1+r_2)$$.

Dividing by like terms we finally get $r_1+r_2 = \boxed{1}$ as desired.

Note: It is necessary to check that $r_$1-r_$2\ne 0,$ as you cannot divide by zero. As the problem states that the series are different, $r_1\ner_2$, and so there is no division by zero error.
## See Also
