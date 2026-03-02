# 2014 AMC 12A Problem 16

> This problem is the same as [2014 AMC 12A #16](https://artofproblemsolving.com/wiki/index.php/2014_AMC_12A_Problems) and [2014 AMC 10A #20](https://artofproblemsolving.com/wiki/index.php/2014_AMC_10A_Problems).
## Problem
<!-- don't remove the following tag, for PoTW on the Wiki front page--><onlyinclude>The product $(8)(\dots8)$, where the second factor has $k$ digits, is an integer whose digits have a sum of $1000$.  What is $k$?<!-- don't remove the following tag, for PoTW on the Wiki front page--></onlyinclude>

$\textbf{(A)}\ 901\qquad\textbf{(B)}\ 911\qquad\textbf{(C)}\ 919\qquad\textbf{(D)}\ 991\qquad\textbf{(E)}\ 999$
## Solution 1
We can list the first few numbers in the form $8 \cdot (8....8)$

(Hard problem to do without the multiplication, but you can see the pattern early on)

$8 \cdot 8 = 64$

$8 \cdot 88 = 704$

$8 \cdot 888 = 7104$

$8 \cdot 8888 = 71104$

$8 \cdot 88888 = 711104$

By now it's clear that the numbers will be in the form $7$, $k-21$'s, and $04$. We want to make the numbers sum to 1000, so $7+4+(k-2) = 1000$. Solving, we get $k = 991$, meaning the answer is $\boxed{\textbf{(D) } 991}$

Another way to proceed is that we know the difference between the sum of the digits of each product and $k$ is always $9$, so we just do $\boxed{\textbf{(D) } 991}$.
### Proof of Solution 1
Since this solution won't fly on a proof-based competition, here's a proof that it's valid:

We will call $x_k=8(\dots8)$ with exactly $k8$s. We then rewrite this more formally, as:


$$x_k=8\biggr(\sum_{n=0}^{k-1}8(10)^n\biggr)$$


$$=64\biggr(\sum_{n=0}^{k-1}(10)^n\biggr)$$


$$=64\frac{10^{k}-1}{9}$$


Then, finding a recursive formula, we get:


$$x_{k+1}=64\times 10^{k}+x_k$$


We will now use induction, Our base case will be $k=2$. It's easy to see that this becomes $x_2=704$. Then, the $k+1$ case: let $x_k=7111\dots104$ with $k-21$s. Then $x_{k+1}=64000\dots000+7111\dots104$. Adding these numbers, we get $x_{k+1}=71111\dots104$.

Summing these digits, we have $4+7+(k-2)=1000$, giving us $k=991$.
## Solution 2 (Educated Guessing if you have no time)
We first note that $125 \cdot 8 = 1000$ and so we assume there are $1258s$.

Then we note that it is asking for the second factor, so we subtract $1$(the original $8$ in the first factor).

Now we have $125-1=124.$ The second factor is obviously a multiple of $124$.

Listing the first few, we have $124, 248, 372, 496, 620, 744, 868, 992, 1116, 1240, ...$

We notice that the 4th answer choice is 1 less than a $992(a multiple of 124.)$

Thus we make an educated guess that it is somehow less by 1, so we get $\fbox{(D)}$. ~mathboy282
### Note (Must Read)
We were just lucky; this method is NOT reliable. Please note that this probably will not work for other problems; it is just a lucky coincidence.
## Solution 3
You can write the expression as $8(8*10^k + 8*10^k-1...)$

This equals $64*10^k + 64*10^k-1$...so if we add an example we see something.

6400000000+

0640000000+

0064000000+

0006400000+

0000640000+

0000064000+

0000006400+

0000000640+

$$0000000064=$$

7111111104

You see that is just 7 - M $1s- 04$

There have to be $1000 - 7 - 4 = 9891s$.

When you divide 7111... by 8, the answer, since $7 < 8$, is 1 digit less.

So we get $992 - 1 = 991$, which is $\fbox{(D)}$. ~vedantinity
## Video Solution
https://youtu.be/wQzuQZvq8sk

*~savannahsolver*
## See Also
