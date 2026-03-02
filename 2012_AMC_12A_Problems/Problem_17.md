# 2012 AMC 12A Problem 17

## Problem
Let S be a subset of $\{1,2,3,\dots,30\}$ with the property that no pair of distinct elements in S has a sum divisible by 5.  What is the largest possible size of S?

$\textbf{(A)}\ 10\qquad\textbf{(B)}\ 13\qquad\textbf{(C)}\ 15\qquad\textbf{(D)}\ 16\qquad\textbf{(E)}\ 18$
## Solution
Of the integers from 1 to 30, there are six each of 0,1,2,3,4\ ($\text{mod}$\ 5). We can create several rules to follow for the elements in subset S. No element can be 1\ ($\text{mod}$\ 5) if there is an element that is 4\ ($\text{mod}$\ 5). No element can be 2\ ($\text{mod}$\ 5) if there is an element that is 3\ ($\text{mod}$\ 5). Thus we can pick 6 elements from either 1\ ($\text{mod}$\ 5) or 4\ ($\text{mod}$\ 5) and 6 elements from either 2\ ($\text{mod}$\ 5) or 3\ ($\text{mod}$\ 5) for a total of $6+6=12$ elements. Considering 0\ ($\text{mod}$\ 5), there can be one element that is so because it will only be divisible by 5 if paired with another element that is 0\ ($\text{mod}$\ 5). The final answer is $\boxed{\textbf{(B)}\ 13}.$
## Solution 2 (Similar to solution 1 but more detailed)
[Errors to correct below: We don't totally discard 0 (mod 5), since we can still have one of those. The k and x values are largest values, not quantities. So there are 6 numbers in each category.  We take 2 complete categories plus one from the 0 category for a total of 13.]

Since we are taking the sum of distinct numbers mod(5), the only values that can be the remainder is 0,1,2,3,4. There are five different cases for the "allowed" mods in the sequence, or the remainders that the sum of distinct elements are allowed to be in the sequence. They are:

1)      0mod(5)

2)      1mod(5), and 3mod(5)

3)      1mod(5), and 2mod(5)

4)      2mod(5), and 4mod(5),

5)      2mod(5), and 1mod(5)

Now, we can calculate the number of elements in each of these cases. For the first case, we rewrite 1mod(5) in the form $5k+1$. Because $5k+1 < 30$, which is the largest element in the sequence possible, we obtain $k=5$. In addition, for 3mod(5), we have $3x+5<$30, $x=5$. This gives us $5+5=10$ solutions. The reason why we can add these elements is because all of these elements, no matter which two you add, can never be a multiple of 5. The only possible remainders for the sum are 1+1, 1+3, or 3+3.

In a similar manner, we calculate the element using the same logic. We find that 2mod(5) has 5 elements, and 1mod(5) has 8 elements, meaning that there are a total of 13 elements, which is the answer.
*~CharmaineMa07292010*
## Video Solution by OmegaLearn
https://youtu.be/orrw4VydBTk?t=483

*~pi_is_3.14*
## See Also
