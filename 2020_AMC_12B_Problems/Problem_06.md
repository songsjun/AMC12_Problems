# 2020 AMC 12B Problem 6

## Problem
For all integers n $\geq 9,$ the value of
$\frac{(n+2)!-(n+1)!}{n!}$is always which of the following?

$\textbf{(A) } \text{a multiple of 4} \qquad \textbf{(B) } \text{a multiple of 10} \qquad \textbf{(C) } \text{a prime number} \qquad \textbf{(D) } \text{a perfect square} \qquad \textbf{(E) } \text{a perfect cube}$
## Solution 1
We first expand the expression:
$$\frac{(n+2)!-(n+1)!}{n!} = \frac{(n+2)(n+1)n!-(n+1)n!}{n!}.$$
We can now divide out a common factor of n! from each term of the numerator:
$(n+2)(n+1)$-(n+1)$$.
Factoring out $(n+1)$, we get [$(n+2)-$1](n+1)$ = (n+1)^2$,
which proves that the answer is $\boxed{\textbf{(D) } \text{a perfect square}}.$
## Solution 2
In the numerator, we factor out an n! to get $\frac{(n+2)!-(n+1)!}{n!} = (n+2)(n+1)-(n+1).$ Now, without loss of generality, test values of n until only one answer choice is left valid:

- $n = 1\implies (3)(2) - (2) = 4,$ knocking out $\textbf{(B)},\textbf{(C)},$ and $\textbf{(E)}.$

- $n = 2\implies (4)(3) - (3) = 9,$ knocking out $\textbf{(A)}.$

This leaves $\boxed{\textbf{(D) } \text{a perfect square}}$ as the only answer choice left.

This solution does not consider the condition n $\geq 9.$ The reason is that, with further testing it becomes clear that for all n, we get $(n+2)(n+1)$-($n+1) = (n+1)^{2}$, as proved in Solution 1. The condition n $\geq 9$ was added most likely to encourage picking $\textbf{(B)}$ and discourage substituting smaller values into n.

*~DBlack2021 (Solution)*

*~MRENTHUSIASM (Edits in Logic)*

*~Countmath1 (Minor Edits in Formatting)*
## Video Solution (HOW TO THINK CRITICALLY!!!)
https://youtu.be/1_JHg-1kboE

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/ba6w1OhXqOQ?t=2234
## Video Solution
https://youtu.be/6ujfjGLzVoE
## See Also
