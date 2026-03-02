# 2018 AMC 12A Problem 13

> This problem is the same as [2018 AMC 10A #18](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_18) and [2018 AMC 12A #13](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_13).
## Problem
How many nonnegative integers can be written in the form

$$a_7\cdot3^7+a_6\cdot3^6+a_5\cdot3^5+a_4\cdot3^4+a_3\cdot3^3+a_2\cdot3^2+a_1\cdot3^1+a_0\cdot3^0,$$


where $a_i\in \{-1,0,1\}$ for $\le i \le 7$?

$\textbf{(A) } 512 \qquad
$\textbf{(B) } 729 \qquad$
$\textbf{(C) } 1094 \qquad$
$\textbf{(D) } 3281 \qquad$
$\textbf{(E) } 59,048$$
## Solution 1
This looks like balanced ternary, in which all the integers with absolute values less than $\frac{3^n}{2}$ are represented in $n$ digits. There are 8 digits. Plugging in 8 into the formula for the balanced ternary gives a maximum bound of $|x|=3280.5$, which means there are 3280 positive integers, 0, and 3280 negative integers. Since we want all nonnegative integers, there are $\boxed{3281}$ integers or $\boxed{\textbf{D}}$.
## Solution 2
Note that all numbers formed from this sum are either positive, negative or zero. The number of positive numbers formed by this sum is equal to the number of negative numbers formed by this sum, because of symmetry. There is only one way to achieve a sum of zero, if all $a_i=0$. The total number of ways to pick $a_i$ from $i=0, 1, 2, 3, ... 7$ is $3^8=$6561. $\frac{6561-1}{2}=3280$ gives the number of possible negative integers. The question asks for the number of non-negative integers, so subtracting from the total gives $\boxed{\textbf{(D) } 3281}$. (RegularHexagon, KLBBC minor changes)
## Solution 3 (Answer choices)
Note that the number of total possibilities (ignoring the conditions set by the problem) is $3^8=6561$. So, E is clearly unrealistic.

Note that if $a_7$ is 1, then it's impossible for

$$a_7\cdot3^7+a_6\cdot3^6+a_5\cdot3^5+a_4\cdot3^4+a_3\cdot3^3+a_2\cdot3^2+a_1\cdot3^1+a_0\cdot3^0,$$

 to be negative. Therefore, if $a_7$ is 1, there are $3^7=2187$ possibilities. (We also must convince ourselves that these $2187$ different sets of coefficients must necessarily yield $2187$ different integer results.)

As A, B, and C are all less than 2187, the answer must be $\boxed{\textbf{(D) } 3281}$
## Solution 4
Note that we can do some simple casework:
If $a_7=1$, then we can choose anything for the other 7 variables, so this give us $3^7$.
If $a_7=0$ and $a_6=1$, then we can choose anything for the other 6 variables, giving us $3^6$.
If $a_7=0, a_6=0$, and $a_5=1$, then we have $3^5$.
Continuing in this vein, we have $\cdots+3^1+3^0$ ways to choose the variables' values, except we have to add 1
because we haven't counted the case where all variables are 0. So our total sum is $\boxed{\textbf{(D) } 3281}$.
Note that we have counted all possibilities, because the largest positive positive power of 3 must be greater than or equal to the largest negative positive power of 3, for the number to be nonnegative.
## Solution 5 (Casework and Recursion)
This solution has a similar idea to that of above.
We will start off with casework on $a_{7}$:
If $a_7 = -1$, we can show that there is no way to assign the values of $-1, 0, 1$ to the other $a_{i}$'s for $0 \leq i \leq 6$. This is because even if we make all of the other $a_{i}$ equal to $1$, we will have that our number is $(-1)(3^{7}) + (3^{6}+3^{5}+...+3^{0}) = -3^{7} + \frac{3^{7}-1}{3-1}$. However, note that since $\frac{3^{7}-1}{3-1} < 3^{7}$, -$3^{7} + \frac{3^{7}-1}{3-1} < 0$.
If $a_{7}=0$, we can ignore $a_{7}$ and pretend like it never even existed. This then simplifies the problem: the question remains the same, except that instead of having $a_{0}...a_{7}$, we only have $a_{0}...a_{6}$. Now, we introduce some notation: let the number of nonnegative integers that can be written in the form of $a_{n} \cdot 3^{n} + ... + a_{0} \cdot 3^{0}$ be denoted as $S_{n}$. Then, the problem is asking us for $S_{7}$, and the total number of nonnegative integers we get from this case is $S_{6}$. Let's keep this in mind and revisit this idea later.
If $a_{7}=1$, we can show that no matter what values we assign to the rest of the $a_{i}$, we will always get a nonnegative integer (we can make this even stricter and say positive integer). This is because of something we figured out in the first case: $\frac{3^{7}-1}{3-1} < 3^{7}$. So, even if we let $a_{i}=-1$ for $0 \leq i \leq 6$, we will still have $3^{7} - (3^{6}+...+3^{0}) > 0$. So, for this case, we have $3^7$ possible nonnegative integers.
Totalling up our values from the three cases, we see that $S_{7} = 0 + S_{6} + 3^{7}$. In fact, using the reasoning from the three cases above, we can deduce that, for all positive integers $n$, $S_{n} = 3^{n} + S_{n-1}$. We can now start building up our values for $S$: $S_{0} = 2 (a_{0} = 0, 1), S_{1} = 3^{1}+S_{0} = 5, S_{2} = 14, ..., S_{6}=1094$. So, we have $S_{7} = 2187 + 1094 = \boxed{3281}$, which is answer choice $\boxed{\text{D}}$.
*~advanture*
## Solution 6
The key is to realize that this question is basically taking place in $a\in\{0,1,2\}$ if each value of $a$ was increased by $1$, essentially making it into base $3$. Then the range would be from $\cdot3^7+\cdot3^6+\cdot3^5+\cdot3^4+\cdot3^3+\cdot3^2+\cdot3^1+\$cdot3^0= $0$ to $\cdot3^7+\cdot3^6+\cdot3^5+\cdot3^4+\cdot3^3+\cdot3^2+\cdot3^1+\$cdot3^0= $3^$8-1= $6$561-1= $6560$, yielding $6561$ different values. Since the distribution for all $a_i\in \{-1,0,1\}$ the question originally gave is symmetrical, we retain the $3280$ positive integers and one $0$ but discard the $3280$ negative integers. Thus, we are left with the answer, $\boxed{\textbf{(D)} 3281}\qquad$.  --anna0kear
## Solution 7
First, set $a_i=0$ for all $i\geq1$. The range would be the integers for which $[-1,1]$. If $a_i=0$ for all $i\geq2$, our set expands to include all integers such that $\leq\mathbb{Z}\leq4$. Similarly, when $i\geq3$ we get $\leq\mathbb{Z}\leq13$, and when $i\geq4$ the range is $\leq\mathbb{Z}\leq40$. The pattern continues until we reach $i=7$, where $\leq\mathbb{Z}\leq3280$. Because we are only looking for positive integers, we filter out all $\mathbb{Z}<0$, leaving us with all integers between $\leq\mathbb{Z}\leq3280$, inclusive. The answer becomes $\boxed{\textbf{(D) } 3281}$.  --anna0kear
## Solution 8
To get the number of integers, we can get the highest positive integer that can be represented using

$$a_7\cdot3^7+a_6\cdot3^6+a_5\cdot3^5+a_4\cdot3^4+a_3\cdot3^3+a_2\cdot3^2+a_1\cdot3^1+a_0\cdot3^0,$$


where $a_i\in \{-1,0,1\}$ for $\le i \le 7$.

Note that the least nonnegative integer that can be represented is $0$, when all $a_i=0$. The highest number will be the number when all $a_i=1$. That will be

$$3^7+3^6+3^5+3^4+3^3+3^2+3^1+3^0=\frac{3^8-1}{3-1}$$



$$=3280$$


Therefore, there are $3280$ positive integers and $(3280+1)$ nonnegative integers (while including $0$) that can be represented. Our answer is $\boxed{\textbf{(D) } 3281}$

*~OlutosinNGA*
## Solution 9
Notice that there are $3^8$ options for $a_7, a_6, \cdots a_0$ since each $a_i$ can take on the value $-$1, $0$, or $1$. Now we want to find how many of them are positive and then we can add one in the end to account for $0$ (they are asking for non-negative).

By symmetry (look out for these on the contest), we see that exactly half of them are positive. So $\lfloor{\tfrac{3^8}{2}}\rfloor = 3280.$ Now we will add $1$ because of the $0$ to account for the non-negative solutions.

So our final answer is $3280 + 1 = 3281$ which is $\boxed{\textbf{(D) } 3281}$.
## Solution 10
Obviously, there are $3^8 = 6561$ possible, and one of them is 0, so other $6560$ are either positive or negative. By the symmetry, we can get the answer is $6560/2 + 1$ which is $\boxed{\textbf{(D) } 3281}$.

*~Little*
## Solution 11 (2 seconds)
The solution has to obviously be smaller than $3^{7-0+1}=3^8$ but larger than $3^{(7-0+1)-1} = 3^7.$ The only remaining answer is $\boxed{\textbf{(D) } 3281}.$
*~mathboy282*
## Solution 12 (Sets)
Define Set $S=\{3^0, 3^1, 3^2, 3^3, 3^4, 3^5, 3^6, 3^7\}$.

Suppose $T$ is a subset of $S$ with $k$ values. Then we can express $\sum_{m=0}^{7} a_m3^m$ as


$$\sum_{d \in T} \pm d$$


Even though we can arbitrarily assign $a_d$ for all $d \in T$ as either $-1$ or $1$, because $\sum_{d \in T} \pm d$ needs to be nonnegative, for the largest element $n$ of $Ta_n$ must be equal to $1$. This means that for any subset $T$ with $k$ values there are $2^{k-1}$ ways to assign $a_d$ for all $d \in T$.

Moreover, there are $\binom{8}{k}$ subsets $T$ of $S$ with $k$ values. So our total number of positive numbers that could be expressed as $\sum_{m=0}^{7} a_m3^m$ is


$$\sum_{k=1}^{8} \binom{8}{k}2^{k-1}=3280.$$


But wait---the problem is asking for the number of nonnegative numbers, not just positive. So we need to find the cases where $\sum_{m=0}^{7} a_m3^m=0$. Fortunately, this only happens when $T=\emptyset$, so there is only $1$ case where this could happen. This could be verified with the fact that $\sum_{m=0}^{7} a_m3^m=0$ only occurs when $\{a_0, a_1, a_2, a_3, a_4, a_5, a_6, a_7\}=0$.
Therefore, the answer is $\boxed{\textbf{(D) }3281}$.

*~Marchk26*
## Video Solution by Pi Academy (FAST and easy)
https://youtu.be/cTb6AMpit5o?si=dKGnTcQlNHGLLJlD

*~Pi Academy*
## Video Solution
https://youtu.be/0xmbHDcUI2w

*~IceMatrix*
## See Also
