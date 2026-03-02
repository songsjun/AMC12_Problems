# 2012 AMC 12A Problem 24

## Problem
Let $\{a_k\}$_{$k=1}^{2011}$ be the sequence of real numbers defined by $a_1=0.201, a_2=(0.2011)^{a_1}$, $a_3=(0.20101)^{a_2}$, $a_4=(0.201011)^{a_3}$, and in general,


$$
a_k=\begin{cases}(0.\underbrace{20101\cdots 0101}_{k+2\text{ digits}})^{a_{k-1}}\qquad\text{if }k\text{ is odd,}\$0.\underbrace{20101\cdots 01011}_{k+2\text{ digits}})^{a_{k-1}}\qquad\text{if }k\text{ is even.}\end{cases}
$$


Rearranging the numbers in the sequence  $\{a_k\}$_{$k=1}^{2011} in$ decreasing order produces a new sequence  $\{b_k\}$_{$k=1$}^{2011}.  What is the sum of all integers k, $1\le$ k $\le 2011,$ such that $a_k=b_k$?

$\textbf{(A)}\ 671\qquad\textbf{(B)}\ 1006\qquad\textbf{(C)}\ 1341\qquad\textbf{(D)}\ 2011\qquad\textbf{(E)}\ 2012$
## Solution 1
First, we must understand two important functions: $f(x) = b^x$ for 0 < b < $1(decreasing exponential function)$, and $g(x) = x^k$ for k > $0(increasing power function for positive x)$. f(x) is used to establish inequalities when we change the *exponent* and keep the *base* constant. g(x) is used to establish inequalities when we change the *base* and keep the *exponent* constant.

We will now examine the first few terms.

Comparing $a_1$ and $a_2, 0 < a_1 = (0.201)^1 < (0.201)^{a_1}$ < ($0.2011)^{a_1}=a_2 < 1 \Rightarrow 0 <a_1<a_2 < 1$.

Therefore, 0 < $a_1<a_2 < 1$.

Comparing $a_2$ and $a_3, 0 < a_3 = (0.20101)^{a_2}$ < ($0.20101)^{a_1}$ < ($0.2011)^{a_1}=a_2 < 1 \Rightarrow 0 <a_3<a_2 < 1$.

Comparing $a_1$ and $a_3, 0 < a_1 = (0.201)^1 < (0.201)^{a_2}$ < ($0.20101)^{a_2}=a_3 < 1 \Rightarrow 0 <a_1<a_3 < 1$.

Therefore, 0 < $a_1<a_3 < a_2 < 1$.

Comparing $a_3$ and $a_4, 0 < a_3 = (0.20101)^{a_2}$ < ($0.20101)^{a_3}$ < ($0.201011)^{a_3}=a_4 < 1 \Rightarrow 0 <a_3<a_4 < 1$.

Comparing $a_2$ and $a_4, 0 < a_4 = (0.201011)^{a_3}$ < ($0.201011)^{a_1}$ < ($0.2011)^{a_1}=a_2 < 1 \Rightarrow 0 <a_4<a_2 < 1$.

Therefore, 0 < $a_1<a_3 < a_4<a_2 < 1$.

Continuing in this manner, it is easy to see a pattern(see Note 1).

Therefore, the only k when $a_k=b_k$ is when $2(k-1006) = 2011$ - k. Solving gives $\boxed{\textbf{(C)} 1341}.$

**Note 1**:
We claim that 0 < $a_1<a_3 < ... < a_{2011}<a_{2010}$ < ... < $a_4<a_2 < 1$.

We can use induction to prove this statement. (not necessary for AMC):

Base Case: We have already shown the base case above, where 0 < $a_1<a_2 < 1$.

Inductive Step:

Rearranging in decreasing order gives

$$1 > b_1 = a_2 > b_2 = a_4 > ... > b_{1005} = a_{2010} > b_{1006} = a_{2011} > ... > b_{2010} = a_3 > b_{2011} = a_1 > 0.$$

## Solution 2
Start by looking at the first few terms and comparing them to each other. We can see that $a_1<a_2$, and that $a_1<a_3 < a_2$, and that $a_3<a_4 < a_2$, and that $a_3<a_5 < a_4$ ...

From this, we find the pattern that $a_{k-1}<a_{k+1}<a_k$.

Examining this relationship, we see that every new number $a_k$ will be between the previous two terms, $a_{k-1}$ and $a_{k-2}$. Therefore, we can see that $a_1$ is the smallest number, $a_2$ is the largest number, and that all odd terms are less than even terms. Furthermore, we can see that for every odd k, $a_k<a_{k+2}$, and for every even k, $a_k>a_{k+2}$

This means that rearranging the terms in descending order will first have all the even terms from $a_2 to a_{2012}$, in that order, and then all odd terms from $a_{2011}$ to $a_1$, in that order (so $\{b_k\}$_{$k=1}^{2011} = {a_2, a_4, a_6, ... a_{2008}$, $a_{2010}$, $a_{2011}$, $a_{2009}$, ... $a_5, a_3, a_1$}).

We can clearly see that there will be no solution k where k is even, as the kth term in $\{a_k\}$_{$k=1}^{2011}$ will appear in the same position in its sequence as the 2kth term does in $\{a_k\}$_{$k=1}^{2011},$ where k is even. Therefore, we only have to look at the odd terms of $a_k$, which occur in the latter part of $b_k$.

Looking at the back of both sequences, we see that term k in $\{a_k\}$_{$k=1}^{2011}$ progresses backwards in the equation 2012 - k, and that term k in $\{a_k\}$_{$k=1}^{2011}$ progresses backwards in the equation $2k - 1$. Setting these two expressions equal to each other, we get 671.

However, remember that we started counting from the back of both sequences. So, plugging 671 back into either side of the equation from earlier, we get our answer of $\boxed{\textbf{(C)} 1341}.$

Sorry for the sloppy explanation. It's been two years since I've tried to give a solution to a problem, and this is the first time I've really used $\LaTeX.$ But I think this solution takes a different approach than the one above.
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2012amc12a/255

*~dolphin7*
## See Also
