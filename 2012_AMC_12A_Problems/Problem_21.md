# 2012 AMC 12A Problem 21

> This problem is the same as [2012 AMC 12A #21](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12A_Problems) and [2012 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10A_Problems).
## Problem
<!-- don't remove the following tag, for PoTW on the Wiki front page--><onlyinclude>Let $a$, $b$, and $c$ be positive integers with $a\geb\gec$ such that
$a^2-b^2-c^2+ab=2011$ and
$a^2+3b^2+3c^2-3ab-2ac-2bc=-1997$.

What is $a$?<!-- don't remove the following tag, for PoTW on the Wiki front page--></onlyinclude>

$\textbf{(A)}\ 249\qquad\textbf{(B)}\ 250\qquad\textbf{(C)}\ 251\qquad\textbf{(D)}\ 252\qquad\textbf{(E)}\ 253$
## Solution
Add the two equations.

$2a^2 + 2b^2 + 2c^2 - 2ab - 2ac - 2bc = 14$.

Now, this can be rearranged and factored.

$(a^2 - 2ab + b^2) + (a^2 - 2ac + c^2) + (b^2 - 2bc + c^2) = 14$

$(a - b)^2 + (a - c)^2 + (b - c)^2 = 14$

$a$, $b$, and $c$ are all integers, so the three terms on the left side of the equation must all be perfect squares.
We see that the only is possibility is $14 = 9 + 4 + 1$.

$(a-c)^2 = 9 \Rightarrow a-c = 3$, since $a-c$ is the biggest difference. It is impossible to determine by inspection whether $a-b = 1$ or $2$, or whether $b-c = 1$ or $2$.

We want to solve for $a$, so take the two cases and solve them each for an expression in terms of $a$. Our two cases are $(a, b, c) = (a, a-1, a-3)$ or $(a, a-2, a-3)$. Plug these values into one of the original equations to see if we can get an integer for $a$.

$a^2 - (a-1)^2 - (a-3)^2 + a(a-1) = 2011$, after some algebra, simplifies to
$7a = 2021$. $2021$ is not divisible by $7$, so $a$ is not an integer.

The other case gives $a^2 - (a-2)^2 - (a-3)^2 + a(a-2) = 2011$, which simplifies to $8a = 2024$. Thus, $a = 253$ and the answer is $\boxed{\textbf{(E)}\ 253}$.
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2012amc12a/250
## See Also
