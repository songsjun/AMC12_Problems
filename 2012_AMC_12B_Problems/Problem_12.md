# 2012 AMC 12B Problem 12

## Problem
How many sequences of zeros and ones of length 20 have all the zeros consecutive, or all the ones consecutive, or both?

$\textbf{(A)}\ 190\qquad\textbf{(B)}\ 192\qquad\textbf{(C)}\ 211\qquad\textbf{(D)}\ 380\qquad\textbf{(E)}\ 382$
## Solutions
### Solution 1
There are $\binom{20}{2}$ selections; however, we count these twice, therefore

$2\cdot\binom{20}{2} = \boxed{\textbf{(D)}\ 380}.$ The wording of the question implies D, not E.

However, MAA decided to accept both D and E and F.
### Solution 2
Consider the 20 term sequence of 0's and 1's.  Keeping all other terms 1, a sequence of k>0 consecutive 0's can be placed in 21-k locations. That is, there are 20 strings with 1 zero, 19 strings with 2 consecutive zeros, 18 strings with 3 consecutive zeros, ..., 1 string with 20 consecutive zeros. Hence there are $20+19+\cdots+1=\binom{21}{2}$ strings with consecutive zeros. The same argument shows there are $\binom{21}{2}$ strings with consecutive 1's. This yields $2\binom{21}{2}$ strings in all. However, we have counted twice those strings in which all the 1's and all the 0's are consecutive. These are the cases 01111..., 00111..., 000111..., ..., 000...0001 (of which there are 19) as well as the cases 10000..., 11000..., 111000..., ..., 111...110 (of which there are 19 as well). This yields $2\binom{21}{2}-2\cdot19=\boxed{\textbf{(E)}\ 382}$
## Solution 3
First, we think of ways to make all the 1's consecutive. If there are no consecutive 1's, there are $\binom{20}{0}$ ways to order them. If there is one consecutive 1, there are $\binom{20}{1}$ ways to order them. If there are two consecutive 1's, then there are $\binom{19}{1}$ ways to order them (We treat the two 1's like a block, and then order that block with 18 other 0's). Continuing in this fashion, there are $\binom{20}{0} + \binom{20}{1} + \binom{19}{1} + \cdots + \binom{1}{1} = 1 + 20 + 19 + \cdots + 2 + 1 = 210 + 1 = 211$ ways to order consecutive 1's. From symmetry, there are also 211 ways to order the 0's. Now, from PIE, we subtract out the cases where both the 1's and the 0's are consecutive. We do this because when counting the ways to order the 1's, we counted all of these cases once. Then, we did so again when ordering the 0's. So, to only have all of these cases once, we must subtract them. If 1 is the leftmost digit, then there are 20 cases where all the 1's and 0's are consecutive (we basically are choosing how many 1's are consecutive, and there are 20 possibilities. All other digits become 0, which are automatically consecutive since the 1's are consecutive. There are also 20 cases when 0 is the left-most digit. Thus, there are a total of 211 + 211 - 20 - 20 = $\boxed{\textbf{(E)}\ 382}.$ But, from the way the problem is worded, it somewhat implies that the orderings must include both 1's and 0's, so the answer would then be $\boxed{\textbf{(D)}\ 380}$ after we subtract out the cases where the orderings are either all 1's or all 0's. But, since this is unclear, MAA accepted both $\boxed{\textbf{(D}\ 380}$ and $\boxed{\textbf{(E)}\ 382}$ as acceptable answers.
### Solution 4
We consider two cases, and subtract their overcount.

Case 1: Consecutive $0s$

If we have one consecutive 0, then we have 20 ways.
If we have two consecutive $0s$, then we have 19 ways by thinking of the two consecutives as a block.
Continuing this pattern, if we have twenty consecutive $0s$, then we have only 1 way.

Therefore, we have
$20+19+\cdots+1=\binom{21}{2}$ ways for this case.

Case 2: Consecutive $1s$

Notice that if we just swap every 0 to a 1 in the previous case, we also have a valid arrangement.
Hence, we also have $20+19+\cdots+1=\binom{21}{2}$ ways for this case.

Overcount:
Notice that we can have BOTH the $0s$ and the $1s$ be consecutive. These are the cases 01111..., 00111..., 000111..., ..., 000...0000 which gives us 20 ways being overcounted. If we invert the $0s$ to $1s$, we similarly have 20 more ways, hence we need to subtract 40 from our total count. (Note: this method of overcounting subtracts out the all $0s$ and the all $1s$ case since the problem implies that there needs to be at least one of each)

So we have $210 + 210 - 40 = 380$ ways which gives us $\boxed{\textbf{(D)}\ 380}.$

*~xHypotenuse*
## See Also
