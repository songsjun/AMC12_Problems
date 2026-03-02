# 2019 AMC 12A Problem 4

> This problem is the same as [2019 AMC 10A #5](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #4](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
What is the greatest number of consecutive integers whose sum is $45?$

$\textbf{(A) } 9 \qquad\textbf{(B) } 25 \qquad\textbf{(C) } 45 \qquad\textbf{(D) } 90 \qquad\textbf{(E) } 120$
## Solution 1
We might at first think that the answer would be $9$, because $1+2+3 \dots +n = 45$ when $n = 9$. But note that the problem says that they can be integers, not necessarily positive. Observe also that every term in the sequence $-44, -43, \cdots, 44, 45$ cancels out except $45$.  Thus, the answer is, intuitively, $\boxed{\textbf{(D) } 90 }$ integers.

Though impractical, a proof of maximality can proceed as follows:  Let the desired sequence of consecutive integers be $a, a+1, \cdots, a+(N-1)$, where there are $N$ terms, and we want to maximize $N$.  Then the sum of the terms in this sequence is aN $+ \frac{(N-1)(N)}{2}=45$.  Rearranging and factoring, this reduces to $N(2a+N-1) = 90$.  Since $N$ must divide $90$, and we know that $90$ is an attainable value of the sum, $90$ must be the maximum.
## Solution 2
To maximize the number of integers, we need to make the average of them as low as possible while still being positive. The average can be $\frac12$ if the middle two numbers are $0$ and $1$, so the answer is $\frac{45}{\frac12}=\boxed{\textbf{(D) } 90 }$.
### Solution 2a (more detailed ver. of Solution 2)
Note that the sum of $n$ consecutive integers whose mean (median; the two are equal in this case) is $a$ is equal to $an$. Here, we want to maximize $n$ such that $an=45$. The mean/median of a set of consecutive integers is either an integer or half of an integer; clearly, $n$ is maximized when $a=0.5$ and $n=\boxed{\textbf{(D) }90}$.

*~Technodoggo*
## Solution 3
If we want the answer to have as many terms as possible, we need to make as many terms cancel out as much as we can. Because $45 - 1 <\frac12$60 so we can eliminate $E$. Now lets make every integer cancel to zero except for $45$ and then we account for $0$ and $45$ to get $\boxed{\textbf{(D) }90}$. Pls help me clarify idk how to explain it clearer.


*~Twinotter*
*~Pungent_Muskrat (grammar and cleanup and latex)*
## Video Solution 1
https://youtu.be/ZhAZ1oPe5Ds?t=665

*~pi_is_3.14*
## Video Solution 2
https://youtu.be/ivYp-eNOIZA

*~savannahsolver*
## See Also
