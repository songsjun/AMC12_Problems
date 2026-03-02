# 2017 AMC 12B Problem 11

> This problem is the same as [2017 AMC 12B #11](https://artofproblemsolving.com/wiki/index.php/2017_AMC_12B_Problems) and [2017 AMC 10B #17](https://artofproblemsolving.com/wiki/index.php/2017_AMC_10B_Problems).
## Problem
Call a positive integer **monotonous** if it is a one-digit number or its digits, when read from left to right, form either a strictly increasing or a strictly decreasing sequence. For example, $3$, $23578$, and $987620$ are monotonous, but $88$, $7434$, and $23557$ are not. How many monotonous positive integers are there?

$\textbf{(A)}\ 1024\qquad\textbf{(B)}\ 1524\qquad\textbf{(C)}\ 1533\qquad\textbf{(D)}\ 1536\qquad\textbf{(E)}\ 2048$
## Solution 1
Case 1: monotonous numbers with digits in ascending order

There are $\sum_{n=1}^{9} \binom{9}{n}$ ways to choose n digits from the digits 1 to 9. For each of these ways, we can generate exactly one monotonous number by ordering the chosen digits in ascending order. Note that 0 is not included since it will always be a leading digit and that is not allowed. Also, $\emptyset$ (the empty set) isn't included because it doesn't generate a number. The sum is equivalent to $\sum_{n=0}^{9} \binom{9}{n} -\binom{9}{0} = 2^9 - 1 = 511.$

Case 2: monotonous numbers with digits in descending order

There are $\sum_{n=1}^{10} \binom{10}{n}$ ways to choose n digits from the digits 0 to 9. For each of these ways, we can generate exactly one monotonous number by ordering the chosen digits in descending order. Note that 0 is included since we are allowed to end numbers with zeros. However, $\emptyset$ (the empty set) still isn't included because it doesn't generate a number. The sum is equivalent to $\sum_{n=0}^{10} \binom{10}{n} -\binom{10}{0} = 2^{10} - 1 = 1023.$ We discard the number 0 since it is not positive. Thus there are $1022$ here.

Since the 1-digit numbers 1 to 9 satisfy both case 1 and case 2, we have overcounted by 9. Thus there are $\boxed{\textbf{(B) }  1524}$ monotonous numbers.
## Solution 2
Like Solution 1, divide the problem into an increasing and decreasing case:

$\bullet$ Case 1: Monotonous numbers with digits in ascending order.

Arrange the digits 1 through 9 in increasing order, and exclude 0 because a positive integer cannot begin with 0.

To get a monotonous number, we can either include or exclude each of the remaining 9 digits, and there are $2^9 = 512$ ways to do this. However, we cannot exclude every digit at once, so we subtract 1 to get $512-1=511$ monotonous numbers for this case.

$\bullet$ Case 2: Monotonous numbers with digits in descending order.

This time, we arrange all 10 digits in decreasing order and repeat the process to find $2^{10} = 1024$ ways to include or exclude each digit. We cannot exclude every digit at once, and we cannot include only 0, so we subtract 2 to get $1024-2=1022$ monotonous numbers for this case.

At this point, we have counted all of the single-digit monotonous numbers twice, so we must subtract 9 from our total.

Thus our final answer is $511+1022-9 = \boxed{\textbf{(B) } 1524}$.
## Solution 3
Unlike the first two solutions, we can do our casework based off of whether or not the number contains a $0$.

If it does, then we know the $0$ must be the last digit in the number (and hence, the number has to be decreasing). Because $0$ is not positive, $0$ is not monotonous. So, we need to pick at least $1$ number in the set $[1, 9].$ After choosing our numbers, there will be just $1$ way to arrange them so that the overall number is monotonous.

In total, each of the $9$ digits can either be in the monotonous number or not, yielding $2^9 = 512$ total solutions. However, we said earlier that $0$ cannot be by itself so we have to subtract out the case in which we picked none of the numbers $1-9$. So, this case gives us $511$.


Onto the second case, if there are no $0$s, then the number can either be arranged in ascending order or in descending order. So, for each selection of the digits $1- 9$, there are $2$ solutions. This gives

$$2 \cdot (2^9 - 1) = 2 \cdot 511 = 1022$$

 possibilities. Note that we subtracted out the $1$ because we cannot choose none of the numbers.

However, realize that if we pick just $1$ digit, then there is only $1$ arrangement. We cannot put a single digit in both ascending and descending order. So, we must subtract out $9$ from there (because there are $9$ possible ways to select one number and for each case, we overcounted by $1$).

All in all, that gives $511 + 1022 - 9 = \boxed{\textbf{(B)  } 1524}$ monotonous numbers.
## Solution 4
Let $n$ be the number of digits of a monotonous number. Notice for an increasing monotonous number with $n \ge 2$, we can obtain 2 more monotonous numbers that are decreasing by reversing its digits and adding a $0$ to the end of the reversed digits. Whenever $n$ digits are chosen, the order is fixed. There are $\binom{9}{n}$ ways to obtain an increasing monotonous number with $n$ digits. So, there are $\cdot \sum_{n=2}^{9} \binom{9}{n}$ monotonous numbers when $n \ge 2$. When $n=1$, there is no reverse but we could add $0$ to the end, so there are $2 \cdot \binom{9}{1}$ monotonous numbers.

The answer is:

$3\cdot \sum_{n=2}^{9} \binom{9}{n} + 2 \cdot \binom{9}{1}=3\cdot \sum_{n=1}^{9} \binom{9}{n}  -  \binom{9}{1}=3\cdot \left( \sum_{n=0}^{9} \binom{9}{n} - \binom{9}{0} \right) -  \binom{9}{1}= 3 \cdot (2^9-1) - 9=\boxed{\textbf{(B)  } 1524}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 5 (Casework / 1-1 Correspondence)
We have 2 cases.

**Case 1: Ascending order**

We can set up a 1-1 Correspondence. For any subset of all the digits $1$ to 9 ($0$ cannot be a digit for ascending order), we can always rearrange them into an ascending monotonous number. Therefore, the number of subsets of the integers $1$ to $9$ is equivalent to the number of ascending integers. So, $2^9=512$. However, the empty set $(\emptyset)$ is not an integer, so we must subtract 1. Thus, $512-1=511$.

**Case 2: Descending order**

Similarly, any subset of the digits $0$ to $9$ can be rearranged into a descending monotonous number. So, $2^{10}=1024$. However, $\emptyset$ and $0$ are not *positive* integers, so we must subtract 2. Thus, $1024-2=1022$.


We have covered all the cases. We add $511 to 1022$, giving us $1533$. So now we just innocently go ahead and choose $\textbf{(C) } 1533$ as our answer, right? No! We overcounted the $9$ *single-digit integers*. The answer is actually $\boxed{\textbf{(B)  } 1524}$.

*~MrThinker*
## See Also
