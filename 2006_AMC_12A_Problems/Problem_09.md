# 2006 AMC 12A Problem 9

## Problem
Oscar buys 13 pencils and 3 erasers for 1.00. A pencil costs more than an eraser, and both items cost a [whole number](https://artofproblemsolving.com/wiki/index.php/whole_number) of cents. What is the total cost, in cents, of one pencil and one eraser?


$$\mathrm{(A)}\ 10\qquad\mathrm{(B)}\ 12\qquad\mathrm{(C)}\ 15\qquad\mathrm{(D)}\ 18\qquad\mathrm{(E)}\ 20$$

## Solution 1
Let the price of a pencil be p and an eraser e.  Then $13p+3e = 100$ with p > e > 0.  Since p and e are [positive integer](https://artofproblemsolving.com/wiki/index.php/positive_integer)s, we must have e $\geq 1$ and p $\geq 2.$

Considering the [equation](https://artofproblemsolving.com/wiki/index.php/equation) $13p+3e = 100$ [modulo](https://artofproblemsolving.com/wiki/index.php/modulo) 3 (that is, comparing the [remainder](https://artofproblemsolving.com/wiki/index.php/remainder)s when both sides are divided by 3) we have p + $0e\equiv 1 \pmod 3$ so p leaves a remainder of 1 on division by 3.

Since p $\geq 2,$ possible values for p are 4, 7, 10 ....

Since 13 pencils cost less than 100 cents, $13p < 100.  13 \times 10 = 130$ is too high, so p must be 4 or 7.

If $p = 4$ then $13p = 52$ and so $3e = 48$ giving $e = 16$.  This contradicts the pencil being more expensive.  The only remaining value for p is 7; then the 13 pencils cost 7 $\times 13= 91$ cents and so the 3 erasers together cost 9 cents and each eraser costs $\frac{9}{3} = 3$ cents.

Thus one pencil plus one eraser cost $7 + 3 = 10$ cents, which is answer choice $\mathrm{(A) \ }.$
## Solution 2
Since we know that the values of pencils and erasers are both whole numbers, and that there are 3 erasers and 13 pencils, we can choose numbers to be the value for the pencil, and if the remainder to 1.00 is divisible by 3, we know our answer is correct. There are 7 numbers to check, although we can eliminate 1, 2, 3, 4, and 5 mentally, since those numbers would probably have the cost of erasers higher than the cost of pencils (6 would too, but it is faster to just test 6). Trying 6, 13 $\cdot 6 = 72. 28$ is not divisible by 3, so we know that this number is not correct. Moving on to 7, 13 $\cdot 7 = 91.$ We know that 9 is a multiple of 3, so this value works!

Since the total cost of erasers is 9 cents, we know the individual eraser is $\frac{9}{3} = 3. 3 + 7 = 10$ so our answer is answer choice $\mathrm{(A) \ }$

*~Shadow-18*
## See also
